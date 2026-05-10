"use client";

import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const PANEL_FILL_COLOR = "#00e5ff";
const PANEL_OUTLINE_COLOR = "#006064";
const ROOF_FILL_COLOR = "rgba(30, 127, 76, 0.25)";
const ROOF_OUTLINE_COLOR = "#1E7F4C";
const OBSTACLE_FILL_COLOR = "rgba(244, 67, 54, 0.35)";
const OBSTACLE_OUTLINE_COLOR = "#d32f2f";

const MapCanvas = forwardRef(function MapCanvas(
  { location, roofPolygon, obstacles, panelLayout, drawMode, onRoofComplete, onObstacleAdd },
  ref
) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const draw = useRef(null);
  const currentDrawMode = useRef(null);

  useImperativeHandle(ref, () => ({
    getMap: () => map.current,
  }));

  // ─── Initialize Map ─────────────────────────────────────────────────
  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-v9",
      center: [78.9629, 20.5937], // Center of India
      zoom: 5,
      attributionControl: false,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    map.current.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      "bottom-left"
    );

    // Initialize draw tool
    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {},
      defaultMode: "simple_select",
      styles: [
        // Polygon fill while drawing
        {
          id: "gl-draw-polygon-fill",
          type: "fill",
          filter: ["all", ["==", "$type", "Polygon"]],
          paint: {
            "fill-color": "#1E7F4C",
            "fill-opacity": 0.2,
          },
        },
        // Polygon outline while drawing
        {
          id: "gl-draw-polygon-stroke",
          type: "line",
          filter: ["all", ["==", "$type", "Polygon"]],
          paint: {
            "line-color": "#1E7F4C",
            "line-width": 2,
            "line-dasharray": [2, 2],
          },
        },
        // Vertices
        {
          id: "gl-draw-point",
          type: "circle",
          filter: ["all", ["==", "$type", "Point"]],
          paint: {
            "circle-radius": 5,
            "circle-color": "#fff",
            "circle-stroke-color": "#1E7F4C",
            "circle-stroke-width": 2,
          },
        },
        // Lines while drawing
        {
          id: "gl-draw-line",
          type: "line",
          filter: ["all", ["==", "$type", "LineString"]],
          paint: {
            "line-color": "#1E7F4C",
            "line-width": 2,
            "line-dasharray": [2, 2],
          },
        },
      ],
    });

    map.current.addControl(draw.current);

    // Handle draw create event
    map.current.on("draw.create", (e) => {
      const feature = e.features[0];
      if (feature.geometry.type === "Polygon") {
        const coords = feature.geometry.coordinates;

        if (currentDrawMode.current === "roof") {
          onRoofComplete?.({
            type: "Polygon",
            coordinates: coords,
          });
        } else if (currentDrawMode.current === "obstacle") {
          onObstacleAdd?.({
            type: "Polygon",
            coordinates: coords,
            label: "Obstacle",
          });
        }

        // Delete the drawn feature (we render our own layers)
        draw.current.deleteAll();
        draw.current.changeMode("simple_select");
        currentDrawMode.current = null;
      }
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Fly to location ────────────────────────────────────────────────
  useEffect(() => {
    if (!map.current || !location?.coordinates) return;

    map.current.flyTo({
      center: location.coordinates,
      zoom: 19.5,
      pitch: 0,
      bearing: 0,
      duration: 2000,
    });
  }, [location]);

  // ─── Handle draw mode changes ──────────────────────────────────────
  useEffect(() => {
    if (!draw.current) return;

    if (drawMode === "roof" || drawMode === "obstacle") {
      currentDrawMode.current = drawMode;
      draw.current.changeMode("draw_polygon");
    } else {
      draw.current.changeMode("simple_select");
      currentDrawMode.current = null;
    }
  }, [drawMode]);

  // ─── Render roof polygon ───────────────────────────────────────────
  useEffect(() => {
    if (!map.current) return;

    const sourceId = "roof-polygon";

    const addRoof = () => {
      // Remove existing
      if (map.current.getLayer("roof-fill")) map.current.removeLayer("roof-fill");
      if (map.current.getLayer("roof-outline")) map.current.removeLayer("roof-outline");
      if (map.current.getSource(sourceId)) map.current.removeSource(sourceId);

      if (!roofPolygon) return;

      map.current.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: { type: "Polygon", coordinates: roofPolygon.coordinates },
        },
      });

      map.current.addLayer({
        id: "roof-fill",
        type: "fill",
        source: sourceId,
        paint: { "fill-color": ROOF_FILL_COLOR },
      });

      map.current.addLayer({
        id: "roof-outline",
        type: "line",
        source: sourceId,
        paint: {
          "line-color": ROOF_OUTLINE_COLOR,
          "line-width": 2.5,
          "line-dasharray": [4, 2],
        },
      });
    };

    if (map.current.isStyleLoaded()) {
      addRoof();
    } else {
      map.current.once("style.load", addRoof);
    }
  }, [roofPolygon]);

  // ─── Render obstacles ──────────────────────────────────────────────
  useEffect(() => {
    if (!map.current) return;

    const sourceId = "obstacles";

    const addObstacles = () => {
      if (map.current.getLayer("obstacles-fill")) map.current.removeLayer("obstacles-fill");
      if (map.current.getLayer("obstacles-outline")) map.current.removeLayer("obstacles-outline");
      if (map.current.getSource(sourceId)) map.current.removeSource(sourceId);

      if (!obstacles.length) return;

      const features = obstacles.map((o, i) => ({
        type: "Feature",
        properties: { id: i, label: o.label },
        geometry: { type: "Polygon", coordinates: o.coordinates },
      }));

      map.current.addSource(sourceId, {
        type: "geojson",
        data: { type: "FeatureCollection", features },
      });

      map.current.addLayer({
        id: "obstacles-fill",
        type: "fill",
        source: sourceId,
        paint: { "fill-color": OBSTACLE_FILL_COLOR },
      });

      map.current.addLayer({
        id: "obstacles-outline",
        type: "line",
        source: sourceId,
        paint: { "line-color": OBSTACLE_OUTLINE_COLOR, "line-width": 2 },
      });
    };

    if (map.current.isStyleLoaded()) {
      addObstacles();
    } else {
      map.current.once("style.load", addObstacles);
    }
  }, [obstacles]);

  // ─── Render panels ─────────────────────────────────────────────────
  useEffect(() => {
    if (!map.current) return;

    const sourceId = "panels";

    const addPanels = () => {
      if (map.current.getLayer("panels-fill")) map.current.removeLayer("panels-fill");
      if (map.current.getLayer("panels-outline")) map.current.removeLayer("panels-outline");
      if (map.current.getSource(sourceId)) map.current.removeSource(sourceId);

      if (!panelLayout?.panels?.length) return;

      const features = panelLayout.panels.map((p, i) => ({
        type: "Feature",
        properties: { id: i, row: p.row },
        geometry: { type: "Polygon", coordinates: p.coordinates },
      }));

      map.current.addSource(sourceId, {
        type: "geojson",
        data: { type: "FeatureCollection", features },
      });

      map.current.addLayer({
        id: "panels-fill",
        type: "fill",
        source: sourceId,
        paint: { "fill-color": PANEL_FILL_COLOR, "fill-opacity": 0.7 },
      });

      map.current.addLayer({
        id: "panels-outline",
        type: "line",
        source: sourceId,
        paint: { "line-color": PANEL_OUTLINE_COLOR, "line-width": 1 },
      });
    };

    if (map.current.isStyleLoaded()) {
      addPanels();
    } else {
      map.current.once("style.load", addPanels);
    }
  }, [panelLayout]);

  return <div ref={mapContainer} className="sd-map-container" />;
});

export default MapCanvas;
