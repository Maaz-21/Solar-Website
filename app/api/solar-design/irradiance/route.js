import { NextResponse } from "next/server";
import { getOfflinePSH, specificYieldFromPSH } from "@/lib/solar-engine/energy/irradiance";

/**
 * GET /api/solar-design/irradiance?lat=..&lng=..&tilt=..&azimuth=..&city=..&state=..
 *
 * Location-specific solar resource with an honest source chain:
 *   1. PVGIS v5.2 (EU JRC) — satellite-derived, tilt/azimuth-aware, worldwide
 *      coverage except some polar/ocean areas, free, no key.
 *   2. NASA POWER climatology — global horizontal irradiance, free, no key.
 *   3. Offline PSH table / latitude heuristic (lib/solar-engine).
 *
 * Responses are cached in-memory per ~1 km grid cell + mounting geometry.
 * Returns { specificYield (kWh/kWp/yr), monthlyYieldPerKWp?, psh?, source }.
 */

const cache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 8000;

async function fetchJSON(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fromPVGIS(lat, lng, tilt, azimuth) {
  // PVGIS aspect: 0 = south, −90 = east, +90 = west.
  let aspect = azimuth - 180;
  if (aspect > 180) aspect -= 360;
  if (aspect < -180) aspect += 360;

  const url =
    `https://re.jrc.ec.europa.eu/api/v5_2/PVcalc?lat=${lat.toFixed(4)}&lon=${lng.toFixed(4)}` +
    `&peakpower=1&loss=14&angle=${Math.round(tilt)}&aspect=${Math.round(aspect)}&outputformat=json`;

  const data = await fetchJSON(url);
  const annual = data?.outputs?.totals?.fixed?.E_y;
  if (!annual || annual <= 0) return null;

  const monthly = data?.outputs?.monthly?.fixed?.map((m) => m.E_m) ?? null;
  return {
    specificYield: Math.round(annual),
    monthlyYieldPerKWp: monthly && monthly.length === 12 ? monthly : null,
    source: "pvgis",
  };
}

async function fromNASA(lat, lng) {
  const url =
    `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN` +
    `&community=RE&longitude=${lng.toFixed(4)}&latitude=${lat.toFixed(4)}&format=JSON`;

  const data = await fetchJSON(url);
  const psh = data?.properties?.parameter?.ALLSKY_SFC_SW_DWN?.ANN;
  if (!psh || psh <= 0) return null;

  return {
    specificYield: Math.round(specificYieldFromPSH(psh)),
    monthlyYieldPerKWp: null,
    psh: Math.round(psh * 100) / 100,
    source: "nasa-power",
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const tilt = Number(searchParams.get("tilt")) || 15;
  const azimuth = Number(searchParams.get("azimuth")) || 180;
  const city = searchParams.get("city") || "";
  const state = searchParams.get("state") || "";

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      { success: false, error: "lat and lng are required" },
      { status: 400 }
    );
  }

  const key = `${lat.toFixed(2)},${lng.toFixed(2)},${Math.round(tilt)},${Math.round(azimuth)}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return NextResponse.json({ success: true, ...cached.data, cached: true });
  }

  let result = await fromPVGIS(lat, lng, tilt, azimuth);
  if (!result) result = await fromNASA(lat, lng);
  if (!result) {
    const offline = getOfflinePSH({ city, state, lat, lng });
    result = {
      specificYield: Math.round(specificYieldFromPSH(offline.psh)),
      monthlyYieldPerKWp: null,
      psh: offline.psh,
      source: offline.source,
      note: offline.note,
    };
  }

  cache.set(key, { data: result, ts: Date.now() });
  return NextResponse.json({ success: true, ...result });
}
