/**
 * Panel placement engine v2.
 *
 * Packs panel rectangles into the usable roof geometry in a LOCAL METRIC
 * PLANE rotated so rows run parallel to the roof's longest edge — panels
 * follow the building, not north-south gridlines.
 *
 * Handles: Polygon and MultiPolygon usable areas (obstacle-split roofs),
 * holes, flush mounting (pitched roofs) vs tilted racking (flat roofs)
 * with standard winter-solstice inter-row spacing, and periodic
 * maintenance walkways.
 */

import {
  ringOrigin,
  geometryToPlane,
  rotatePoint,
  fromPlane,
  pointInPolygons,
} from "../geometry/plane";
import { DEFAULT_PANEL, SYSTEM_DEFAULTS } from "../constants";

/**
 * Inter-row pitch for tilted racking (standard shadow-clearance formula).
 * pitch = L·cosθ + L·sinθ / tan(α), α = solar elevation at winter-solstice
 * noon = 90° − |lat| − 23.45°, clamped to ≥ 10° for high latitudes.
 */
export function rowPitchM({ panelLengthM, tiltDeg, latitude }) {
  const t = (tiltDeg * Math.PI) / 180;
  const alphaDeg = Math.max(90 - Math.abs(latitude) - 23.45, 10);
  const alpha = (alphaDeg * Math.PI) / 180;
  const footprint = panelLengthM * Math.cos(t);
  const shadow = (panelLengthM * Math.sin(t)) / Math.tan(alpha);
  return footprint + shadow;
}

function testPoints(x, y, w, h) {
  // 4 corners, 4 edge midpoints, center — rejects rectangles that poke
  // out of concave notches without a full polygon-intersection test.
  return [
    [x, y], [x + w, y], [x + w, y + h], [x, y + h],
    [x + w / 2, y], [x + w / 2, y + h], [x, y + h / 2], [x + w, y + h / 2],
    [x + w / 2, y + h / 2],
  ];
}

/**
 * @param {Object} opts
 * @param {Object} opts.usableGeometry  GeoJSON Polygon|MultiPolygon (after setback + obstacles)
 * @param {number} opts.edgeBearing     Bearing of roof's longest edge (rows run parallel)
 * @param {number} opts.latitude       Site latitude (row-spacing formula)
 * @param {Object} opts.panelSpecs     { lengthM, widthM, wattage }
 * @param {number} opts.gapM           Gap between adjacent panels in a row
 * @param {string} opts.panelOrientation 'portrait' | 'landscape'
 * @param {number} opts.tiltDeg        Mounting tilt
 * @param {boolean} opts.flushMount    true = pitched roof (no shadow spacing)
 * @param {Object} opts.walkway        { everyNRows, widthM } (0 disables)
 * @param {number|null} opts.maxPanelCount
 */
