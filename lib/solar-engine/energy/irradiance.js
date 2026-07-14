/**
 * Irradiance sourcing — offline layer.
 *
 * The authoritative sources are remote (PVGIS, NASA POWER) and are fetched
 * through /api/solar-design/irradiance. This module holds the offline
 * fallback chain: Indian city/state Peak-Sun-Hours table → coarse latitude
 * heuristic. Every value carries a `source` tag so the UI can label
 * estimates honestly.
 *
 * PSH = average daily kWh/m² on the horizontal plane.
 */

import { SYSTEM_DEFAULTS } from "../constants";

// Source: MNRE / Global Solar Atlas approximate values
export const IRRADIANCE_DATA = {
  cities: {
    "mumbai": 5.0, "delhi": 5.5, "bangalore": 5.4, "bengaluru": 5.4,
    "chennai": 5.2, "kolkata": 4.8, "hyderabad": 5.6, "pune": 5.3,
    "ahmedabad": 5.8, "jaipur": 5.9, "lucknow": 5.1, "nagpur": 5.5,
    "indore": 5.4, "bhopal": 5.3, "patna": 4.9, "vadodara": 5.6,
    "surat": 5.4, "coimbatore": 5.3, "visakhapatnam": 5.3, "kochi": 4.9,
    "thiruvananthapuram": 5.0, "chandigarh": 5.2, "dehradun": 5.0,
    "bhubaneswar": 5.1, "ranchi": 5.0, "guwahati": 4.5, "jammu": 5.0,
    "shimla": 4.8, "jodhpur": 6.2, "udaipur": 5.8, "aurangabad": 5.5,
    "nashik": 5.4, "rajkot": 5.7, "raipur": 5.2, "goa": 5.1,
    "mangalore": 5.0, "mysore": 5.3, "madurai": 5.5, "varanasi": 5.0,
    "agra": 5.4, "meerut": 5.2, "amritsar": 5.3, "ludhiana": 5.2,
    "kanpur": 5.1, "noida": 5.5, "gurgaon": 5.5, "faridabad": 5.5,
    "thane": 5.0, "navi mumbai": 5.0, "bikaner": 6.3, "barmer": 6.4,
  },
  states: {
    "rajasthan": 6.0, "gujarat": 5.6, "maharashtra": 5.3,
    "madhya pradesh": 5.4, "karnataka": 5.4, "andhra pradesh": 5.5,
    "telangana": 5.5, "tamil nadu": 5.3, "uttar pradesh": 5.1,
    "haryana": 5.4, "punjab": 5.2, "kerala": 4.9, "odisha": 5.1,
    "west bengal": 4.8, "bihar": 4.9, "jharkhand": 5.0,
    "chhattisgarh": 5.2, "assam": 4.5, "goa": 5.1, "uttarakhand": 5.0,
    "himachal pradesh": 4.8, "jammu and kashmir": 5.0, "meghalaya": 4.3,
    "tripura": 4.4, "manipur": 4.5, "mizoram": 4.4, "nagaland": 4.4,
    "arunachal pradesh": 4.3, "sikkim": 4.2, "delhi": 5.5,
    "puducherry": 5.3, "chandigarh": 5.2, "ladakh": 5.8,
  },
  default: 5.0,
};

const INDIA_BOUNDS = { minLat: 6, maxLat: 38, minLng: 68, maxLng: 98 };

function isInIndia(lat, lng) {
  return (
    lat >= INDIA_BOUNDS.minLat && lat <= INDIA_BOUNDS.maxLat &&
    lng >= INDIA_BOUNDS.minLng && lng <= INDIA_BOUNDS.maxLng
  );
}

/**
 * Offline PSH lookup. Returns { psh, source, note }.
 * Outside India, a coarse latitude heuristic keeps the tool functional
 * offline but is clearly tagged — the remote sources override it whenever
 * reachable.
 */
export function getOfflinePSH({ city = "", state = "", lat = null, lng = null }) {
  const cityKey = city.toLowerCase().trim();
  const stateKey = state.toLowerCase().trim();

  if (IRRADIANCE_DATA.cities[cityKey]) {
    return { psh: IRRADIANCE_DATA.cities[cityKey], source: "table", note: `City table: ${city}` };
  }
  if (IRRADIANCE_DATA.states[stateKey]) {
    return { psh: IRRADIANCE_DATA.states[stateKey], source: "table", note: `State table: ${state}` };
  }

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    if (isInIndia(lat, lng)) {
      // Thar desert belt peaks; coasts and the northeast run lower.
      let psh = 5.3;
      if (lat >= 24 && lat <= 28 && lng >= 68 && lng <= 76) psh = 6.0;
      else if (lat >= 20 && lat <= 30) psh = 5.5;
      else if (lat >= 15 && lat < 20) psh = 5.3;
      else if (lat >= 8 && lat < 15) psh = 5.1;
      else if (lat > 30) psh = 5.0;
      return { psh, source: "table", note: "Indian regional estimate" };
    }
    // Coarse global heuristic — placeholder until PVGIS/NASA responds.
    const psh = Math.min(Math.max(5.5 - 0.055 * Math.max(Math.abs(lat) - 10, 0), 2.5), 5.8);
    return {
      psh: Math.round(psh * 10) / 10,
      source: "latitude-estimate",
      note: "Coarse latitude-based estimate — remote irradiance data unavailable",
    };
  }

  return { psh: IRRADIANCE_DATA.default, source: "table", note: "National average fallback" };
}

/**
 * Annual specific yield (kWh per kWp per year) from a PSH figure.
 * Conservative: horizontal-plane PSH, no tilt gain applied.
 */
export function specificYieldFromPSH(psh, performanceRatio = SYSTEM_DEFAULTS.performanceRatio) {
  return psh * 365 * performanceRatio;
}
