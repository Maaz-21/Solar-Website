import { NextResponse } from "next/server";
import { getOfflinePSH, specificYieldFromPSH } from "@/lib/solar-engine/energy/irradiance";
import { buildEnergyReport } from "@/lib/solar-engine/energy/production";
import { getStateTariff } from "@/lib/solar-engine/constants";

/**
 * POST /api/solar-design/calculate-energy
 *
 * Offline-table energy report (no remote irradiance fetch). The Design
 * Studio itself calls /api/solar-design/irradiance and builds the report
 * client-side; this route remains for external integrations.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { systemSizeKW, city, state, lat, lng, electricityRate, panelCount = 0, subsidySchemeId } = body;

    if (!systemSizeKW || systemSizeKW <= 0) {
      return NextResponse.json(
        { success: false, error: "Valid system size is required" },
        { status: 400 }
      );
    }

    const offline = getOfflinePSH({ city: city || "", state: state || "", lat, lng });
    const energyReport = buildEnergyReport({
      systemSizeKW,
      specificYield: specificYieldFromPSH(offline.psh),
      yieldSource: offline.source,
      tariff: electricityRate || getStateTariff(state || ""),
      panelCount,
      subsidySchemeId: subsidySchemeId || "pm-surya-ghar",
    });

    return NextResponse.json({ success: true, energyReport });
  } catch (error) {
    console.error("Error calculating energy:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
