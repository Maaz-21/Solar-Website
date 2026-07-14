"use client";

/**
 * Design Studio store — single source of truth for the whole wizard.
 *
 * Dependency DAG (any change flows downstream, never silently upstream):
 *
 *   location → roof polygon → obstacles → metrics → design → report
 *                  ↑ tilt/setback/settings ─┘           ↑ energy profile
 *
 * Rules encoded here:
 *  - Every geometry mutation recomputes `metrics` immediately (client-side
 *    engine — no server round-trip) and marks any generated design stale.
 *  - Undo/redo covers geometry (roof + obstacles) with a snapshot history.
 *  - The placement engine runs ONLY via generateDesign() — triggered from
 *    the Project Summary step's "Generate Design" button (user amendment #3).
 *  - Drafts persist to sessionStorage so a refresh never loses work.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  computeRoofMetrics,
  generatePanelLayout,
  generateOptimalLayout,
  buildEnergyReport,
  recommendSystemSize,
  specificYieldFromPSH,
  getOfflinePSH,
  getStateTariff,
  runQualityChecks,
  hasBlockers,
  assessConfidence,
  DEFAULT_PANEL,
  SYSTEM_DEFAULTS,
} from "@/lib/solar-engine";

export const STEPS = [
  { num: 1, key: "location", label: "Location" },
  { num: 2, key: "roof", label: "Roof" },
  { num: 3, key: "obstacles", label: "Obstacles" },
  { num: 4, key: "energy", label: "Energy" },
  { num: 5, key: "summary", label: "Summary" },
  { num: 6, key: "layout", label: "2D Design" },
  { num: 7, key: "three", label: "3D Review" },
  { num: 8, key: "proposal", label: "Proposal" },
];

const MAX_HISTORY = 50;
let obstacleCounter = 0;

const initialGeometry = {
  roof: {
    polygon: null,
    roofType: "flat", // 'flat' | 'pitched'
    tiltDeg: SYSTEM_DEFAULTS.rackingTiltDeg,
    tiltUserEdited: false,
    setbackM: SYSTEM_DEFAULTS.setbackDistanceM,
  },
  obstacles: [],
};

const initialState = {
  step: 1,
  maxStepReached: 1,
  location: null,
  ...initialGeometry,
  metrics: null,
  energyProfile: null,
  irradiance: null, // { specificYield, monthlyYieldPerKWp, source }
  design: null, // panel layout with per-panel enabled flags
  designStale: false,
  designSettings: {
    panelOrientation: "auto", // 'auto' | 'portrait' | 'landscape'
    walkwayEveryNRows: SYSTEM_DEFAULTS.walkwayEveryNRows,
    walkwayWidthM: SYSTEM_DEFAULTS.walkwayWidthM,
  },
  report: null,
  confidence: null,
  history: { past: [], future: [] },
  ui: {
    drawMode: null, // null | 'roof' | 'obstacle' | 'edit'
    pendingObstacle: null,
    error: null,
    saveStatus: null,
    savedProjectId: null,
    isGenerating: false,
    draftRestored: false,
    mapSnapshot: null,
    threeSnapshot: null,
  },
};

// ─── Pure helpers ───────────────────────────────────────────────────────────

function computeMetrics({ roof, obstacles, location }) {
  if (!roof.polygon?.coordinates) return null;
  return computeRoofMetrics(
    roof.polygon.coordinates,
    obstacles,
    roof.setbackM,
    location?.coordinates?.[1] ?? 20
  );
}

function geometrySnapshot(state) {
  return JSON.parse(
    JSON.stringify({ polygon: state.roof.polygon, obstacles: state.obstacles })
  );
}

/** Azimuth used for energy: pitched roofs face their orientation; flat-roof
 *  racking faces the equator regardless of building rotation. */
export function energyAzimuth(state) {
  const lat = state.location?.coordinates?.[1] ?? 20;
  if (state.roof.roofType === "pitched" && state.metrics) return state.metrics.orientation;
  return lat >= 0 ? 180 : 0;
}

