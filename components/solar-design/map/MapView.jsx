"use client";

/**
 * MapView — owns the Mapbox map, the drawing controller and every map
 * layer. All state lives in useDesignStore; this component is a pure
 * imperative bridge:
 *
 *  - Steps 2-3 (editor): roof + obstacles live INSIDE mapbox-gl-draw so
 *    vertices stay editable (direct_select, midpoints). Live measurement
 *    labels render from `sd.measure` events + store geometry.
 *  - All other steps: draw is emptied and geometry renders as static
 *    layers (roof, obstacles, usable-area preview, panels).
 *  - Panels are click-toggleable in step 6 (2D Design).
 */

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { useDesignStore } from "../store/useDesignStore";
import { DRAW_STYLES } from "./draw-styles";
import { MeasuredPolygonMode } from "./measured-polygon-mode";
import { validatePolygon } from "@/lib/solar-engine/geometry/polygon";
import { segmentLengthM } from "@/lib/solar-engine/geometry/plane";
import { calculateRoofArea } from "@/lib/solar-engine/geometry/roof";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
mapboxgl.accessToken = TOKEN;

const EMPTY_FC = { type: "FeatureCollection", features: [] };
const LABEL_FONT = ["DIN Pro Medium", "Arial Unicode MS Regular"];

// ─── Label helpers ──────────────────────────────────────────────────────────

function ringCentroid(ring) {
  let x = 0, y = 0;
  const n = ring.length > 1 && ring[0] === ring[ring.length - 1] ? ring.length - 1 : ring.length;
  for (let i = 0; i < n; i++) {
    x += ring[i][0];
    y += ring[i][1];
  }
  return [x / n, y / n];
}

/** Edge-length labels at midpoints + running area at the centroid. */
function buildLabelFeatures(ring, { closed }) {
  if (!ring || ring.length < 2) return EMPTY_FC;
  const features = [];

  for (let i = 0; i < ring.length - 1; i++) {
    const a = ring[i], b = ring[i + 1];
    const len = segmentLengthM(a, b);
    if (len < 0.5) continue;
    features.push({
      type: "Feature",
      properties: { label: `${len.toFixed(1)} m`, kind: "edge" },
      geometry: { type: "Point", coordinates: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] },
    });
  }

  const distinct = closed ? ring.length - 1 : ring.length;
  if (distinct >= 3) {
    const closedRing = closed ? ring : [...ring, ring[0]];
    const area = calculateRoofArea([closedRing]);
    if (area > 1) {
      features.push({
        type: "Feature",
        properties: { label: `${Math.round(area)} m²`, kind: "area" },
        geometry: { type: "Point", coordinates: ringCentroid(closedRing) },
      });
    }
  }

  return { type: "FeatureCollection", features };
}

