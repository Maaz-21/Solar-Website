import { describe, it, expect } from "vitest";
import { fromPlane } from "../geometry/plane";
import { validatePolygon } from "../geometry/polygon";
import {
  calculateRoofArea,
  calculateRoofOrientation,
  computeRoofMetrics,
  applySetback,
} from "../geometry/roof";

const ORIGIN = [77.2, 23.1]; // central India

/** Build a lng/lat ring from local-meter corner coordinates. */
function ringFromMeters(cornersM) {
  const ring = cornersM.map((p) => fromPlane(p, ORIGIN));
  ring.push(ring[0]);
  return [ring];
}

/** Axis-aligned rectangle w×h meters centered on the origin, rotated by deg. */
function rectRing(w, h, rotationDeg = 0) {
  const rad = (rotationDeg * Math.PI) / 180;
  const c = Math.cos(rad), s = Math.sin(rad);
  const corners = [
    [-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2],
  ].map(([x, y]) => [x * c - y * s, x * s + y * c]);
  return ringFromMeters(corners);
}

describe("polygon validation", () => {
  it("accepts a simple rectangle", () => {
    const { valid } = validatePolygon(rectRing(10, 6));
    expect(valid).toBe(true);
  });

  it("rejects a self-intersecting bowtie", () => {
    const bowtie = ringFromMeters([[-5, -5], [5, 5], [5, -5], [-5, 5]]);
    const result = validatePolygon(bowtie);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === "self-intersection")).toBe(true);
  });

  it("rejects sub-threshold slivers", () => {
    const tiny = ringFromMeters([[0, 0], [1, 0], [1, 1], [0, 1]]);
    const result = validatePolygon(tiny);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === "too-small")).toBe(true);
  });
});

describe("roof metrics", () => {
  it("computes the area of a 10×6 m rectangle within 2%", () => {
    const area = calculateRoofArea(rectRing(10, 6));
    expect(area).toBeGreaterThan(60 * 0.98);
    expect(area).toBeLessThan(60 * 1.02);
  });

  it("resolves orientation to the equator-facing perpendicular", () => {
    // Long edge east-west → perpendiculars 0/180; northern hemisphere → 180.
    const orientation = calculateRoofOrientation(rectRing(20, 8), 23);
    expect(Math.abs(orientation - 180)).toBeLessThan(2);
  });

  it("setback shrinks the polygon and can consume it entirely", () => {
    const ring = rectRing(10, 6);
    const inner = applySetback(ring, 1);
    expect(inner).toBeTruthy();
    const innerArea = calculateRoofArea(inner.coordinates);
    expect(innerArea).toBeGreaterThan(8 * 4 * 0.9);
    expect(innerArea).toBeLessThan(8 * 4 * 1.1);
    expect(applySetback(ring, 4)).toBeNull();
  });

  it("subtracts obstacles from usable area", () => {
    const roof = rectRing(20, 10);
    const obstacle = { polygon: { type: "Polygon", coordinates: rectRing(4, 4) } };
    const metrics = computeRoofMetrics(roof, [obstacle], 0.5, 23);
    expect(metrics.totalArea).toBeGreaterThan(190);
    // usable ≈ 19×9 − 16 ≈ 155
    expect(metrics.usableArea).toBeGreaterThan(140);
    expect(metrics.usableArea).toBeLessThan(165);
  });
});