function activePanels(design) {
  return design?.panels?.filter((p) => p.enabled !== false) ?? [];
}

export function activeSystemKW(design) {
  const wattage = design?.panelSpecs?.wattage ?? DEFAULT_PANEL.wattage;
  return Math.round(activePanels(design).length * wattage) / 1000;
}

function buildReport(state, design) {
  const systemSizeKW = activeSystemKW(design);
  if (!systemSizeKW || !state.irradiance) return null;
  return buildEnergyReport({
    systemSizeKW,
    specificYield: state.irradiance.specificYield,
    yieldSource: state.irradiance.source,
    monthlyYieldPerKWp: state.irradiance.monthlyYieldPerKWp,
    tariff: state.energyProfile?.tariff ?? getStateTariff(state.location?.state ?? ""),
    panelCount: activePanels(design).length,
    subsidySchemeId: "pm-surya-ghar",
  });
}

function buildConfidence(state) {
  return assessConfidence({
    locationConfirmed: !!state.location?.pinConfirmed,
    roofDrawn: !!state.roof.polygon,
    tiltUserEdited: state.roof.tiltUserEdited,
    yieldSource: state.irradiance?.source ?? "table",
    usageProvided: !!state.energyProfile && state.energyProfile.mode !== "skipped",
    obstaclesMarked: state.obstacles.length > 0,
  });
}

function runLayout(state) {
  if (!state.metrics?.usableGeometry) return null;

  const lat = state.location?.coordinates?.[1] ?? 20;
  const flushMount = state.roof.roofType === "pitched";
  const walkway =
    state.designSettings.walkwayEveryNRows > 0
      ? {
          everyNRows: state.designSettings.walkwayEveryNRows,
          widthM: state.designSettings.walkwayWidthM,
        }
      : { everyNRows: 0, widthM: 0 };

  const maxPanelCount = state.energyProfile?.recommendedKW
    ? Math.max(1, Math.round((state.energyProfile.recommendedKW * 1000) / DEFAULT_PANEL.wattage))
    : null;

  const params = {
    usableGeometry: state.metrics.usableGeometry,
    edgeBearing: state.metrics.edgeBearing,
    latitude: lat,
    tiltDeg: state.roof.tiltDeg,
    flushMount,
    walkway,
    roofAreaM2: state.metrics.totalArea,
    maxPanelCount,
  };

  const layout =
    state.designSettings.panelOrientation === "auto"
      ? generateOptimalLayout(params)
      : generatePanelLayout({ ...params, panelOrientation: state.designSettings.panelOrientation });

  layout.panels = layout.panels.map((p) => ({ ...p, enabled: true }));
  return layout;
}

