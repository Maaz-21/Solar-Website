/**
 * mapbox-gl-draw theme for the roof editor.
 *
 * Feature kind is carried in properties.kind (draw exposes it as user_kind):
 * roofs render green, obstacles rose; the feature being actively drawn or
 * edited renders in the accent cyan with visible vertex handles + midpoints.
 */

const ROOF = "#22c55e";
const OBSTACLE = "#fb7185";
const ACTIVE = "#38bdf8";
const VERTEX_STROKE = "#0ea5e9";

const kindColor = ["case", ["==", ["get", "user_kind"], "obstacle"], OBSTACLE, ROOF];

export const DRAW_STYLES = [
  {
    id: "gl-draw-polygon-fill-inactive",
    type: "fill",
    filter: ["all", ["==", "active", "false"], ["==", "$type", "Polygon"]],
    paint: { "fill-color": kindColor, "fill-opacity": 0.16 },
  },
  {
    id: "gl-draw-polygon-fill-active",
    type: "fill",
    filter: ["all", ["==", "active", "true"], ["==", "$type", "Polygon"]],
    paint: { "fill-color": ACTIVE, "fill-opacity": 0.14 },
  },
  {
    id: "gl-draw-polygon-stroke-inactive",
    type: "line",
    filter: ["all", ["==", "active", "false"], ["==", "$type", "Polygon"]],
    layout: { "line-cap": "round", "line-join": "round" },
    paint: { "line-color": kindColor, "line-width": 2.5 },
  },
  {
    id: "gl-draw-polygon-stroke-active",
    type: "line",
    filter: ["all", ["==", "active", "true"], ["==", "$type", "Polygon"]],
    layout: { "line-cap": "round", "line-join": "round" },
    paint: { "line-color": ACTIVE, "line-width": 2.5, "line-dasharray": [1.4, 1.4] },
  },
  {
    id: "gl-draw-line-active",
    type: "line",
    filter: ["all", ["==", "$type", "LineString"], ["==", "active", "true"]],
    layout: { "line-cap": "round", "line-join": "round" },
    paint: { "line-color": ACTIVE, "line-width": 2.5, "line-dasharray": [1.4, 1.4] },
  },
  {
    id: "gl-draw-polygon-midpoint",
    type: "circle",
    filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
    paint: {
      "circle-radius": 3.5,
      "circle-color": "#e2e8f0",
      "circle-opacity": 0.85,
      "circle-stroke-color": VERTEX_STROKE,
      "circle-stroke-width": 1,
    },
  },
  {
    id: "gl-draw-vertex-halo-active",
    type: "circle",
    filter: ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"]],
    paint: { "circle-radius": 8, "circle-color": "#0c4a6e", "circle-opacity": 0.4 },
  },
  {
    id: "gl-draw-vertex-active",
    type: "circle",
    filter: ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"]],
    paint: {
      "circle-radius": 5,
      "circle-color": "#ffffff",
      "circle-stroke-color": VERTEX_STROKE,
      "circle-stroke-width": 2,
    },
  },
];