function setSource(map, id, data) {
  const src = map.getSource(id);
  if (src) src.setData(data ?? EMPTY_FC);
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function MapView() {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const drawRef = useRef(null);
  const markerRef = useRef(null);
  const loadedRef = useRef(false);
  const internalUpdateRef = useRef(false);
  const liveDrawingRef = useRef(false);

  const step = useDesignStore((s) => s.step);
  const location = useDesignStore((s) => s.location);
  const roofPolygon = useDesignStore((s) => s.roof.polygon);
  const obstacles = useDesignStore((s) => s.obstacles);
  const usableGeometry = useDesignStore((s) => s.metrics?.usableGeometry);
  const design = useDesignStore((s) => s.design);
  const drawMode = useDesignStore((s) => s.ui.drawMode);

  const isEditorStep = step === 2 || step === 3;

  // ── Init (once) ───────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !containerRef.current || !TOKEN) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [78.9629, 20.5937],
      zoom: 4.4,
      maxZoom: 21,
      attributionControl: false,
      preserveDrawingBuffer: true, // proposal snapshots
      antialias: true,
    });
    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "bottom-right");
    map.addControl(new mapboxgl.ScaleControl({ maxWidth: 120, unit: "metric" }), "bottom-left");
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-left");

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {},
      defaultMode: "simple_select",
      styles: DRAW_STYLES,
      modes: { ...MapboxDraw.modes, measured_polygon: MeasuredPolygonMode },
      userProperties: true,
      clickBuffer: 4,
      touchBuffer: 40, // generous hit area so vertices are grabbable on phones
    });
    drawRef.current = draw;
    map.addControl(draw);

    map.on("load", () => {
      const sources = ["sd-roof", "sd-usable", "sd-obstacles", "sd-panels", "sd-labels"];
      for (const id of sources) map.addSource(id, { type: "geojson", data: EMPTY_FC });

      map.addLayer({
        id: "sd-roof-fill", type: "fill", source: "sd-roof",
        paint: { "fill-color": "#22c55e", "fill-opacity": 0.14 },
      });
      map.addLayer({
        id: "sd-roof-line", type: "line", source: "sd-roof",
        paint: { "line-color": "#4ade80", "line-width": 2.5 },
      });
      map.addLayer({
        id: "sd-usable-fill", type: "fill", source: "sd-usable",
        paint: { "fill-color": "#a3e635", "fill-opacity": 0.07 },
      });
      map.addLayer({
        id: "sd-usable-line", type: "line", source: "sd-usable",
        paint: { "line-color": "#a3e635", "line-width": 1.4, "line-dasharray": [2, 2] },
      });
      map.addLayer({
        id: "sd-obstacles-fill", type: "fill", source: "sd-obstacles",
        paint: { "fill-color": "#fb7185", "fill-opacity": 0.3 },
      });
      map.addLayer({
        id: "sd-obstacles-line", type: "line", source: "sd-obstacles",
        paint: { "line-color": "#fda4af", "line-width": 1.8 },
      });
      map.addLayer({
        id: "sd-panels-fill", type: "fill", source: "sd-panels",
        paint: {
          "fill-color": [
            "case", ["boolean", ["get", "enabled"], true], "#0ea5e9", "#334155",
          ],
          "fill-opacity": [
            "case", ["boolean", ["get", "enabled"], true], 0.82, 0.3,
          ],
        },
      });
      map.addLayer({
        id: "sd-panels-line", type: "line", source: "sd-panels",
        paint: { "line-color": "#082f49", "line-width": 1 },
      });
      map.addLayer({
        id: "sd-obstacle-labels", type: "symbol", source: "sd-obstacles",
        layout: {
          "text-field": ["get", "label"],
          "text-font": LABEL_FONT,
          "text-size": 11,
          "text-offset": [0, 0.2],
        },
        paint: {
          "text-color": "#fecdd3",
          "text-halo-color": "rgba(15,15,25,0.9)", "text-halo-width": 1.4,
        },
      });
      map.addLayer({
        id: "sd-measure-labels", type: "symbol", source: "sd-labels",
        layout: {
          "text-field": ["get", "label"],
          "text-font": LABEL_FONT,
          "text-size": ["case", ["==", ["get", "kind"], "area"], 15, 11.5],
          "text-allow-overlap": true,
          "text-ignore-placement": true,
        },
        paint: {
          "text-color": ["case", ["==", ["get", "kind"], "area"], "#fbbf24", "#f0f9ff"],
          "text-halo-color": "rgba(8,14,26,0.95)", "text-halo-width": 1.6,
        },
      });

      loadedRef.current = true;
      syncAll();
    });

    // ── Live measurements from the custom draw mode ────────────────
    map.on("sd.measure", (e) => {
      liveDrawingRef.current = !!e.drawing && e.ring?.length > 0;
      setSource(map, "sd-labels", buildLabelFeatures(e.ring, { closed: false }));
    });

    // ── Draw lifecycle → store ─────────────────────────────────────
    map.on("draw.create", (e) => {
      const store = useDesignStore.getState();
      const feature = e.features[0];
      if (feature?.geometry?.type !== "Polygon") return;

      const polygon = { type: "Polygon", coordinates: feature.geometry.coordinates };
      const mode = store.ui.drawMode;

      const validation = validatePolygon(polygon.coordinates, {
        minAreaM2: mode === "obstacle" ? 0.05 : 5,
      });
      if (!validation.valid) {
        draw.delete(feature.id);
        store.setDrawMode(null);
        store.setError(validation.errors[0]?.message ?? "Invalid shape — please redraw.");
        return;
      }

      internalUpdateRef.current = true;
      if (mode === "roof") store.setRoofPolygon(polygon);
      else if (mode === "obstacle") store.addObstacle(polygon);
      internalUpdateRef.current = false;
      syncAll();
    });

    map.on("draw.update", (e) => {
      const store = useDesignStore.getState();
      internalUpdateRef.current = true;
      for (const feature of e.features) {
        const polygon = { type: "Polygon", coordinates: feature.geometry.coordinates };
        if (feature.id === "roof-feature") {
          store.setRoofPolygon(polygon, { fromEdit: true });
        } else {
          store.updateObstacle(feature.id, { polygon });
        }
      }
      internalUpdateRef.current = false;
      syncLabels();
    });

    map.on("draw.delete", (e) => {
      const store = useDesignStore.getState();
      internalUpdateRef.current = true;
      for (const feature of e.features) {
        if (feature.id === "roof-feature") store.clearRoof();
        else store.removeObstacle(feature.id);
      }
      internalUpdateRef.current = false;
      syncAll();
    });

    map.on("draw.modechange", (e) => {
      const store = useDesignStore.getState();
      if (e.mode === "simple_select" && store.ui.drawMode && store.ui.drawMode !== "edit") {
        // Drawing ended (finished or Escape) — draw.create handles success.
        store.setDrawMode(null);
      }
      if (e.mode === "simple_select") {
        map.getCanvas().style.cursor = "";
        if (!liveDrawingRef.current) syncLabels();
      }
    });

    // ── Panel toggling (step 6 only) ───────────────────────────────
    map.on("click", "sd-panels-fill", (e) => {
      const store = useDesignStore.getState();
      if (store.step !== 6) return;
      const id = e.features?.[0]?.properties?.id;
      if (id) store.togglePanel(id);
    });
    map.on("mouseenter", "sd-panels-fill", () => {
      if (useDesignStore.getState().step === 6) map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "sd-panels-fill", () => {
      map.getCanvas().style.cursor = "";
    });

    return () => {
      markerRef.current?.remove();
      map.remove();
      mapRef.current = null;
      loadedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync helpers (read latest store state directly) ───────────────
  function syncAll() {
    syncDrawFeatures();
    syncStaticLayers();
    syncLabels();
  }

  function syncDrawFeatures() {
    const map = mapRef.current, draw = drawRef.current;
    if (!map || !draw || !loadedRef.current) return;
    const s = useDesignStore.getState();
    const editor = s.step === 2 || s.step === 3;
    const drawing = s.ui.drawMode === "roof" || s.ui.drawMode === "obstacle";
    if (!editor) {
      if (draw.getAll().features.length) draw.deleteAll();
      return;
    }
    if (drawing || internalUpdateRef.current) return;

    const features = [];
    if (s.roof.polygon) {
      features.push({
        type: "Feature", id: "roof-feature",
        properties: { kind: "roof" }, geometry: s.roof.polygon,
      });
    }
    for (const o of s.obstacles) {
      features.push({
        type: "Feature", id: o.id,
        properties: { kind: "obstacle" }, geometry: o.polygon,
      });
    }
    draw.set({ type: "FeatureCollection", features });
  }

  function syncStaticLayers() {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    const s = useDesignStore.getState();
    const editor = s.step === 2 || s.step === 3;

    // Roof + obstacle fills: draw renders them in editor steps.
    setSource(
      map, "sd-roof",
      !editor && s.roof.polygon
        ? { type: "Feature", properties: {}, geometry: s.roof.polygon }
        : EMPTY_FC
    );
    setSource(map, "sd-obstacles", {
      type: "FeatureCollection",
      features: s.obstacles.map((o) => ({
        type: "Feature",
        properties: {
          id: o.id,
          label: `${o.label} · ${o.heightM} m`,
          fill: !editor,
        },
        geometry: o.polygon,
      })),
    });
    // In editor steps only labels show (fills come from draw).
    map.setPaintProperty("sd-obstacles-fill", "fill-opacity", editor ? 0 : 0.3);
    map.setPaintProperty("sd-obstacles-line", "line-opacity", editor ? 0 : 1);

    // Usable-area preview: editor + summary steps.
    const showUsable = s.step >= 2 && s.step <= 6 && s.metrics?.usableGeometry;
    setSource(
      map, "sd-usable",
      showUsable
        ? { type: "Feature", properties: {}, geometry: s.metrics.usableGeometry }
        : EMPTY_FC
    );

    // Panels: design steps onward.
    const showPanels = s.step >= 6 && s.design?.panels?.length;
    setSource(map, "sd-panels", {
      type: "FeatureCollection",
      features: showPanels
        ? s.design.panels.map((p) => ({
            type: "Feature",
            properties: { id: p.id, enabled: p.enabled !== false },
            geometry: { type: "Polygon", coordinates: p.coordinates },
          }))
        : [],
    });
  }

  function syncLabels() {
    const map = mapRef.current;
    if (!map || !loadedRef.current || liveDrawingRef.current) return;
    const s = useDesignStore.getState();
    const editor = s.step === 2 || s.step === 3;
    if (editor && s.roof.polygon?.coordinates?.[0]) {
      setSource(map, "sd-labels", buildLabelFeatures(s.roof.polygon.coordinates[0], { closed: true }));
    } else {
      setSource(map, "sd-labels", EMPTY_FC);
    }
  }

  // ── Store-driven effects ──────────────────────────────────────────

  // Location: cinematic fly-in + draggable pin (step 1).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !location?.coordinates) return;

    map.flyTo({
      center: location.coordinates,
      zoom: 19.2,
      pitch: 0,
      bearing: 0,
      duration: 2600,
      curve: 1.55,
      essential: true,
    });

    if (!markerRef.current) {
      const el = document.createElement("div");
      el.className = "sd-map-location-marker";
      el.setAttribute("aria-label", "Selected project location");
      const marker = new mapboxgl.Marker({ element: el, draggable: true });
      marker.on("dragend", () => {
        const { lng, lat } = marker.getLngLat();
        useDesignStore.getState().updatePin([lng, lat]);
      });
      markerRef.current = marker;
    }
    markerRef.current.setLngLat(location.coordinates).addTo(map);
  }, [location?.coordinates?.[0], location?.coordinates?.[1]]); // eslint-disable-line react-hooks/exhaustive-deps

  // Marker visibility + draggability per step.
  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    marker.setDraggable(step === 1);
    const el = marker.getElement();
    el.style.display = step <= 2 ? "" : "none";
  }, [step]);

  // Camera per step: keep the roof framed once it exists.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !roofPolygon?.coordinates?.[0]?.length) return;
    if (step < 2 || step === 7) return;
    const ring = roofPolygon.coordinates[0];
    const bounds = ring.reduce(
      (b, c) => b.extend(c),
      new mapboxgl.LngLatBounds(ring[0], ring[0])
    );
    map.fitBounds(bounds, { padding: 110, maxZoom: 20.6, duration: 700, pitch: 0, bearing: 0 });
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  // Draw mode: enter/leave drawing or vertex-edit modes.
  useEffect(() => {
    const map = mapRef.current, draw = drawRef.current;
    if (!map || !draw || !loadedRef.current) return;

    if (drawMode === "roof" || drawMode === "obstacle") {
      if (drawMode === "roof") {
        // Redraw replaces the previous outline.
        try { draw.delete("roof-feature"); } catch { /* not present */ }
      }
      draw.changeMode("measured_polygon", { kind: drawMode });
      map.getCanvas().style.cursor = "crosshair";
    } else if (drawMode === "edit") {
      if (draw.get("roof-feature")) {
        draw.changeMode("direct_select", { featureId: "roof-feature" });
      }
    } else {
      const current = draw.getMode?.();
      if (current && current !== "simple_select") draw.changeMode("simple_select");
      map.getCanvas().style.cursor = "";
    }
  }, [drawMode]);

  // Geometry / step changes → resync everything.
  useEffect(() => {
    if (!loadedRef.current) return;
    syncAll();
  }, [step, roofPolygon, obstacles, usableGeometry, design]); // eslint-disable-line react-hooks/exhaustive-deps

  // Snapshot for the proposal when leaving the 2D design step.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    if ((step === 7 || step === 8) && useDesignStore.getState().design) {
      try {
        const dataUrl = map.getCanvas().toDataURL("image/jpeg", 0.85);
        useDesignStore.getState().setSnapshot("mapSnapshot", dataUrl);
      } catch { /* canvas capture unavailable */ }
    }
  }, [step]);

  // Keyboard: undo/redo in editor steps.
  useEffect(() => {
    const onKey = (e) => {
      const s = useDesignStore.getState();
      if (s.step !== 2 && s.step !== 3) return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        s.undo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z")
      ) {
        e.preventDefault();
        s.redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!TOKEN) {
    return (
      <div className="sd-map-container sd-map-token-missing">
        <div>
          <h3>Map unavailable</h3>
          <p>
            <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> is not configured. Add it to
            your environment to enable the Design Studio.
          </p>
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className="sd-map-container" />;
}
