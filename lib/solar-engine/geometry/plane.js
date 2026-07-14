/**
 * Local tangent-plane projection.
 *
 * Panel packing and CAD-style measurements need planar math in meters.
 * For roof-scale geometry (< 500 m across) an equirectangular projection
 * around a local origin is accurate to well under a centimeter — far below
 * satellite-imagery georeferencing error.
 *
 * Conventions: [lng, lat] in WGS84; local plane is x = meters east,
 * y = meters north of the origin.
 */

const METERS_PER_DEG_LAT = 111132;

export function metersPerDegLng(latDeg) {
  return 111320 * Math.cos((latDeg * Math.PI) / 180);
}

/** Pick a projection origin (centroid of the outer ring's bbox). */
export function ringOrigin(ring) {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  for (const [lng, lat] of ring) {
    if (lng < minLng) minLng = lng;
    if (lat < minLat) minLat = lat;
    if (lng > maxLng) maxLng = lng;
    if (lat > maxLat) maxLat = lat;
  }
  return [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
}

export function toPlane([lng, lat], origin) {
  return [
    (lng - origin[0]) * metersPerDegLng(origin[1]),
    (lat - origin[1]) * METERS_PER_DEG_LAT,
  ];
}

export function fromPlane([x, y], origin) {
  return [
    origin[0] + x / metersPerDegLng(origin[1]),
    origin[1] + y / METERS_PER_DEG_LAT,
  ];
}

export function projectRing(ring, origin) {
  return ring.map((c) => toPlane(c, origin));
}

export function unprojectRing(ring, origin) {
  return ring.map((c) => fromPlane(c, origin));
}

/**
 * Project a GeoJSON Polygon or MultiPolygon geometry into the local plane.
 * Returns an array of polygons; each polygon is an array of rings
 * (outer first, then holes) in meters.
 */
export function geometryToPlane(geometry, origin) {
  if (!geometry) return [];
  if (geometry.type === "Polygon") {
    return [geometry.coordinates.map((ring) => projectRing(ring, origin))];
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.map((poly) =>
      poly.map((ring) => projectRing(ring, origin))
    );
  }
  return [];
}

/** Rotate a planar point by `rad` radians counter-clockwise around the origin. */
export function rotatePoint([x, y], rad) {
  const c = Math.cos(rad), s = Math.sin(rad);
  return [x * c - y * s, x * s + y * c];
}

/** Ray-casting point-in-ring test (planar coordinates). */
export function pointInRing([px, py], ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Point-in-polygon-set test honoring holes and MultiPolygon parts.
 * `polygons` is the output of geometryToPlane().
 */
export function pointInPolygons(pt, polygons) {
  for (const rings of polygons) {
    if (!rings.length) continue;
    if (!pointInRing(pt, rings[0])) continue;
    let inHole = false;
    for (let h = 1; h < rings.length; h++) {
      if (pointInRing(pt, rings[h])) {
        inHole = true;
        break;
      }
    }
    if (!inHole) return true;
  }
  return false;
}

/** Planar length of a segment in meters between two [lng,lat] points. */
export function segmentLengthM(a, b) {
  const origin = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const [x1, y1] = toPlane(a, origin);
  const [x2, y2] = toPlane(b, origin);
  return Math.hypot(x2 - x1, y2 - y1);
}
