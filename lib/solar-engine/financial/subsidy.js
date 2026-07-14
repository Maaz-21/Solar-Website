/**
 * Government subsidy calculation — data-driven, never hard-coded in formulas.
 *
 * Default scheme: PM Surya Ghar Muft Bijli Yojana (residential rooftop).
 * Slabs asOf 2025 — verify against the national portal at proposal time:
 *   ₹30,000/kW up to 2 kW, ₹18,000 for capacity between 2 and 3 kW,
 *   capped at ₹78,000. Above 3 kW no additional subsidy.
 */

export const SUBSIDY_SCHEMES = {
  "pm-surya-ghar": {
    id: "pm-surya-ghar",
    name: "PM Surya Ghar Muft Bijli Yojana",
    asOf: "2025",
    country: "India",
    residentialOnly: true,
    slabs: [
      { uptoKW: 2, ratePerKW: 30000 },
      { uptoKW: 3, ratePerKW: 18000 },
    ],
    capAmount: 78000,
  },
  "none": {
    id: "none",
    name: "No subsidy",
    asOf: "-",
    slabs: [],
    capAmount: 0,
  },
};

/**
 * @returns {{ amount: number, schemeName: string, asOf: string, breakdown: Array }}
 */
export function calculateSubsidy(systemSizeKW, schemeId = "pm-surya-ghar") {
  const scheme = SUBSIDY_SCHEMES[schemeId] ?? SUBSIDY_SCHEMES["none"];
  let remaining = Math.max(systemSizeKW, 0);
  let covered = 0;
  let amount = 0;
  const breakdown = [];

  for (const slab of scheme.slabs) {
    const slabCapacity = Math.max(Math.min(remaining, slab.uptoKW - covered), 0);
    if (slabCapacity <= 0) continue;
    const slabAmount = slabCapacity * slab.ratePerKW;
    breakdown.push({
      kW: Math.round(slabCapacity * 100) / 100,
      ratePerKW: slab.ratePerKW,
      amount: Math.round(slabAmount),
    });
    amount += slabAmount;
    covered += slabCapacity;
    remaining -= slabCapacity;
  }

  if (scheme.capAmount > 0) amount = Math.min(amount, scheme.capAmount);

  return {
    amount: Math.round(amount),
    schemeId: scheme.id,
    schemeName: scheme.name,
    asOf: scheme.asOf,
    breakdown,
  };
}
