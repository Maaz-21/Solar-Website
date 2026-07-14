/**
 * Polygon validation.
 *
 * Every polygon entering the engine (roof or obstacle) passes through here
 * first, so downstream Turf operations never receive degenerate input
 * (bowties, unclosed rings, sub-threshold slivers).
 */

import * as turf from "@turf/turf";

export const MIN_ROOF_AREA_M2 = 5;
export const MIN_OBSTACLE_AREA_M2 = 0.05;

/**
 * Validate GeoJSON polygon coordinates.
 * @returns {{ valid: boolean, errors: Array<{code: string, message: string}> }}
 */
export function validatePolygon(coordinates, { minAreaM2 = MIN_ROOF_AREA_M2 } = {}) {
  const errors = [];

  const ring = coordinates?.[0];
  if (!ring || ring.length < 4) {
    return {
      valid: false,
      errors: [{ code: "too-few-points", message: "A polygon needs at least 3 corner points." }],
    };
  }

  const [fx, fy] = ring[0];
  const [lx, ly] = ring[ring.length - 1];
  if (fx !== lx || fy !== ly) {
    errors.push({ code: "unclosed-ring", message: "Polygon outline is not closed." });
  }

  let feature;
  try {
    feature = turf.polygon(coordinates);
  } catch {
    return {
      valid: false,
      errors: [...errors, { code: "malformed", message: "Polygon coordinates are malformed." }],
    };
  }

  try {
    const kinks = turf.kinks(feature);
    if (kinks.features.length > 0) {
      errors.push({
        code: "self-intersection",
        message: "The outline crosses over itself. Adjust the corners so edges do not intersect.",
      });
    }
  } catch {
    /* kinks can throw on exotic input; malformed case is caught above */
  }

  const area = turf.area(feature);
  if (area < minAreaM2) {
    errors.push({
      code: "too-small",
      message: `Area is only ${area.toFixed(1)} m² — too small to be usable.`,
    });
  }

  return { valid: errors.length === 0, errors };
}