export function generatePanelLayout({
  usableGeometry,
  edgeBearing = 90,
  latitude = 20,
  panelSpecs = DEFAULT_PANEL,
  gapM = SYSTEM_DEFAULTS.panelGapM,
  panelOrientation = "portrait",
  tiltDeg = 0,
  flushMount = true,
  walkway = { everyNRows: 0, widthM: 0.6 },
  maxPanelCount = null,
  roofAreaM2 = 0,
}) {
  const empty = {
    panels: [],
    panelCount: 0,
    systemSizeKW: 0,
    totalPanelArea: 0,
    roofUtilization: 0,
    panelOrientation,
    rowPitchM: 0,
    panelSpecs: {
      lengthM: panelSpecs.lengthM,
      widthM: panelSpecs.widthM,
      wattage: panelSpecs.wattage,
    },
  };
  if (!usableGeometry) return empty;

  const outerRing =
    usableGeometry.type === "Polygon"
      ? usableGeometry.coordinates[0]
      : usableGeometry.coordinates[0]?.[0];
  if (!outerRing?.length) return empty;

  // Panel footprint in the row frame: X along the row, Y across rows.
  const alongM = panelOrientation === "landscape" ? panelSpecs.lengthM : panelSpecs.widthM;
  const acrossM = panelOrientation === "landscape" ? panelSpecs.widthM : panelSpecs.lengthM;

  // Tilted racking shortens the horizontal footprint and adds shadow gaps.
  const tiltRad = (tiltDeg * Math.PI) / 180;
  const acrossFootprintM = flushMount ? acrossM : acrossM * Math.cos(tiltRad);
  const pitchM = flushMount
    ? acrossM + gapM
    : rowPitchM({ panelLengthM: acrossM, tiltDeg, latitude });

  // Project into the local plane and rotate so the longest edge runs along +X.
  const origin = ringOrigin(outerRing);
  const polygons = geometryToPlane(usableGeometry, origin);
  const bearingRad = (edgeBearing * Math.PI) / 180;
  // Bearing b (cw from north) has EN direction (sin b, cos b); rotating by
  // −atan2(cos b, sin b) maps that direction onto +X.
  const rot = -Math.atan2(Math.cos(bearingRad), Math.sin(bearingRad));
  const rotated = polygons.map((rings) => rings.map((ring) => ring.map((p) => rotatePoint(p, rot))));

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const rings of rotated) {
    for (const [x, y] of rings[0] ?? []) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (!Number.isFinite(minX)) return empty;

  const limit =
    Number.isFinite(maxPanelCount) && maxPanelCount > 0 ? Math.floor(maxPanelCount) : Infinity;
  const everyN = walkway?.everyNRows > 0 ? Math.floor(walkway.everyNRows) : 0;
  const walkwayM = walkway?.widthM > 0 ? walkway.widthM : 0;

  const panels = [];
  let y = minY;
  let row = 0;
  const maxIterations = 5000; // hard stop against degenerate inputs

  while (y + acrossFootprintM <= maxY && row < maxIterations) {
    let col = 0;
    for (let x = minX; x + alongM <= maxX; x += alongM + gapM) {
      const pts = testPoints(x, y, alongM, acrossFootprintM);
      if (pts.every((p) => pointInPolygons(p, rotated))) {
        if (panels.length >= limit) break;
        const cornersLocal = [
          [x, y], [x + alongM, y],
          [x + alongM, y + acrossFootprintM], [x, y + acrossFootprintM],
          [x, y],
        ];
        const ringLngLat = cornersLocal.map((p) => fromPlane(rotatePoint(p, -rot), origin));
        const centerLngLat = fromPlane(
          rotatePoint([x + alongM / 2, y + acrossFootprintM / 2], -rot),
          origin
        );
        panels.push({
          id: `r${row}c${col}`,
          coordinates: [ringLngLat],
          center: centerLngLat,
          row,
          col,
          orientation: panelOrientation,
        });
      }
      col++;
    }
    if (panels.length >= limit) break;
    row++;
    y += pitchM;
    if (everyN && row % everyN === 0) y += walkwayM;
  }

  const count = panels.length;
  const moduleArea = count * panelSpecs.lengthM * panelSpecs.widthM;

  return {
    panels,
    panelCount: count,
    systemSizeKW: Math.round((count * panelSpecs.wattage) / 10) / 100,
    totalPanelArea: Math.round(moduleArea * 100) / 100,
    roofUtilization:
      roofAreaM2 > 0 ? Math.round((moduleArea / roofAreaM2) * 1000) / 10 : 0,
    panelOrientation,
    rowPitchM: Math.round(pitchM * 100) / 100,
    panelSpecs: {
      lengthM: panelSpecs.lengthM,
      widthM: panelSpecs.widthM,
      wattage: panelSpecs.wattage,
    },
  };
}

/** Try portrait and landscape; keep whichever fits more panels. */
export function generateOptimalLayout(params) {
  const portrait = generatePanelLayout({ ...params, panelOrientation: "portrait" });
  const landscape = generatePanelLayout({ ...params, panelOrientation: "landscape" });
  return portrait.panelCount >= landscape.panelCount ? portrait : landscape;
}
