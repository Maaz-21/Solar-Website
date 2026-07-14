/**
 * Roof geometry: area, orientation, dimensions, setbacks, obstacle
 * subtraction and the combined metrics object the UI consumes.
 *
 * Coordinates are WGS84 [lng, lat]; areas are geodesic (Turf).
 * Azimuth convention: 0° = North, 90° = East, 180° = South, 270° = West.
 */

import * as turf from "@turf/turf";
import { segmentLengthM } from "./plane";

export function calculateRoofArea(coordinates) {
  if (!coordinates?.[0] || coordinates[0].length < 4) return 0;
  return turf.area(turf.polygon(coordinates));
}

export function calculatePerimeter(coordinates) {
  const ring = coordinates?.[0];
  if (!ring || ring.length < 4) return 0;
  let total = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    total += segmentLengthM(ring[i], ring[i + 1]);
  }
  return total;
}

/**
 * Bearing of the longest edge (0-360). Panel rows run parallel to this.
 */
export function longestEdgeBearing(coordinates) {
  const ring = coordinates?.[0];
  if (!ring || ring.length < 4) return 90;

  let longest = 0;
  let bearing = 90;
  for (let i = 0; i < ring.length - 1; i++) {
    const len = segmentLengthM(ring[i], ring[i + 1]);
    if (len > longest) {
      longest = len;
      bearing = turf.bearing(turf.point(ring[i]), turf.point(ring[i + 1]));
    }
  }
  return ((bearing % 360) + 360) % 360;
}

/**
 * Dominant roof azimuth = perpendicular to the longest edge, resolved to
 * the hemisphere-appropriate side (equator-facing candidate wins) since a
 * satellite footprint alone cannot disambiguate the two perpendiculars.
 */
export function calculateRoofOrientation(coordinates, latitude = 20) {
  const edge = longestEdgeBearing(coordinates);
  const a = (edge + 90) % 360;
  const b = (edge + 270) % 360;
  const equatorFacing = latitude >= 0 ? 180 : 0;
  const dist = (x) => Math.min(Math.abs(x - equatorFacing), 360 - Math.abs(x - equatorFacing));
  return Math.round((dist(a) <= dist(b) ? a : b) * 10) / 10;
}

export function calculateRoofDimensions(coordinates) {
  const ring = coordinates?.[0];
  if (!ring || ring.length < 4) return { longestEdgeM: 0, shortestEdgeM: 0 };

  const lengths = [];
  for (let i = 0; i < ring.length - 1; i++) {
    const len = segmentLengthM(ring[i], ring[i + 1]);
    if (Number.isFinite(len) && len > 0.1) lengths.push(len);
  }
  if (!lengths.length) return { longestEdgeM: 0, shortestEdgeM: 0 };
  return {
    longestEdgeM: Math.round(Math.max(...lengths) * 10) / 10,
    shortestEdgeM: Math.round(Math.min(...lengths) * 10) / 10,
  };
}

/** Inward setback buffer. Returns geometry or null if consumed. */
export function applySetback(coordinates, setbackM = 0.5) {
  if (!coordinates?.[0] || coordinates[0].length < 4) return null;
  if (setbackM <= 0) return { type: "Polygon", coordinates };

  const buffered = turf.buffer(turf.polygon(coordinates), -setbackM / 1000, {
    units: "kilometers",
  });
  return buffered?.geometry ?? null;
}

/** Subtract obstacle footprints. Returns geometry (may be MultiPolygon) or null. */
export function subtractObstacles(roofGeometry, obstacles = []) {
  if (!roofGeometry || !obstacles.length) return roofGeometry;

  let usable = turf.feature(roofGeometry);
  for (const obstacle of obstacles) {
    const coords = obstacle?.polygon?.coordinates ?? obstacle?.coordinates;
    if (!coords) continue;
    let feature;
    try {
      feature = turf.polygon(coords);
    } catch {
      continue;
    }
    const diff = turf.difference(turf.featureCollection([usable, feature]));
    if (!diff) return null;
    usable = diff;
  }
  return usable.geometry;
}

/** Fraction (0-1) of the obstacle's area that lies inside the roof. */
export function obstacleCoverage(roofCoordinates, obstacleCoordinates) {
  try {
    const roof = turf.polygon(roofCoordinates);
    const obs = turf.polygon(obstacleCoordinates);
    const obsArea = turf.area(obs);
    if (obsArea <= 0) return 0;
    const clipped = turf.intersect(turf.featureCollection([roof, obs]));
    if (!clipped) return 0;
    return turf.area(clipped) / obsArea;
  } catch {
    return 0;
  }
}

export function obstaclesOverlap(aCoordinates, bCoordinates) {
  try {
    return turf.booleanIntersects(turf.polygon(aCoordinates), turf.polygon(bCoordinates));
  } catch {
    return false;
  }
}

/**
 * Combined metrics for the UI and the placement engine.
 * Runs client-side; cheap enough to recompute on every geometry change.
 */
export function computeRoofMetrics(roofCoordinates, obstacles = [], setbackM = 0.5, latitude = 20) {
  const totalArea = calculateRoofArea(roofCoordinates);
  const orientation = calculateRoofOrientation(roofCoordinates, latitude);
  const edgeBearing = longestEdgeBearing(roofCoordinates);
  const dimensions = calculateRoofDimensions(roofCoordinates);
  const perimeter = calculatePerimeter(roofCoordinates);

  const afterSetback = applySetback(roofCoordinates, setbackM);
  const usableGeometry = afterSetback ? subtractObstacles(afterSetback, obstacles) : null;
  const usableArea = usableGeometry ? turf.area(turf.feature(usableGeometry)) : 0;

  return {
    totalArea: Math.round(totalArea * 100) / 100,
    usableArea: Math.round(usableArea * 100) / 100,
    perimeterM: Math.round(perimeter * 10) / 10,
    usableGeometry,
    orientation,
    edgeBearing,
    ...dimensions,
    setbackDistance: setbackM,
  };
}
