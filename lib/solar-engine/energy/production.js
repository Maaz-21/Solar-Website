/**
 * Energy report builder — the single source of truth for generation and
 * financial figures. The Energy step's recommendation and the final
 * proposal both call these functions with the same inputs, so the numbers
 * can never disagree.
 *
 * Core model: annual = kWp × specificYield (kWh/kWp/yr), where the yield
 * comes from PVGIS (tilt/azimuth-aware) when reachable, else NASA POWER,
 * else the offline PSH table (see energy/irradiance.js).
 */

import { SYSTEM_DEFAULTS } from "../constants";
import { calculateSubsidy } from "../financial/subsidy";
import { buildCashflow } from "../financial/roi";
import { recommendInverter, recommendStrings } from "../system/inverter";

/**
 * Recommend a system size from consumption. EV / battery toggles apply
 * standard load uplifts; the same specific yield used in the final report
 * keeps the recommendation consistent.
 */
export function recommendSystemSize({
  monthlyUsageKWh,
  coverage = 100,
  evCharging = false,
  batteryBackup = false,
  specificYield,
}) {
  if (!monthlyUsageKWh || monthlyUsageKWh <= 0 || !specificYield) return null;

  let annualTarget = monthlyUsageKWh * 12 * (coverage / 100);
  if (evCharging) annualTarget *= 1.15; // typical single-EV home charging uplift
  if (batteryBackup) annualTarget *= 1.1; // battery round-trip losses

  return {
    targetAnnualKWh: Math.round(annualTarget),
    recommendedKW: Math.round((annualTarget / specificYield) * 10) / 10,
  };
}

/**
 * Build the complete energy + financial report.
 *
 * @param {Object} opts
 * @param {number} opts.systemSizeKW
 * @param {number} opts.specificYield   kWh/kWp/yr
 * @param {string} opts.yieldSource     'pvgis' | 'nasa-power' | 'table' | 'latitude-estimate'
 * @param {Array|null} opts.monthlyYieldPerKWp  12 values (kWh/kWp/month) if the source provides them
 * @param {number} opts.tariff          ₹/kWh
 * @param {number} opts.panelCount
 * @param {string} opts.subsidySchemeId 'pm-surya-ghar' | 'none'
 */
export function buildEnergyReport({
  systemSizeKW,
  specificYield,
  yieldSource = "table",
  monthlyYieldPerKWp = null,
  tariff = SYSTEM_DEFAULTS.electricityRate,
  panelCount = 0,
  subsidySchemeId = "pm-surya-ghar",
  costPerWatt = SYSTEM_DEFAULTS.systemCostPerWatt,
  escalation = SYSTEM_DEFAULTS.tariffEscalation,
  co2Factor = SYSTEM_DEFAULTS.co2FactorKgPerKWh,
}) {
  if (!systemSizeKW || systemSizeKW <= 0 || !specificYield) return null;

  const annualGeneration = systemSizeKW * specificYield;
  const monthlyGeneration = monthlyYieldPerKWp
    ? monthlyYieldPerKWp.map((m) => Math.round(m * systemSizeKW))
    : null;

  const grossCost = systemSizeKW * 1000 * costPerWatt;
  const subsidy = calculateSubsidy(systemSizeKW, subsidySchemeId);
  const netCost = Math.max(grossCost - subsidy.amount, 0);

  const cashflow = buildCashflow({
    annualGenerationYr0: annualGeneration,
    tariff,
    netCost,
    escalation,
  });

  return {
    systemSizeKW,
    specificYield: Math.round(specificYield),
    yieldSource,
    annualGeneration: Math.round(annualGeneration),
    monthlyGeneration,
    monthlyAverage: Math.round(annualGeneration / 12),
    dailyAverage: Math.round((annualGeneration / 365) * 10) / 10,
    tariff,
    co2SavingsYearlyKg: Math.round(annualGeneration * co2Factor),
    co2SavingsLifetimeKg: Math.round(cashflow.lifetimeGeneration * co2Factor),
    financial: {
      grossCost: Math.round(grossCost),
      subsidyAmount: subsidy.amount,
      subsidyScheme: subsidy.schemeName,
      subsidyAsOf: subsidy.asOf,
      netCost: Math.round(netCost),
      firstYearSavings: cashflow.yearly[0]?.savings ?? 0,
      monthlySavings: Math.round((cashflow.yearly[0]?.savings ?? 0) / 12),
      paybackYears: cashflow.paybackYears,
      lifetimeSavings: cashflow.lifetimeSavings,
      npv: cashflow.npv,
      escalation,
    },
    system: {
      inverter: recommendInverter(systemSizeKW),
      strings: recommendStrings(panelCount),
    },
    assumptions: {
      performanceRatio: SYSTEM_DEFAULTS.performanceRatio,
      degradationFirstYear: SYSTEM_DEFAULTS.degradationFirstYear,
      degradationAnnual: SYSTEM_DEFAULTS.degradationAnnual,
      lifespanYears: SYSTEM_DEFAULTS.panelLifespanYears,
      costPerWatt,
      note: "Estimates based on typical conditions; final values require an on-site survey.",
    },
  };
}
