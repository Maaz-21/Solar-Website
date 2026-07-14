/**
 * Financial analysis: 25-year cash flow with generation degradation
 * (year-1 derate, then compounding) and tariff escalation; simple payback
 * (interpolated) and NPV at a configurable discount rate.
 */

import { SYSTEM_DEFAULTS } from "../constants";

/**
 * @param {Object} opts
 * @param {number} opts.annualGenerationYr0 Nameplate first-year generation before derate (kWh)
 * @param {number} opts.tariff             ₹/kWh today
 * @param {number} opts.netCost            System cost after subsidy (₹)
 * @returns cashflow summary
 */
export function buildCashflow({
  annualGenerationYr0,
  tariff,
  netCost,
  years = SYSTEM_DEFAULTS.panelLifespanYears,
  escalation = SYSTEM_DEFAULTS.tariffEscalation,
  degradationFirstYear = SYSTEM_DEFAULTS.degradationFirstYear,
  degradationAnnual = SYSTEM_DEFAULTS.degradationAnnual,
  discountRate = SYSTEM_DEFAULTS.discountRate,
}) {
  const yearly = [];
  let cumulative = 0;
  let npv = -netCost;
  let paybackYears = null;

  for (let year = 1; year <= years; year++) {
    const degradationFactor =
      (1 - degradationFirstYear) * Math.pow(1 - degradationAnnual, Math.max(year - 1, 0));
    const generation = annualGenerationYr0 * degradationFactor;
    const effectiveTariff = tariff * Math.pow(1 + escalation, year - 1);
    const savings = generation * effectiveTariff;

    const prevCumulative = cumulative;
    cumulative += savings;
    npv += savings / Math.pow(1 + discountRate, year);

    if (paybackYears === null && cumulative >= netCost && savings > 0) {
      paybackYears = year - 1 + (netCost - prevCumulative) / savings;
    }

    yearly.push({
      year,
      generation: Math.round(generation),
      savings: Math.round(savings),
      cumulative: Math.round(cumulative),
    });
  }

  return {
    yearly,
    lifetimeSavings: Math.round(cumulative),
    lifetimeGeneration: yearly.reduce((sum, y) => sum + y.generation, 0),
    paybackYears: paybackYears !== null ? Math.round(paybackYears * 10) / 10 : null,
    npv: Math.round(npv),
  };
}
