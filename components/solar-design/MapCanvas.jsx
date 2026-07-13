"use client";

import {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const PANEL_FILL_COLOR = "#38bdf8";
const PANEL_OUTLINE_COLOR = "#075985";
const ROOF_FILL_COLOR = "#22c55e";
const ROOF_OUTLINE_COLOR = "#86efac";
const OBSTACLE_FILL_COLOR = "#fb7185";
const OBSTACLE_OUTLINE_COLOR = "#fecdd3";

function removeLayerAndSource(map, layerIds, sourceId) {
  layerIds.forEach((id) => {
    if (map.getLayer(id)) map.removeLayer(id);
  });
  if (map.getSource(sourceId)) map.removeSource(sourceId);
}

const MapCanvas = forwardRef(function MapCanvas(
  {
    location,
    roofPolygon,
    obstacles,
    panelLayout,
    drawMode,
    viewMode = "2d",
    onRoofComplete,
    onObstacleAdd,
  },
  ref
) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const draw = useRef(null);
  const currentDrawMode = useRef(null);
  const locationMarker = useRef(null);
  const callbacks = useRef({ onRoofComplete, onObstacleAdd });

  // Mapbox event listeners are attached once, so keep their callbacks current.
  useEffect(() => {
    callbacks.current = { onRoofComplete, onObstacleAdd };
  }, [onObstacleAdd, onRoofComplete]);

  useImperativeHandle(ref, () => ({
    getMap: () => map.current,
    flyToRoof: () => {
      if (!map.current || !roofPolygon?.coordinates?.[0]?.length) return;
      const bounds = roofPolygon.coordinates[0].reduce(
        (result, coordinate) => result.extend(coordinate),
        new mapboxgl.LngLatBounds(
          roofPolygon.coordinates[0][0],
          roofPolygon.coordinates[0][0]
        )
      );
      map.current.fitBounds(bounds, { padding: 100, maxZoom: 21, duration: 700 });
    },
  }));

  // Initialize the satellite workspace and drawing control once.
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [78.9629, 20.5937],
      zoom: 5,
      maxZoom: 22,
      attributionControl: false,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    map.current.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      "bottom-left"
    );

    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {},
      defaultMode: "simple_select",
      styles: [
        {
          id: "gl-draw-polygon-fill",
          type: "fill",
          filter: ["all", ["==", "$type", "Polygon"]],
          paint: { "fill-color": "#22c55e", "fill-opacity": 0.24 },
        },
        {
          id: "gl-draw-polygon-stroke",
          type: "line",
          filter: ["all", ["==", "$type", "Polygon"]],
          paint: {
            "line-color": "#dcfce7",
            "line-width": 2.5,
            "line-dasharray": [2, 2],
          },
        },
        {
          id: "gl-draw-point",
          type: "circle",
          filter: ["all", ["==", "$type", "Point"]],
          paint: {
            "circle-radius": 5,
            "circle-color": "#fff",
            "circle-stroke-color": "#16a34a",
            "circle-stroke-width": 2,
          },
        },
        {
          id: "gl-draw-line",
          type: "line",
          filter: ["all", ["==", "$type", "LineString"]],
          paint: {
            "line-color": "#dcfce7",
            "line-width": 2.5,
            "line-dasharray": [2, 2],
          },
        },
      ],
    });

    map.current.addControl(draw.current);

    map.current.on("draw.create", (event) => {
      const feature = event.features[0];
      if (feature?.geometry?.type !== "Polygon") return;

      const polygon = {
        type: "Polygon",
        coordinates: feature.geometry.coordinates,
      };

      if (currentDrawMode.current === "roof") {
        callbacks.current.onRoofComplete?.(polygon);
      }

      if (currentDrawMode.current === "obstacle") {
        callbacks.current.onObstacleAdd?.(polygon);
      }

      draw.current?.deleteAll();
      draw.current?.changeMode("simple_select");
      currentDrawMode.current = null;
    });

    return () => {
      locationMarker.current?.remove();
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Selecting a site makes imagery verification immediate and useful.
  useEffect(() => {
    if (!map.current || !location?.coordinates) return;

    map.current.flyTo({
      center: location.coordinates,
      zoom: 20.5,
      pitch: 0,
      bearing: 0,
      duration: 1500,
      essential: true,
    });

    if (!locationMarker.current) {
      const markerElement = document.createElement("div");
      markerElement.className = "sd-map-location-marker";
      markerElement.setAttribute("aria-label", "Selected project location");
      locationMarker.current = new mapboxgl.Marker({ element: markerElement });
    }

    locationMarker.current.setLngLat(location.coordinates).addTo(map.current);
  }, [location]);

  // A perspective camera plus extrusion is an honest phase-one 3D review.
  useEffect(() => {
    if (!map.current) return;
    map.current.easeTo({
      pitch: viewMode === "3d" ? 56 : 0,
      bearing: viewMode === "3d" ? -28 : 0,
      duration: 650,
      essential: true,
    });
  }, [viewMode]);

  useEffect(() => {
    if (!draw.current) return;

    if (drawMode === "roof" || drawMode === "obstacle") {
      draw.current.deleteAll();
      currentDrawMode.current = drawMode;
      draw.current.changeMode("draw_polygon");
      return;
    }

    draw.current.changeMode("simple_select");
    currentDrawMode.current = null;
  }, [drawMode]);

  useEffect(() => {
    if (!map.current) return;
    const sourceId = "roof-polygon";

    const renderRoof = () => {
      removeLayerAndSource(
        map.current,
        ["roof-fill", "roof-extrusion", "roof-outline"],
        sourceId
      );
      if (!roofPolygon?.coordinates) return;

      map.current.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "Polygon", coordinates: roofPolygon.coordinates },
        },
      });

      if (viewMode === "3d") {
        map.current.addLayer({
          id: "roof-extrusion",
          type: "fill-extrusion",
          source: sourceId,
          paint: {
            "fill-extrusion-color": ROOF_FILL_COLOR,
            "fill-extrusion-height": 2.7,
            "fill-extrusion-base": 0,
            "fill-extrusion-opacity": 0.44,
          },
        });
      } else {
        map.current.addLayer({
          id: "roof-fill",
          type: "fill",
          source: sourceId,
          paint: { "fill-color": ROOF_FILL_COLOR, "fill-opacity": 0.2 },
        });
      }

      map.current.addLayer({
        id: "roof-outline",
        type: "line",
        source: sourceId,
        paint: {
          "line-color": ROOF_OUTLINE_COLOR,
          "line-width": 2.5,
          "line-dasharray": [3, 2],
        },
      });
    };

    if (map.current.isStyleLoaded()) renderRoof();
    else map.current.once("style.load", renderRoof);
  }, [roofPolygon, viewMode]);

  useEffect(() => {
    if (!map.current) return;
    const sourceId = "obstacles";

    const renderObstacles = () => {
      removeLayerAndSource(
        map.current,
        ["obstacles-fill", "obstacles-outline"],
        sourceId
      );
      if (!obstacles?.length) return;

      map.current.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: obstacles.map((obstacle, index) => ({
            type: "Feature",
            properties: {
              id: obstacle.id || index,
              label: obstacle.label || "Obstacle",
              heightM: obstacle.heightM || 0,
            },
            geometry: {
              type: "Polygon",
              coordinates: obstacle.coordinates,
            },
          })),
        },
      });

      map.current.addLayer({
        id: "obstacles-fill",
        type: "fill",
        source: sourceId,
        paint: { "fill-color": OBSTACLE_FILL_COLOR, "fill-opacity": 0.35 },
      });
      map.current.addLayer({
        id: "obstacles-outline",
        type: "line",
        source: sourceId,
        paint: { "line-color": OBSTACLE_OUTLINE_COLOR, "line-width": 2 },
      });
    };

    if (map.current.isStyleLoaded()) renderObstacles();
    else map.current.once("style.load", renderObstacles);
  }, [obstacles]);

  useEffect(() => {
    if (!map.current) return;
    const sourceId = "panels";

    const renderPanels = () => {
      removeLayerAndSource(
        map.current,
        ["panels-fill", "panels-extrusion", "panels-outline"],
        sourceId
      );
      if (!panelLayout?.panels?.length) return;

      map.current.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: panelLayout.panels.map((panel, index) => ({
            type: "Feature",
            properties: { id: index, row: panel.row },
            geometry: { type: "Polygon", coordinates: panel.coordinates },
          })),
        },
      });

      if (viewMode === "3d") {
        map.current.addLayer({
          id: "panels-extrusion",
          type: "fill-extrusion",
          source: sourceId,
          paint: {
            "fill-extrusion-color": PANEL_FILL_COLOR,
            "fill-extrusion-height": 2.92,
            "fill-extrusion-base": 2.72,
            "fill-extrusion-opacity": 0.86,
          },
        });
      } else {
        map.current.addLayer({
          id: "panels-fill",
          type: "fill",
          source: sourceId,
          paint: { "fill-color": PANEL_FILL_COLOR, "fill-opacity": 0.78 },
        });
      }

      map.current.addLayer({
        id: "panels-outline",
        type: "line",
        source: sourceId,
        paint: { "line-color": PANEL_OUTLINE_COLOR, "line-width": 1.1 },
      });
    };

    if (map.current.isStyleLoaded()) renderPanels();
    else map.current.once("style.load", renderPanels);
  }, [panelLayout, viewMode]);

  return <div ref={mapContainer} className="sd-map-container" />;
});

export default MapCanvas;
