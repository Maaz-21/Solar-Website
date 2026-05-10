/**
 * Panel Placement Engine
 * 
 * Core geometry algorithm that tessellates a usable roof polygon
 * with solar panel rectangles using Turf.js.
 */

import * as turf from "@turf/turf";
import { DEFAULT_PANEL, SYSTEM_DEFAULTS } from "./constants";

function metersToDegrees(meters, lat, direction = "lng") {
  if (direction === "lat") return meters / 111320;
  return meters / (111320 * Math.cos((lat * Math.PI) / 180));
}

function createPanelRectangle(cx, cy, wDeg, hDeg) {
  const hw = wDeg / 2, hh = hDeg / 2;
  return turf.polygon([[
    [cx - hw, cy - hh], [cx + hw, cy - hh],
    [cx + hw, cy + hh], [cx - hw, cy + hh],
    [cx - hw, cy - hh],
  ]]);
}

export function generatePanelLayout({
  usableGeometry, orientation = 180,
  panelSpecs = DEFAULT_PANEL, gapM = SYSTEM_DEFAULTS.panelGapM,
  panelOrientation = "portrait", roofAreaM2 = 0,
}) {
  if (!usableGeometry) {
    return { panels: [], panelCount: 0, systemSizeKW: 0, totalPanelArea: 0, roofUtilization: 0 };
  }

  const usable = turf.feature(usableGeometry);
  let panelW, panelH;
  if (panelOrientation === "landscape") {
    panelW = panelSpecs.lengthM; panelH = panelSpecs.widthM;
  } else {
    panelW = panelSpecs.widthM; panelH = panelSpecs.lengthM;
  }

  const [minLng, minLat, maxLng, maxLat] = turf.bbox(usable);
  const refLat = (minLat + maxLat) / 2;
  const cellW = metersToDegrees(panelW + gapM, refLat, "lng");
  const cellH = metersToDegrees(panelH + gapM, refLat, "lat");
  const pW = metersToDegrees(panelW, refLat, "lng");
  const pH = metersToDegrees(panelH, refLat, "lat");

  const panels = [];
  let y = minLat + cellH / 2, row = 0;

  while (y < maxLat) {
    let x = minLng + cellW / 2;
    while (x < maxLng) {
      try {
        const rect = createPanelRectangle(x, y, pW, pH);
        if (turf.booleanContains(usable, rect)) {
          panels.push({ coordinates: rect.geometry.coordinates, center: [x, y], orientation: panelOrientation, row });
        }
      } catch { /* skip */ }
      x += cellW;
    }
    y += cellH; row++;
  }

  const count = panels.length;
  const sizeKW = (count * panelSpecs.wattage) / 1000;
  const area = count * panelSpecs.lengthM * panelSpecs.widthM;

  return {
    panels, panelCount: count,
    systemSizeKW: Math.round(sizeKW * 100) / 100,
    totalPanelArea: Math.round(area * 100) / 100,
    roofUtilization: roofAreaM2 > 0 ? Math.round((area / roofAreaM2) * 1000) / 10 : 0,
    panelOrientation,
    panelSpecs: { lengthM: panelSpecs.lengthM, widthM: panelSpecs.widthM, wattage: panelSpecs.wattage },
  };
}

export function generateOptimalLayout(params) {
  const portrait = generatePanelLayout({ ...params, panelOrientation: "portrait" });
  const landscape = generatePanelLayout({ ...params, panelOrientation: "landscape" });
  return portrait.panelCount >= landscape.panelCount ? portrait : landscape;
}
