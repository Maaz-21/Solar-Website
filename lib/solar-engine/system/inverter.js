/**
 * Indicative inverter and string sizing.
 *
 * These are PRE-SALES figures using accepted rules of thumb
 * (DC/AC ratio 1.1–1.35, string length within a typical MPPT window).
 * Final electrical design is always done by the installer against the
 * actual module and inverter datasheets — the UI labels them accordingly.
 */

import { INVERTER_SIZES_KW } from "../constants";

export function recommendInverter(dcKW) {
  if (!dcKW || dcKW <= 0) return null;

  let best = null;
  for (const ac of INVERTER_SIZES_KW) {
    const ratio = dcKW / ac;
    if (ratio < 1.05 || ratio > 1.45) continue;
    const score = Math.abs(ratio - 1.2);
    if (!best || score < best.score) best = { acKW: ac, ratio, score };
  }
  // Very small or in-between systems: take the closest size below DC.
  if (!best) {
    const below = [...INVERTER_SIZES_KW].reverse().find((s) => s <= dcKW) ?? INVERTER_SIZES_KW[0];
    best = { acKW: below, ratio: dcKW / below };
  }

  return {
    acCapacityKW: best.acKW,
    dcAcRatio: Math.round(best.ratio * 100) / 100,
    indicative: true,
  };
}

/**
 * Split N panels into strings of 8–14 (typical 550 Wp module ≈ 50 V Voc,
 * 1000 V system limit, MPPT floor ≈ 200 V).
 */
export function recommendStrings(panelCount) {
  if (!panelCount || panelCount <= 0) return null;
  if (panelCount < 8) {
    return { strings: 1, panelsPerString: panelCount, remainder: 0, indicative: true };
  }

  let best = null;
  for (let per = 14; per >= 8; per--) {
    const strings = Math.floor(panelCount / per);
    const remainder = panelCount % per;
    const score = remainder === 0 ? 0 : per - remainder; // prefer even fill
    if (!best || score < best.score) best = { strings, per, remainder, score };
    if (score === 0) break;
  }

  return {
    strings: best.strings + (best.remainder > 0 ? 1 : 0),
    panelsPerString: best.per,
    remainder: best.remainder,
    indicative: true,
  };
}
