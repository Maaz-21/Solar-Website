/**
 * Solar Design Engine — public API.
 *
 * Pure, isomorphic modules: everything here runs in the browser for live
 * feedback, and on the server for the API routes. No side effects, no I/O.
 */

export { DEFAULT_PANEL, SYSTEM_DEFAULTS, STATE_TARIFFS, getStateTariff, INVERTER_SIZES_KW } from "./constants";

export {
  toPlane, fromPlane, projectRing, unprojectRing, geometryToPlane,
  rotatePoint, pointInRing, pointInPolygons, segmentLengthM, ringOrigin,
} from "./geometry/plane";

export { validatePolygon, MIN_ROOF_AREA_M2 } from "./geometry/polygon";

export {
  calculateRoofArea, calculatePerimeter, longestEdgeBearing,
  calculateRoofOrientation, calculateRoofDimensions, applySetback,
  subtractObstacles, obstacleCoverage, obstaclesOverlap, computeRoofMetrics,
} from "./geometry/roof";

export { generatePanelLayout, generateOptimalLayout, rowPitchM } from "./placement/packer";

export { IRRADIANCE_DATA, getOfflinePSH, specificYieldFromPSH } from "./energy/irradiance";
export { recommendSystemSize, buildEnergyReport } from "./energy/production";

export { calculateSubsidy, SUBSIDY_SCHEMES } from "./financial/subsidy";
export { buildCashflow } from "./financial/roi";

export { recommendInverter, recommendStrings } from "./system/inverter";

export { runQualityChecks, hasBlockers } from "./quality/checks";
export { assessConfidence } from "./quality/confidence";
