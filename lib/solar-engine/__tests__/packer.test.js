import { describe, it, expect } from "vitest";
import * as turf from "@turf/turf";
import { fromPlane } from "../geometry/plane";
import { computeRoofMetrics } from "../geometry/roof";
import { generatePanelLayout, generateOptimalLayout, rowPitchM } from "../placement/packer";

const ORIGIN = [77.2, 23.1];
const LAT = 23.1;

function ringFromMeters(cornersM) {
  const ring = cornersM.map((p) => fromPlane(p, ORIGIN));
  ring.push(ring[0]);
  return [ring];
}

function rectRing(w, h, rotationDeg = 0, center = [0, 0]) {
  const rad = (rotationDeg * Math.PI) / 180;
  const c = Math.cos(rad), s = Math.sin(rad);
  const corners = [
    [-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2],
  ].map(([x, y]) => [center[0] + x * c - y * s, center[1] + x * s + y * c]);
  return ringFromMeters(corners);
}

function layoutFor(roofRing, obstacles = [], opts = {}) {
  const metrics = computeRoofMetrics(roofRing, obstacles, opts.setbackM ?? 0.5, LAT);
  return {
    metrics,
    layout: generatePanelLayout({
      usableGeometry: metrics.usableGeometry,
      edgeBearing: metrics.edgeBearing,
      latitude: LAT,
      flushMount: true,
      panelOrientation: "portrait",
      roofAreaM2: metrics.totalArea,
      ...opts,
    }),
  };
}

describe("panel packer", () => {
  it("fills a 20×10 m roof with a plausible panel count, all inside", () => {
    const roof = rectRing(20, 10);
    const { metrics, layout } = layoutFor(roof);
    // usable 19×9=171 m²; portrait cells 1.12×2.22 → theoretical ~64
    expect(layout.panelCount).toBeGreaterThan(40);
    expect(layout.panelCount).toBeLessThan(70);

    const usable = turf.feature(metrics.usableGeometry);
    for (const panel of layout.panels) {
      const inside = panel.coordinates[0]
        .slice(0, 4)
        .every((c) => turf.booleanPointInPolygon(turf.point(c), usable, { ignoreBoundary: false }));
      expect(inside).toBe(true);
    }
  });

  it("aligns panel rows with a rotated roof (E1 regression)", () => {
    const roof = rectRing(24, 12, 30);
    const { layout } = layoutFor(roof);
    expect(layout.panelCount).toBeGreaterThan(30);

    const [a, b] = layout.panels[0].coordinates[0];
    let edgeBearing = ((turf.bearing(turf.point(a), turf.point(b)) % 360) + 360) % 360;
    // rectRing rotates 30° ccw in math convention → long edge bearing 60° (or 240°).
    const diff = Math.min(
      ...[60, 240].map((t) => Math.min(Math.abs(edgeBearing - t), 360 - Math.abs(edgeBearing - t)))
    );
    expect(diff).toBeLessThan(2);
  });

  it("places panels on BOTH parts of an obstacle-split roof (B9 regression)", () => {
    const roof = rectRing(30, 10);
    // Full-height obstacle strip through the middle splits usable area in two.
    const strip = { polygon: { type: "Polygon", coordinates: rectRing(2, 12) } };
    const { metrics, layout } = layoutFor(roof, [strip]);
    expect(metrics.usableGeometry.type).toBe("MultiPolygon");

    const leftPanels = layout.panels.filter((p) => p.center[0] < ORIGIN[0]);
    const rightPanels = layout.panels.filter((p) => p.center[0] > ORIGIN[0]);
    expect(leftPanels.length).toBeGreaterThan(5);
    expect(rightPanels.length).toBeGreaterThan(5);
  });

  it("respects maxPanelCount", () => {
    const { layout } = layoutFor(rectRing(20, 10), [], { maxPanelCount: 10 });
    expect(layout.panelCount).toBe(10);
  });

  it("tilted racking reduces count vs flush (row-spacing sanity)", () => {
    const roof = rectRing(20, 14);
    const flush = layoutFor(roof).layout;
    const racked = layoutFor(roof, [], { flushMount: false, tiltDeg: 15 }).layout;
    expect(racked.panelCount).toBeLessThan(flush.panelCount);
    expect(racked.rowPitchM).toBeGreaterThan(2.2); // footprint + winter shadow
  });

  it("walkways reduce panel count", () => {
    const roof = rectRing(20, 14);
    const without = layoutFor(roof).layout;
    const withWalkways = layoutFor(roof, [], { walkway: { everyNRows: 1, widthM: 1.5 } }).layout;
    expect(withWalkways.panelCount).toBeLessThan(without.panelCount);
  });

  it("row pitch formula matches hand calculation", () => {
    // L=2.2, tilt 15°, lat 23.1 → α=43.45°; 2.2·cos15 + 2.2·sin15/tan(43.45) ≈ 2.726
    const pitch = rowPitchM({ panelLengthM: 2.2, tiltDeg: 15, latitude: 23.1 });
    expect(pitch).toBeGreaterThan(2.7);
    expect(pitch).toBeLessThan(2.76);
  });

  it("auto orientation picks the better packing", () => {
    const metrics = computeRoofMetrics(rectRing(20, 10), [], 0.5, LAT);
    const auto = generateOptimalLayout({
      usableGeometry: metrics.usableGeometry,
      edgeBearing: metrics.edgeBearing,
      latitude: LAT,
      flushMount: true,
      roofAreaM2: metrics.totalArea,
    });
    expect(auto.panelCount).toBeGreaterThan(0);
  });
});