async function fetchIrradiance(state) {
  const [lng, lat] = state.location?.coordinates ?? [];
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    tilt: String(state.roof.tiltDeg),
    azimuth: String(energyAzimuth(state)),
    city: state.location?.city ?? "",
    state: state.location?.state ?? "",
  });
  try {
    const res = await fetch(`/api/solar-design/irradiance?${params}`);
    const data = await res.json();
    if (data.success && data.specificYield) {
      return {
        specificYield: data.specificYield,
        monthlyYieldPerKWp: data.monthlyYieldPerKWp ?? null,
        source: data.source,
      };
    }
  } catch {
    /* fall through to offline */
  }
  const offline = getOfflinePSH({
    city: state.location?.city ?? "",
    state: state.location?.state ?? "",
    lat,
    lng,
  });
  return {
    specificYield: Math.round(specificYieldFromPSH(offline.psh)),
    monthlyYieldPerKWp: null,
    source: offline.source,
  };
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useDesignStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // ── Navigation ────────────────────────────────────────────────
      goToStep: (step) =>
        set((s) => ({
          step: Math.min(Math.max(step, 1), 8),
          maxStepReached: Math.max(s.maxStepReached, step),
          ui: { ...s.ui, drawMode: null, error: null },
        })),
      nextStep: () => get().goToStep(get().step + 1),
      prevStep: () => get().goToStep(get().step - 1),

      // ── Location ──────────────────────────────────────────────────
      setLocation: (location) =>
        set((s) => ({
          location: { ...location, pinConfirmed: false },
          ...JSON.parse(JSON.stringify(initialGeometry)),
          metrics: null,
          irradiance: null,
          design: null,
          designStale: false,
          report: null,
          confidence: null,
          history: { past: [], future: [] },
          maxStepReached: 1,
          ui: { ...s.ui, drawMode: null, error: null },
        })),

      updatePin: (coordinates) =>
        set((s) =>
          s.location
            ? { location: { ...s.location, coordinates, pinConfirmed: false } }
            : {}
        ),

      confirmPin: () =>
        set((s) =>
          s.location ? { location: { ...s.location, pinConfirmed: true } } : {}
        ),

      // ── Geometry history ──────────────────────────────────────────
      pushHistory: () =>
        set((s) => ({
          history: {
            past: [...s.history.past.slice(-MAX_HISTORY + 1), geometrySnapshot(s)],
            future: [],
          },
        })),

      undo: () => {
        const s = get();
        const prev = s.history.past[s.history.past.length - 1];
        if (!prev) return;
        const current = geometrySnapshot(s);
        const roof = { ...s.roof, polygon: prev.polygon };
        const obstacles = prev.obstacles;
        set({
          roof,
          obstacles,
          metrics: computeMetrics({ roof, obstacles, location: s.location }),
          history: { past: s.history.past.slice(0, -1), future: [current, ...s.history.future] },
          design: null,
          designStale: false,
          report: null,
        });
      },

      redo: () => {
        const s = get();
        const next = s.history.future[0];
        if (!next) return;
        const current = geometrySnapshot(s);
        const roof = { ...s.roof, polygon: next.polygon };
        const obstacles = next.obstacles;
        set({
          roof,
          obstacles,
          metrics: computeMetrics({ roof, obstacles, location: s.location }),
          history: { past: [...s.history.past, current], future: s.history.future.slice(1) },
          design: null,
          designStale: false,
          report: null,
        });
      },

      // ── Roof ──────────────────────────────────────────────────────
      /** fromEdit = vertex-level edit (keeps obstacles); fresh draw clears them (B3). */
      setRoofPolygon: (polygon, { fromEdit = false } = {}) => {
        const s = get();
        get().pushHistory();
        const roof = { ...s.roof, polygon };
        const obstacles = fromEdit ? s.obstacles : [];
        set({
          roof,
          obstacles,
          metrics: computeMetrics({ roof, obstacles, location: s.location }),
          design: null,
          designStale: false,
          report: null,
          ui: { ...s.ui, drawMode: null },
        });
      },

      clearRoof: () => {
        const s = get();
        get().pushHistory();
        const roof = { ...s.roof, polygon: null };
        set({
          roof,
          obstacles: [],
          metrics: null,
          design: null,
          designStale: false,
          report: null,
          ui: { ...s.ui, drawMode: null },
        });
      },

      setRoofType: (roofType) =>
        set((s) => {
          const roof = {
            ...s.roof,
            roofType,
            tiltDeg: s.roof.tiltUserEdited
              ? s.roof.tiltDeg
              : roofType === "pitched"
              ? 20
              : SYSTEM_DEFAULTS.rackingTiltDeg,
          };
          return {
            roof,
            designSettings: {
              ...s.designSettings,
              walkwayEveryNRows:
                roofType === "pitched" ? 0 : SYSTEM_DEFAULTS.walkwayEveryNRows,
            },
            designStale: !!s.design,
            irradiance: null, // tilt/azimuth changed → refetch
          };
        }),

      setTilt: (tiltDeg) =>
        set((s) => ({
          roof: { ...s.roof, tiltDeg, tiltUserEdited: true },
          designStale: !!s.design,
          irradiance: null,
        })),

      setSetback: (setbackM) => {
        const s = get();
        const roof = { ...s.roof, setbackM };
        set({
          roof,
          metrics: computeMetrics({ roof, obstacles: s.obstacles, location: s.location }),
          designStale: !!s.design,
        });
      },

      // ── Obstacles ─────────────────────────────────────────────────
      startObstacleDraw: (meta) =>
        set((s) => ({ ui: { ...s.ui, pendingObstacle: meta, drawMode: "obstacle" } })),

      addObstacle: (polygon) => {
        const s = get();
        get().pushHistory();
        const meta = s.ui.pendingObstacle ?? {};
        const obstacle = {
          id: `obs-${Date.now().toString(36)}-${obstacleCounter++}`,
          polygon,
          type: meta.type ?? "custom",
          label: meta.label ?? "Obstacle",
          heightM: meta.heightM ?? 1.5,
        };
        const obstacles = [...s.obstacles, obstacle];
        set({
          obstacles,
          metrics: computeMetrics({ roof: s.roof, obstacles, location: s.location }),
          design: null,
          designStale: false,
          report: null,
          ui: { ...s.ui, drawMode: null, pendingObstacle: null },
        });
      },

      updateObstacle: (id, patch) => {
        const s = get();
        if (patch.polygon) get().pushHistory();
        const obstacles = s.obstacles.map((o) => (o.id === id ? { ...o, ...patch } : o));
        set({
          obstacles,
          metrics: patch.polygon
            ? computeMetrics({ roof: s.roof, obstacles, location: s.location })
            : s.metrics,
          designStale: !!s.design,
        });
      },

      removeObstacle: (id) => {
        const s = get();
        get().pushHistory();
        const obstacles = s.obstacles.filter((o) => o.id !== id);
        set({
          obstacles,
          metrics: computeMetrics({ roof: s.roof, obstacles, location: s.location }),
          design: null,
          designStale: false,
          report: null,
        });
      },

      // ── Energy profile ────────────────────────────────────────────
      setEnergyProfile: async (profile) => {
        const s = get();
        let irradiance = s.irradiance;
        if (!irradiance) {
          irradiance = await fetchIrradiance(s);
          set({ irradiance });
        }
        const rec =
          profile && profile.mode !== "skipped"
            ? recommendSystemSize({
                monthlyUsageKWh: profile.monthlyUnits,
                coverage: profile.coverage,
                evCharging: profile.evCharging,
                batteryBackup: profile.batteryBackup,
                specificYield: irradiance.specificYield,
              })
            : null;
        set((st) => ({
          energyProfile: profile
            ? { ...profile, recommendedKW: rec?.recommendedKW ?? 0 }
            : null,
          designStale: !!st.design,
        }));
      },

      // ── Quality & summary ─────────────────────────────────────────
      qualityFindings: () => {
        const s = get();
        return runQualityChecks({
          roofPolygon: s.roof.polygon,
          obstacles: s.obstacles,
          metrics: s.metrics,
        });
      },

      canGenerate: () => {
        const s = get();
        return (
          !!s.metrics?.usableGeometry &&
          !hasBlockers(get().qualityFindings()) &&
          !s.ui.isGenerating
        );
      },

      // ── Design generation (only entry point to the placement engine) ──
      generateDesign: async () => {
        const s = get();
        if (!s.metrics?.usableGeometry) return;
        set((st) => ({ ui: { ...st.ui, isGenerating: true, error: null } }));
        try {
          let irradiance = get().irradiance;
          if (!irradiance) {
            irradiance = await fetchIrradiance(get());
            set({ irradiance });
          }
          const design = runLayout(get());
          if (!design || design.panelCount === 0) {
            throw new Error(
              "No panels fit the usable area. Reduce the setback, review obstacles, or check the roof outline."
            );
          }
          const report = buildReport({ ...get(), irradiance }, design);
          set((st) => ({
            design,
            designStale: false,
            report,
            confidence: buildConfidence({ ...st, irradiance }),
            ui: { ...st.ui, isGenerating: false },
          }));
        } catch (err) {
          set((st) => ({
            ui: { ...st.ui, isGenerating: false, error: err.message },
          }));
        }
      },

      // ── 2D design edits (all recalculate live, no network) ────────
      togglePanel: (panelId) => {
        const s = get();
        if (!s.design) return;
        const panels = s.design.panels.map((p) =>
          p.id === panelId ? { ...p, enabled: p.enabled === false } : p
        );
        const design = { ...s.design, panels };
        set({ design, report: buildReport(s, design) });
      },

      setPanelOrientation: (panelOrientation) => {
        const s = get();
        set({ designSettings: { ...s.designSettings, panelOrientation } });
        if (s.design) {
          const design = runLayout({ ...get() });
          if (design) {
            design.panels = design.panels.map((p) => ({ ...p, enabled: true }));
            set({ design, report: buildReport(get(), design) });
          }
        }
      },

      setWalkway: (everyNRows, widthM) => {
        const s = get();
        set({
          designSettings: {
            ...s.designSettings,
            walkwayEveryNRows: everyNRows,
            walkwayWidthM: widthM ?? s.designSettings.walkwayWidthM,
          },
        });
        if (s.design) {
          const design = runLayout(get());
          if (design) set({ design, report: buildReport(get(), design) });
        }
      },

      // ── Snapshots & save ──────────────────────────────────────────
      setSnapshot: (kind, dataUrl) =>
        set((s) => ({ ui: { ...s.ui, [kind]: dataUrl } })),

      saveProject: async (customerInfo) => {
        const s = get();
        set((st) => ({ ui: { ...st.ui, saveStatus: "saving" } }));
        try {
          const res = await fetch("/api/solar-design/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...customerInfo,
              location: s.location,
              roofPolygon: s.roof.polygon ?? {},
              roof: {
                roofType: s.roof.roofType,
                tiltDeg: s.roof.tiltDeg,
                tiltUserEdited: s.roof.tiltUserEdited,
                setbackM: s.roof.setbackM,
              },
              obstacles: s.obstacles.map((o) => ({
                polygon: o.polygon,
                obstacleType: o.type,
                label: o.label,
                heightM: o.heightM,
              })),
              electricityProfile: s.energyProfile ?? { mode: "skipped" },
              panelLayout: s.design ?? {},
              energyReport: s.report ?? {},
              roofMetrics: s.metrics
                ? { ...s.metrics, usableGeometry: undefined }
                : {},
              confidence: s.confidence ?? {},
              status: "designed",
            }),
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.error || "Save failed");
          set((st) => ({
            ui: { ...st.ui, saveStatus: "saved", savedProjectId: data.project?._id ?? null },
          }));
        } catch (err) {
          set((st) => ({ ui: { ...st.ui, saveStatus: "error", error: err.message } }));
        }
      },

      // ── UI ────────────────────────────────────────────────────────
      setDrawMode: (drawMode) => set((s) => ({ ui: { ...s.ui, drawMode } })),
      setError: (error) => set((s) => ({ ui: { ...s.ui, error } })),
      clearDraftRestored: () => set((s) => ({ ui: { ...s.ui, draftRestored: false } })),

      reset: () => set({ ...JSON.parse(JSON.stringify(initialState)) }),
    }),
    {
      name: "sd-draft-v1",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({
        step: s.step,
        maxStepReached: s.maxStepReached,
        location: s.location,
        roof: s.roof,
        obstacles: s.obstacles,
        energyProfile: s.energyProfile,
        irradiance: s.irradiance,
        designSettings: s.designSettings,
        design: s.design,
        designStale: s.designStale,
        report: s.report,
        confidence: s.confidence,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // usableGeometry is stripped from persisted metrics; recompute.
        const metrics = computeMetrics(state);
        useDesignStore.setState({
          metrics,
          ui: {
            ...initialState.ui,
            draftRestored: !!(state.location || state.roof?.polygon),
          },
          history: { past: [], future: [] },
        });
      },
    }
  )
);
