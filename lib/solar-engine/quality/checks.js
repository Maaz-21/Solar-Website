/**
 * Pre-generation quality checks (user amendment #6).
 *
 * Run before the placement engine; `blocker` findings disable
 * "Generate Design", `warning` findings are shown but don't block.
 */

import { validatePolygon } from "../geometry/polygon";
import { obstacleCoverage, obstaclesOverlap } from "../geometry/roof";
import { DEFAULT_PANEL } from "../constants";

const AREA_PER_KW_M2 = (DEFAULT_PANEL.lengthM * DEFAULT_PANEL.widthM * 1000) / DEFAULT_PANEL.wattage; // ≈ 4.4

/**
 * @returns Array<{ id, level: 'blocker'|'warning', title, message }>
 */
export function runQualityChecks({ roofPolygon, obstacles = [], metrics = null }) {
  const findings = [];

  if (!roofPolygon?.coordinates?.length) {
    return [{
      id: "no-roof",
      level: "blocker",
      title: "No roof outline",
      message: "Draw the roof outline before generating a design.",
    }];
  }

  const validation = validatePolygon(roofPolygon.coordinates);
  if (!validation.valid) {
    for (const err of validation.errors) {
      findings.push({
        id: `roof-${err.code}`,
        level: "blocker",
        title: "Roof outline needs fixing",
        message: err.message,
      });
    }
  }

  if (metrics) {
    if (metrics.totalArea > 0 && metrics.totalArea < 15) {
      findings.push({
        id: "small-roof",
        level: "warning",
        title: "Very small roof",
        message: `Total area is ${Math.round(metrics.totalArea)} m². Verify the outline matches the actual roof.`,
      });
    }

    if (metrics.totalArea >= 15 && metrics.usableArea <= 0) {
      findings.push({
        id: "no-usable-area",
        level: "blocker",
        title: "No usable area",
        message: "Setbacks and obstacles consume the entire roof. Reduce the setback or review obstacles.",
      });
    } else if (metrics.totalArea > 0 && metrics.usableArea / metrics.totalArea < 0.35) {
      findings.push({
        id: "heavy-obstruction",
        level: "warning",
        title: "Heavily obstructed roof",
        message: `Only ${Math.round((metrics.usableArea / metrics.totalArea) * 100)}% of the roof is usable after setbacks and obstacles.`,
      });
    }

    const estimatedKW = metrics.usableArea / AREA_PER_KW_M2;
    if (metrics.usableArea > 0 && estimatedKW < 1) {
      findings.push({
        id: "sub-1kw",
        level: "warning",
        title: "Capacity below 1 kW",
        message: "The usable area supports less than 1 kW — grid-connected rooftop systems are rarely viable below this size.",
      });
    }
  }

  obstacles.forEach((obstacle, index) => {
    const coords = obstacle?.polygon?.coordinates;
    if (!coords) return;
    const coverage = obstacleCoverage(roofPolygon.coordinates, coords);
    if (coverage < 0.6) {
      findings.push({
        id: `obstacle-outside-${index}`,
        level: "warning",
        title: `${obstacle.label || "Obstacle"} partly outside the roof`,
        message: `${Math.round((1 - coverage) * 100)}% of it lies outside the roof outline — reposition it or ignore if intentional (e.g. overhanging tree).`,
      });
    }
    for (let j = index + 1; j < obstacles.length; j++) {
      const other = obstacles[j]?.polygon?.coordinates;
      if (other && obstaclesOverlap(coords, other)) {
        findings.push({
          id: `obstacle-overlap-${index}-${j}`,
          level: "warning",
          title: "Overlapping obstacles",
          message: `"${obstacle.label}" overlaps "${obstacles[j].label}". The overlap is only subtracted once, but check that both are placed correctly.`,
        });
      }
    }
  });

  return findings;
}

export function hasBlockers(findings) {
  return findings.some((f) => f.level === "blocker");
}
