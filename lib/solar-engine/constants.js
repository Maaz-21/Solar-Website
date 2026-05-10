/**
 * Solar Design Engine — Constants & Configuration
 * 
 * Central configuration for panel specs, energy calculations,
 * and irradiance data across Indian cities/states.
 */

// ─── Panel Specifications ────────────────────────────────────────────────────
export const DEFAULT_PANEL = {
  lengthM: 2.2,        // meters (along the longer side)
  widthM: 1.1,         // meters (along the shorter side)
  wattage: 550,        // watts per panel
  efficiency: 0.20,    // 20% module efficiency
};

// ─── System Defaults ─────────────────────────────────────────────────────────
export const SYSTEM_DEFAULTS = {
  performanceRatio: 0.75,          // PR accounts for inverter, wiring, temp losses
  setbackDistanceM: 0.5,          // meters from roof edge
  panelGapM: 0.02,                // 2cm gap between panels
  electricityRate: 8,             // ₹/kWh (average Indian residential rate)
  systemCostPerWatt: 45,          // ₹/Watt installed (Indian market average)
  co2FactorKgPerKWh: 0.82,       // kg CO₂ per kWh (Indian grid average)
  panelLifespanYears: 25,
  annualDegradation: 0.005,       // 0.5% per year
};

// ─── Irradiance Data (Peak Sun Hours by Indian State/City) ───────────────────
// Source: MNRE / NREL / Global Solar Atlas approximate values
// Values represent average daily Peak Sun Hours (PSH) in kWh/m²/day
export const IRRADIANCE_DATA = {
  // Major cities
  cities: {
    "mumbai": 5.0,
    "delhi": 5.5,
    "bangalore": 5.4,
    "chennai": 5.2,
    "kolkata": 4.8,
    "hyderabad": 5.6,
    "pune": 5.3,
    "ahmedabad": 5.8,
    "jaipur": 5.9,
    "lucknow": 5.1,
    "nagpur": 5.5,
    "indore": 5.4,
    "bhopal": 5.3,
    "patna": 4.9,
    "vadodara": 5.6,
    "surat": 5.4,
    "coimbatore": 5.3,
    "visakhapatnam": 5.3,
    "kochi": 4.9,
    "thiruvananthapuram": 5.0,
    "chandigarh": 5.2,
    "dehradun": 5.0,
    "bhubaneswar": 5.1,
    "ranchi": 5.0,
    "guwahati": 4.5,
    "jammu": 5.0,
    "shimla": 4.8,
    "jodhpur": 6.2,
    "udaipur": 5.8,
    "aurangabad": 5.5,
    "nashik": 5.4,
    "rajkot": 5.7,
    "raipur": 5.2,
    "goa": 5.1,
    "mangalore": 5.0,
    "mysore": 5.3,
    "madurai": 5.5,
    "varanasi": 5.0,
    "agra": 5.4,
    "meerut": 5.2,
    "amritsar": 5.3,
    "ludhiana": 5.2,
    "kanpur": 5.1,
    "noida": 5.5,
    "gurgaon": 5.5,
    "faridabad": 5.5,
    "thane": 5.0,
    "navi mumbai": 5.0,
    "bikaner": 6.3,
    "barmer": 6.4,
  },

  // State-level averages (fallback)
  states: {
    "rajasthan": 6.0,
    "gujarat": 5.6,
    "maharashtra": 5.3,
    "madhya pradesh": 5.4,
    "karnataka": 5.4,
    "andhra pradesh": 5.5,
    "telangana": 5.5,
    "tamil nadu": 5.3,
    "uttar pradesh": 5.1,
    "haryana": 5.4,
    "punjab": 5.2,
    "kerala": 4.9,
    "odisha": 5.1,
    "west bengal": 4.8,
    "bihar": 4.9,
    "jharkhand": 5.0,
    "chhattisgarh": 5.2,
    "assam": 4.5,
    "goa": 5.1,
    "uttarakhand": 5.0,
    "himachal pradesh": 4.8,
    "jammu and kashmir": 5.0,
    "meghalaya": 4.3,
    "tripura": 4.4,
    "manipur": 4.5,
    "mizoram": 4.4,
    "nagaland": 4.4,
    "arunachal pradesh": 4.3,
    "sikkim": 4.2,
    "delhi": 5.5,
    "puducherry": 5.3,
    "chandigarh": 5.2,
    "ladakh": 5.8,
  },

  // Default fallback for unknown locations (Indian average)
  default: 5.0,
};

// ─── Lookup function ─────────────────────────────────────────────────────────
/**
 * Get irradiance (PSH) for a given city or state.
 * Falls back to state average, then national default.
 */
export function getIrradiance(city = "", state = "") {
  const cityKey = city.toLowerCase().trim();
  const stateKey = state.toLowerCase().trim();

  if (IRRADIANCE_DATA.cities[cityKey]) {
    return IRRADIANCE_DATA.cities[cityKey];
  }
  if (IRRADIANCE_DATA.states[stateKey]) {
    return IRRADIANCE_DATA.states[stateKey];
  }
  return IRRADIANCE_DATA.default;
}

/**
 * Estimate irradiance from latitude (rough approximation).
 * More accurate than a flat default when we only have coordinates.
 * Based on simplified model for Indian subcontinent (8°N - 37°N).
 */
export function getIrradianceFromCoordinates(lat, lng) {
  // India's solar belt: lower latitudes get slightly less due to humidity,
  // Rajasthan desert belt (24-28°N) gets maximum
  if (lat >= 24 && lat <= 28 && lng >= 68 && lng <= 76) {
    return 6.0; // Thar desert belt
  }
  if (lat >= 20 && lat <= 30) {
    return 5.5; // Central-Western India
  }
  if (lat >= 8 && lat <= 15) {
    return 5.1; // Southern India (coastal humidity)
  }
  if (lat >= 15 && lat <= 20) {
    return 5.3; // South-Central India
  }
  if (lat >= 30) {
    return 5.0; // Northern India
  }
  return IRRADIANCE_DATA.default;
}
