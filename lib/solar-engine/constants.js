/**
 * Solar Design Engine — shared configuration.
 *
 * Everything here is a market/engineering DEFAULT, editable in the UI or
 * per-deployment. Figures that change with policy (tariffs, subsidy) carry
 * an `asOf` marker and must be verified at proposal time.
 */

// ─── Panel Specifications ────────────────────────────────────────────────────
export const DEFAULT_PANEL = {
  lengthM: 2.2, // meters (long side)
  widthM: 1.1, // meters (short side)
  wattage: 550, // Wp per module
  efficiency: 0.2,
};

// ─── System Defaults ─────────────────────────────────────────────────────────
export const SYSTEM_DEFAULTS = {
  performanceRatio: 0.78, // inverter + wiring + soiling + temperature losses
  setbackDistanceM: 0.5,
  panelGapM: 0.02,
  rackingTiltDeg: 15, // typical Indian flat-roof racking tilt
  walkwayEveryNRows: 4,
  walkwayWidthM: 0.6,
  electricityRate: 8, // ₹/kWh fallback when state unknown
  tariffEscalation: 0.03, // 3%/yr, editable
  discountRate: 0.08, // for NPV
  systemCostPerWatt: 45, // ₹/Wp installed (asOf 2025, editable)
  co2FactorKgPerKWh: 0.82, // CEA Indian grid average (asOf 2024)
  panelLifespanYears: 25,
  degradationFirstYear: 0.02, // year-1 light-induced derate
  degradationAnnual: 0.0055, // compounding from year 2 (mono-PERC typical)
};

// ─── Residential tariff defaults by Indian state (₹/kWh, asOf 2025) ─────────
// Effective average for a mid-slab residential consumer; always editable.
export const STATE_TARIFFS = {
  "maharashtra": 11,
  "delhi": 7,
  "gujarat": 6.5,
  "karnataka": 8,
  "tamil nadu": 6.5,
  "uttar pradesh": 7,
  "rajasthan": 8,
  "telangana": 8,
  "andhra pradesh": 8,
  "west bengal": 8.5,
  "madhya pradesh": 7.5,
  "kerala": 8,
  "punjab": 7.5,
  "haryana": 7,
  "bihar": 8,
  "odisha": 6.5,
  "jharkhand": 6.5,
  "chhattisgarh": 6.5,
  "assam": 7.5,
  "goa": 4.5,
  "uttarakhand": 6.5,
  "himachal pradesh": 5.5,
};

export function getStateTariff(state = "") {
  return STATE_TARIFFS[state.toLowerCase().trim()] ?? SYSTEM_DEFAULTS.electricityRate;
}

// Standard residential/commercial string-inverter AC sizes (kW)
export const INVERTER_SIZES_KW = [1, 1.5, 2, 3, 3.7, 4, 5, 6, 8, 10, 12.5, 15, 20, 25, 30, 50];
