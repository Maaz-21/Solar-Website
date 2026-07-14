import { describe, it, expect } from "vitest";
import { calculateSubsidy } from "../financial/subsidy";
import { buildCashflow } from "../financial/roi";
import { buildEnergyReport, recommendSystemSize } from "../energy/production";
import { recommendInverter, recommendStrings } from "../system/inverter";
import { runQualityChecks, hasBlockers } from "../quality/checks";
import { assessConfidence } from "../quality/confidence";
import { fromPlane } from "../geometry/plane";
import { computeRoofMetrics } from "../geometry/roof";

describe("PM Surya Ghar subsidy slabs", () => {
  it("1 kW → ₹30,000", () => expect(calculateSubsidy(1).amount).toBe(30000));
  it("2 kW → ₹60,000", () => expect(calculateSubsidy(2).amount).toBe(60000));
  it("3 kW → ₹78,000 (cap)", () => expect(calculateSubsidy(3).amount).toBe(78000));
  it("10 kW → ₹78,000 (cap holds)", () => expect(calculateSubsidy(10).amount).toBe(78000));
  it("2.5 kW → ₹69,000", () => expect(calculateSubsidy(2.5).amount).toBe(69000));
  it("'none' scheme → 0", () => expect(calculateSubsidy(5, "none").amount).toBe(0));
});

describe("cashflow", () => {
  it("compounds degradation on generation, not money", () => {
    const cf = buildCashflow({
      annualGenerationYr0: 10000,
      tariff: 8,
      netCost: 300000,
      escalation: 0,
    });
    expect(cf.yearly[0].generation).toBe(9800); // 2% year-1 derate
    // year 2 = 9800 × (1−0.0055)
    expect(cf.yearly[1].generation).toBe(Math.round(9800 * 0.9945));
    expect(cf.paybackYears).toBeGreaterThan(3.5);
    expect(cf.paybackYears).toBeLessThan(4.5);
  });

  it("payback is null when savings never cover cost", () => {
    const cf = buildCashflow({
      annualGenerationYr0: 100,
      tariff: 1,
      netCost: 1e9,
      escalation: 0,
    });
    expect(cf.paybackYears).toBeNull();
  });
});

describe("energy report consistency", () => {
  it("recommendation and report use the same yield", () => {
    const specificYield = 1500;
    const rec = recommendSystemSize({ monthlyUsageKWh: 375, coverage: 100, specificYield });
    // 4500 kWh/yr ÷ 1500 = 3 kW
    expect(rec.recommendedKW).toBe(3);

    const report = buildEnergyReport({
      systemSizeKW: rec.recommendedKW,
      specificYield,
      tariff: 8,
      panelCount: 6,
    });
    expect(report.annualGeneration).toBe(4500);
    expect(report.financial.subsidyAmount).toBe(78000);
    expect(report.financial.netCost).toBe(3 * 1000 * 45 - 78000);
  });

  it("EV and battery uplifts apply", () => {
    const base = recommendSystemSize({ monthlyUsageKWh: 300, specificYield: 1500 });
    const ev = recommendSystemSize({ monthlyUsageKWh: 300, specificYield: 1500, evCharging: true });
    expect(ev.recommendedKW).toBeGreaterThan(base.recommendedKW);
  });
});

describe("inverter & strings (indicative)", () => {
  it("5.5 kW DC → sensible AC size within ratio window", () => {
    const inv = recommendInverter(5.5);
    expect(inv.acCapacityKW).toBeGreaterThanOrEqual(4);
    expect(inv.acCapacityKW).toBeLessThanOrEqual(5);
    expect(inv.dcAcRatio).toBeGreaterThanOrEqual(1.05);
  });
  it("strings between 8 and 14 panels", () => {
    const s = recommendStrings(24);
    expect(s.panelsPerString).toBeGreaterThanOrEqual(8);
    expect(s.panelsPerString).toBeLessThanOrEqual(14);
  });
});

describe("quality checks", () => {
  const ORIGIN = [77.2, 23.1];
  const ring = (cornersM) => {
    const r = cornersM.map((p) => fromPlane(p, ORIGIN));
    r.push(r[0]);
    return [r];
  };

  it("bowtie roof → blocker", () => {
    const bowtie = { type: "Polygon", coordinates: ring([[-5, -5], [5, 5], [5, -5], [-5, 5]]) };
    const findings = runQualityChecks({ roofPolygon: bowtie });
    expect(hasBlockers(findings)).toBe(true);
  });

  it("small roof → warning, no blocker", () => {
    const small = { type: "Polygon", coordinates: ring([[-1.6, -1.6], [1.6, -1.6], [1.6, 1.6], [-1.6, 1.6]]) };
    const metrics = computeRoofMetrics(small.coordinates, [], 0.3, 23);
    const findings = runQualityChecks({ roofPolygon: small, metrics });
    expect(hasBlockers(findings)).toBe(false);
    expect(findings.some((f) => f.id === "small-roof")).toBe(true);
  });

  it("clean 20×10 roof → no findings", () => {
    const roof = { type: "Polygon", coordinates: ring([[-10, -5], [10, -5], [10, 5], [-10, 5]]) };
    const metrics = computeRoofMetrics(roof.coordinates, [], 0.5, 23);
    expect(runQualityChecks({ roofPolygon: roof, metrics })).toHaveLength(0);
  });
});

describe("confidence", () => {
  it("all verified inputs → 4-5 stars; defaults → fewer", () => {
    const high = assessConfidence({
      locationConfirmed: true, roofDrawn: true, tiltUserEdited: true,
      yieldSource: "pvgis", usageProvided: true, obstaclesMarked: true,
    });
    const low = assessConfidence({});
    expect(high.stars).toBeGreaterThanOrEqual(4);
    expect(low.stars).toBeLessThan(high.stars);
    expect(high.items).toHaveLength(6);
  });
});
