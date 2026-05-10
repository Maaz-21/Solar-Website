/**
 * Roof Geometry Calculations
 * 
 * Handles polygon area computation, orientation (azimuth) detection,
 * setback application, and obstacle subtraction using Turf.js.
 * 
 * Coordinate System:
 * - All coordinates are in WGS84 [longitude, latitude]
 * - Areas computed via Turf.js use geodesic calculations (accurate on Earth's surface)
 * - Azimuth: 0° = North, 90° = East, 180° = South, 270° = West
 */

import * as turf from "@turf/turf";

/**
 * Calculate the area of a roof polygon in square meters.
 * Uses Turf.js geodesic area calculation (accounts for Earth's curvature).
 * 
 * @param {Array} coordinates - GeoJSON polygon coordinates [[[lng, lat], ...]]
 * @returns {number} Area in square meters
 */
export function calculateRoofArea(coordinates) {
  if (!coordinates || !coordinates[0] || coordinates[0].length < 4) {
    return 0;
  }

  const polygon = turf.polygon(coordinates);
  return turf.area(polygon); // returns m²
}

/**
 * Determine the dominant orientation (azimuth) of the roof.
 * Finds the longest edge and computes its bearing.
 * 
 * For solar panels, south-facing (180°) is optimal in the Northern Hemisphere.
 * The azimuth tells us which direction the roof predominantly faces.
 * 
 * @param {Array} coordinates - GeoJSON polygon coordinates
 * @returns {number} Azimuth in degrees (0-360, where 0=North, 180=South)
 */
export function calculateRoofOrientation(coordinates) {
  if (!coordinates || !coordinates[0] || coordinates[0].length < 4) {
    return 180; // default to south-facing
  }

  const ring = coordinates[0];
  let longestEdge = 0;
  let longestBearing = 180;

  // Find the longest edge of the polygon
  for (let i = 0; i < ring.length - 1; i++) {
    const from = turf.point(ring[i]);
    const to = turf.point(ring[i + 1]);
    const distance = turf.distance(from, to, { units: "meters" });

    if (distance > longestEdge) {
      longestEdge = distance;
      longestBearing = turf.bearing(from, to);
    }
  }

  // Normalize bearing to 0-360 range
  // The perpendicular to the longest edge gives roof face direction
  let azimuth = (longestBearing + 90) % 360;
  if (azimuth < 0) azimuth += 360;

  return azimuth;
}

/**
 * Apply setback (inward buffer) to roof polygon.
 * Creates a smaller polygon inside the roof boundary.
 * 
 * Setbacks are required by building codes — panels cannot be placed
 * right at the roof edge for safety and maintenance access.
 * 
 * @param {Array} coordinates - GeoJSON polygon coordinates
 * @param {number} setbackM - Setback distance in meters
 * @returns {Object|null} GeoJSON polygon with setback applied, or null
 */
export function applySetback(coordinates, setbackM = 0.5) {
  if (!coordinates || !coordinates[0] || coordinates[0].length < 4) {
    return null;
  }

  const polygon = turf.polygon(coordinates);
  
  // Negative buffer = inward offset
  // Convert meters to kilometers for Turf.js
  const buffered = turf.buffer(polygon, -setbackM / 1000, { units: "kilometers" });

  if (!buffered || !buffered.geometry) {
    return null; // Setback consumed the entire polygon
  }

  return buffered.geometry;
}

/**
 * Subtract obstacle polygons from the usable roof area.
 * 
 * @param {Object} roofGeometry - GeoJSON geometry of the roof (after setback)
 * @param {Array} obstacles - Array of GeoJSON polygon geometries
 * @returns {Object|null} GeoJSON geometry with obstacles removed
 */
export function subtractObstacles(roofGeometry, obstacles = []) {
  if (!roofGeometry || !obstacles.length) {
    return roofGeometry;
  }

  let usableArea = turf.feature(roofGeometry);

  for (const obstacle of obstacles) {
    if (!obstacle || !obstacle.coordinates) continue;
    
    const obstacleFeature = turf.polygon(obstacle.coordinates);
    const difference = turf.difference(
      turf.featureCollection([usableArea, obstacleFeature])
    );

    if (!difference) {
      return null; // Obstacles consumed entire roof
    }
    usableArea = difference;
  }

  return usableArea.geometry;
}

/**
 * Get the bounding box of a polygon.
 * 
 * @param {Object} geometry - GeoJSON geometry
 * @returns {Array} [minLng, minLat, maxLng, maxLat]
 */
export function getBoundingBox(geometry) {
  const feature = turf.feature(geometry);
  return turf.bbox(feature);
}

/**
 * Compute the usable roof area after setbacks and obstacle subtraction.
 * Returns the complete metrics needed for panel placement.
 * 
 * @param {Array} roofCoordinates - GeoJSON polygon coordinates
 * @param {Array} obstacles - Array of obstacle geometries
 * @param {number} setbackM - Setback distance in meters
 * @returns {Object} { totalArea, usableArea, usableGeometry, orientation }
 */
export function computeRoofMetrics(roofCoordinates, obstacles = [], setbackM = 0.5) {
  const totalArea = calculateRoofArea(roofCoordinates);
  const orientation = calculateRoofOrientation(roofCoordinates);

  // Apply setback
  const afterSetback = applySetback(roofCoordinates, setbackM);
  if (!afterSetback) {
    return {
      totalArea,
      usableArea: 0,
      usableGeometry: null,
      orientation,
      setbackDistance: setbackM,
    };
  }

  // Subtract obstacles
  const usableGeometry = subtractObstacles(afterSetback, obstacles);
  const usableArea = usableGeometry
    ? turf.area(turf.feature(usableGeometry))
    : 0;

  return {
    totalArea: Math.round(totalArea * 100) / 100,
    usableArea: Math.round(usableArea * 100) / 100,
    usableGeometry,
    orientation: Math.round(orientation * 10) / 10,
    setbackDistance: setbackM,
  };
}
