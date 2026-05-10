/**
 * Energy Calculation Engine
 * 
 * Physics-based solar energy estimation:
 * Daily Energy (kWh) = System Size (kW) × PSH × PR
 */

import { SYSTEM_DEFAULTS, getIrradiance, getIrradianceFromCoordinates } from "./constants";

export function calculateEnergy({
  systemSizeKW,
  city = "",
  state = "",
  lat = null,
  lng = null,
  electricityRate = SYSTEM_DEFAULTS.electricityRate,
  performanceRatio = SYSTEM_DEFAULTS.performanceRatio,
}) {
  // Determine irradiance (Peak Sun Hours)
  let irradiance = getIrradiance(city, state);
  if (irradiance === 5.0 && lat && lng) {
    irradiance = getIrradianceFromCoordinates(lat, lng);
  }

  // Daily generation
  const dailyGeneration = systemSizeKW * irradiance * performanceRatio;
  const monthlyGeneration = dailyGeneration * 30;
  const yearlyGeneration = dailyGeneration * 365;

  // CO₂ savings (kg)
  const co2SavingsYearly = yearlyGeneration * SYSTEM_DEFAULTS.co2FactorKgPerKWh;

  // Financial savings (₹)
  const yearlySavings = yearlyGeneration * electricityRate;
  const monthlySavings = monthlyGeneration * electricityRate;

  // System cost and payback
  const systemCost = systemSizeKW * 1000 * SYSTEM_DEFAULTS.systemCostPerWatt;
  const paybackYears = yearlySavings > 0 ? systemCost / yearlySavings : 0;

  // 25-year lifetime savings (accounting for degradation)
  let lifetimeSavings = 0;
  for (let year = 1; year <= SYSTEM_DEFAULTS.panelLifespanYears; year++) {
    const degradationFactor = 1 - SYSTEM_DEFAULTS.annualDegradation * year;
    lifetimeSavings += yearlySavings * degradationFactor;
  }

  return {
    irradiance: Math.round(irradiance * 10) / 10,
    dailyGeneration: Math.round(dailyGeneration * 10) / 10,
    monthlyGeneration: Math.round(monthlyGeneration),
    yearlyGeneration: Math.round(yearlyGeneration),
    co2SavingsYearly: Math.round(co2SavingsYearly),
    co2SavingsLifetime: Math.round(co2SavingsYearly * SYSTEM_DEFAULTS.panelLifespanYears),
    monthlySavings: Math.round(monthlySavings),
    yearlySavings: Math.round(yearlySavings),
    systemCost: Math.round(systemCost),
    paybackYears: Math.round(paybackYears * 10) / 10,
    lifetimeSavings: Math.round(lifetimeSavings),
    electricityRate,
    performanceRatio,
  };
}
