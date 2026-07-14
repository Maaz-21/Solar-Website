# Solar Design Studio — Architecture Review & Redesign Plan

> Status: **APPROVED — implementation in progress.** All seven user amendments (see §9) are folded into §3, §4 and §7.
> Scope: `app/(public)/solar-design`, `components/solar-design/**`, `lib/solar-engine/**`, `app/api/solar-design/**`, `models/SolarProject.js`
> Goal: bring the studio to the standard of OpenSolar / Aurora / Solar Ladder within Mapbox + Three.js capabilities, without rewriting the project.

---

## 1. How the feature works today

### 1.1 Data flow

```
Route: app/(public)/solar-design/page.js
  └─ dynamic(ssr:false) → SolarDesignPage.jsx  (444-line orchestrator)
       ├─ 15 useState hooks hold ALL wizard state
       ├─ WizardStepper (9 steps, linear)
       ├─ MapCanvas.jsx (imperative Mapbox GL + mapbox-gl-draw)
       └─ steps/Step1..Step9 (prop-drilled presentational panels)

Server round-trips (pure functions behind fetch):
  POST /api/solar-design/generate-layout   → computeRoofMetrics + generatePanelLayout (Turf.js)
  POST /api/solar-design/calculate-energy  → calculateEnergy (PSH × PR model, India lookup table)
  POST /api/solar-design/projects          → Mongoose save (end of wizard only)
```

### 1.2 State flow

Every piece of state lives as an independent `useState` in `SolarDesignPage`. Downstream
invalidation is done **by hand** in each callback (e.g. `handleLocationSelect` resets 6 states,
`handleClearRoof` resets 4). There is no dependency graph, so several invalidation paths are
missed (see findings B3, B4, B5). Drawing is one-shot: `draw.create` fires → polygon copied to
React state → draw feature deleted → re-rendered as a static layer. **Nothing is editable after
creation** — fixing one vertex means redrawing the entire polygon.

### 1.3 Calculation engine (`lib/solar-engine`)

- `roofGeometry.js` — geodesic area (Turf), orientation = bearing of longest edge + 90°,
  setback via negative buffer, obstacle subtraction via `turf.difference`. Solid basis.
- `panelPlacement.js` — axis-aligned grid scan in *degree space* over the bbox;
  `turf.booleanContains` per candidate cell. The `orientation` parameter is accepted **and
  never used** — panels are always north-south aligned regardless of roof rotation.
- `energyCalculation.js` — `E = kW × PSH × PR`, monthly = daily×30. Irradiance from a
  hard-coded Indian city/state table; anything outside India silently gets 5.0 PSH
  (≈ double the real value for e.g. Germany). No tilt/azimuth correction, no seasonality,
  no subsidy, no net metering.

---

## 2. Findings register

### 2.1 Functional bugs (B)

| # | Finding | Location |
|---|---------|----------|
| B1 | **"Adjust Position" is non-functional.** `isAdjusting` is never passed to `MapCanvas`; no handler updates `location.coordinates`. The UI claims "the marker will stay centered while you pan" — nothing happens. The pin the user confirms may be the wrong building. | `SolarDesignPage.jsx:288`, `Step2_SatelliteVerify.jsx:31-49`, `MapCanvas.jsx:30-42` |
| B2 | **Stale panel layout after edits.** Step 7 auto-generates only when `!panelLayout`. Go back, add/remove an obstacle or change setback, return to Step 7 → the old layout renders with no regeneration and no warning. | `Step7_PanelLayout.jsx:36-41` |
| B3 | **Obstacles survive roof redraws.** `handleClearRoof` resets roof/layout/metrics but not `obstacles`; redrawing the roof elsewhere leaves obstacle polygons floating over the old footprint and still subtracted from the new roof. | `SolarDesignPage.jsx:89-95` |
| B4 | **Setback changes don't invalidate metrics.** Changing setback in Step 4 requires a manual "Recalculate"; if skipped, Step 5's max-capacity check uses stale usable area. | `Step4_MeasurementReview.jsx:94-125` |
| B5 | **Step-order inconsistency.** Usage (Step 5) recommends a system size from usable area *before* obstacles (Step 6) are drawn, using hard-coded PSH=5/PR=0.75 instead of the location-specific values the final report uses — two different answers for the same question. | `Step5_ElectricityUsage.jsx:31-45` |
| B6 | **`roofTilt` is collected and never used.** It feeds no calculation, isn't saved, isn't shown again. A misleading dead input. | `Step4_MeasurementReview.jsx:106-118`, `SolarDesignPage.jsx:35` |
| B7 | **Obstacles are not validated against the roof.** They can be drawn entirely outside the roof polygon; nothing clips or warns. | `SolarDesignPage.jsx:135-148` |
| B8 | **No polygon validation.** Self-intersecting ("bowtie") or sub-1 m² polygons are accepted; Turf area/difference results become garbage silently. | `MapCanvas.jsx:136-156` |
| B9 | **Split roofs can silently lose panels.** When an obstacle splits the usable area into a MultiPolygon, the per-cell `booleanContains` call is wrapped in a bare `try/catch { /* skip */ }` — failures produce zero panels with no error. Needs a regression test. | `panelPlacement.js:58-63` |
| B10 | **"Print / Download PDF" prints the app.** `window.print()` with no `@media print` stylesheet (checked: none in `solar-design.css`) prints the dark UI, navbar and half a map. | `Step9_Proposal.jsx:36-38` |
| B11 | **Dead code / broken promise.** `flyToRoof()` is exposed via ref and never called; the "Detect Automatically" button is permanently disabled; missing `NEXT_PUBLIC_MAPBOX_TOKEN` yields a blank screen with no message. | `MapCanvas.jsx:57`, `Step3_RoofDetection.jsx:38-45` |

### 2.2 Architectural weaknesses (A)

- **A1 — God component.** All state, handlers, fetches and routing in one 444-line component; steps are prop-drilled shells. No dependency model → every invalidation bug above.
- **A2 — Server round-trips for pure client math.** Roof metrics and panel packing are pure Turf.js — running them behind `fetch` makes live feedback (drag setback slider → watch usable area update) architecturally impossible and adds spinner theater.
- **A3 — One-shot drawing.** Draw features are destroyed on completion; mapbox-gl-draw's built-in `direct_select` (vertex drag, midpoint insertion) is unused.
- **A4 — No undo/redo, no draft persistence.** Refresh = lose everything. `sessionStorage`/DB-draft resume missing.
- **A5 — Schema drift.** `SolarProject` stores `roofMetrics.tilt` and `panelSpecs` the client never sends; obstacles in the DB lack `heightM`/`type` that the client collects (`models/SolarProject.js:22-28` only stores `label`).
- **A6 — Legacy geocoding API** (`mapbox.places` v5); v6 / Search Box gives better address-level results worldwide.

### 2.3 Engineering-accuracy gaps (E)

- **E1 — Placement ignores roof orientation** (grid never rotates to the roof's dominant edge). This is the single most visible "amateur" signal vs OpenSolar.
- **E2 — No inter-row spacing / walkways.** Tilted racking on flat roofs (the normal Indian install) needs row pitch from the winter-solstice shadow formula; flush packing overstates capacity ~15-30%.
- **E3 — Worldwide claim, India-only data.** Irradiance table fails abroad. PVGIS v5 (free, no key, covers Europe/Africa/Asia/Americas) and NASA POWER (global) solve this properly and also handle **tilt + azimuth** transposition for free.
- **E4 — No subsidy, no net metering, flat tariff.** For the Indian residential market, PM Surya Ghar subsidy (₹30,000/kW up to 2 kW + ₹18,000 for the 3rd kW, capped ₹78,000 — must remain a configurable table, verified at proposal time) dominates payback. Currently payback is `cost ÷ savings` with no subsidy: materially wrong.
- **E5 — No DC/AC distinction, no inverter/string sizing** despite the proposal claiming a full system design.
- **E6 — Degradation applied to money, linearly** (`1 − 0.005·year`); standard practice is year-1 derate then compounding on *generation*, and financials should discount.

### 2.4 UX gaps (U)

- **U1 — 9 steps is 4 too many.** Satellite-verify is a screen for a single confirmation; measurements/obstacles/roof are three screens for one canvas task.
- **U2 — Drawing is blind.** No live edge lengths, no area readout while drawing, no snapping (right angles / first-vertex close), no vertex editing, no Escape/Enter affordances, no undo.
- **U3 — No direct manipulation of the design.** Panels can't be clicked off/on; "Panel Editing — coming in a future update" card admits it.
- **U4 — "3D" is a camera tilt** with fixed extrusion heights; obstacles aren't even extruded despite heights being collected. No Three.js (not in `package.json`).
- **U5 — No keyboard support, no shortcuts, no mobile consideration** for the drawing surface.

---

## 3. Honest capability assessment

| Wish | Reality | Best practical alternative |
|------|---------|---------------------------|
| Google-Earth-quality imagery | Mapbox satellite is a 2D orthomosaic; native resolution tops out ~z19-20 in metros, lower in small towns. No photogrammetry/45° views. `maxZoom: 22` just overzooms into blur. | Use `satellite-v9` (label-free) with `satellite-streets` toggle; clamp UI zoom to native max; crisp overzoom via raster resampling; smooth `flyTo` choreography and a Google-Earth-style intro animation gives the *feel* without faking data. |
| Automatic roof detection | Needs ML segmentation or a paid API. Google Solar API covers US/EU well but **not India**. | **Not implemented (user decision).** Manual drawing is the one and only path, made CAD-grade (snapping, live measurements, magnetic close, vertex editing). |
| Pitch from satellite | Physically impossible from a single nadir image. | **No automatic tilt estimation (user decision).** Roof-type selector (flat / pitched) sets an editable default; tilt is always user-provided and labelled "verify on site". Flat + tilted racking is the default for India. |
| True shading simulation | Requires 3D context of surrounding buildings/trees. | Obstacle-height shadow footprints on the roof itself (sun position at winter solstice) + a user-set shading-loss %; label as estimate. Full sun-path simulation can come later in the Three.js scene. |

---

## 4. Redesigned user journey (9 steps → 8 steps, amended)

**1 — Locate** *(merges old 1+2)*
Full-screen map with glass search card. Search (Mapbox Geocoding v6, worldwide) or GPS → cinematic flyTo → **draggable marker** with "Is this pin on your roof?" confirm card. One click to proceed.

**2 — Roof** *(CAD editor, no AI detection)*
- Draw tool: live edge lengths (m) per segment while drawing, running area readout, right-angle + first-vertex snapping, Backspace removes last vertex, Escape cancels, Enter/click-first-vertex closes.
- Edit tool: `direct_select` vertex dragging, midpoint insertion.
- Roof type selector (flat / pitched) → editable tilt (never auto-estimated), setback slider with **live** usable-area preview.
- Undo/redo (Ctrl+Z / Ctrl+Y).

**3 — Obstacles** *(same canvas, obstacle tool)*
Palette (water tank, solar heater, chimney, AC unit, lift room, skylight, tree overlap, custom) → draw, set height; validated against roof; usable area updates instantly.

**4 — Energy profile**
Bill ₹ or kWh (tariff auto-defaulted by state, editable), coverage goal, toggles: future EV, battery backup, net metering. Recommendation uses the **same** location/tilt-aware engine as the final report. Skippable (defaults to max-fit).

**5 — Project Summary** *(new — user amendment #3)*
One review card: address, roof area, orientation, tilt, obstacles, monthly usage, goal, recommended system, estimated capacity — each row with an **Edit** button jumping back to its step. **Quality checks** run here (impossible polygon = blocker; roof too small / obstacle overlap / capacity < 1 kW = warnings). The placement engine runs **only** when the user clicks **Generate Design**.

**6 — 2D Design** *(source of truth for all editing)*
Placement runs client-side, panels animate in row by row. Click any panel to toggle off/on, portrait/landscape switch, walkway/setback controls with live re-pack, live KPI bar (panels / kWp / kWh-yr / ₹ saved). **Design Confidence** panel: ★ rating + verified-vs-estimated per input.

**7 — 3D Review** *(viewer only — user amendment #5)*
Three.js scene: extruded building, tilted panel meshes, obstacle boxes, satellite ground texture, orbit/zoom/pan, snapshot export. No 3D editing; "Adjust design" returns to 2D.

**8 — Proposal**
Light-themed print-optimized proposal: map + 3D snapshots, system specs, monthly generation, financials with subsidy line-items, payback, indicative equipment list, assumptions & "verify on site" disclaimers. Save to DB + browser-print PDF.

> Guiding rule (user amendment): every step must reduce uncertainty before the next; auto-calculate wherever possible, ask only when necessary, and never present estimates as facts.

---

## 5. Target architecture

```
lib/solar-engine/            # pure, isomorphic, unit-tested — runs in the BROWSER
  geometry/    polygon.js (validate/area/orientation), setback.js, obstacles.js, local-plane.js
  placement/   packer.js (oriented grid in local meters), rows.js (inter-row pitch), walkways.js
  energy/      irradiance.js (PVGIS/NASA adapters + offline PSH fallback), production.js, losses.js
  financial/   tariffs.js, subsidy.js (config table), roi.js (payback/NPV)
  system/      inverter.js, strings.js (indicative sizing)

components/solar-design/
  store/       useDesignStore.js (Zustand): slices for location/roof/obstacles/design/energy
               + dependency invalidation (location→roof→obstacles→metrics→layout→energy as a DAG)
               + undo/redo history middleware for geometry slices
  map/         MapView.jsx (map lifecycle only), layers/ (roof, obstacles, panels, measurements),
               draw/ (custom draw modes + snapping + live labels), camera.js
  three/       RoofScene.jsx (R3F), meshes/ (roof, panels-instanced, obstacles), controls
  phases/      A_Locate … F_Proposal (thin views reading the store)
  ui/          shared cards, KPI bar, sliders, shortcut hints

app/api/solar-design/
  projects/          persistence (unchanged shape, schema fixed for obstacle height/type, tilt)
  irradiance/        server proxy + cache for PVGIS/NASA POWER (avoids CORS, caches by latlng grid)
```

Key decisions:
1. **Move geometry/energy client-side** (they're already pure JS + Turf). Server keeps persistence and the irradiance proxy. This unlocks every "live" interaction.
2. **Zustand store with an explicit invalidation DAG** — changing any upstream node clears/flags downstream nodes; a "stale" flag drives "Design outdated — regenerate" banners instead of silent wrong data.
3. **Keep mapbox-gl-draw, extend it**: custom draw mode for live measurements + snapping (community `mapbox-gl-draw-snap-mode` as reference), built-in `direct_select` for editing. A from-scratch editor is not justified yet.
4. **Panel packing in a local tangent plane**: project ring to meters at centroid, rotate by −roofAzimuth, grid-pack with row pitch + walkways, rotate/unproject back. Fixes E1/E2 and is faster than degree-space `booleanContains`.
5. **Three.js via react-three-fiber**, mounted only in Phase E's 3D tab (code-split), sharing the store. 2D remains the editing source of truth in the first 3D release; per-panel 3D editing is a later enhancement.

## 6. Engineering methodology (standard formulas only)

- **Production**: PVGIS `PVcalc` (peakpower, angle=tilt, aspect=azimuth−180, loss=14%) → monthly kWh; fallback `E_year = kWp × PSH × 365 × PR` (PR 0.75-0.80) with the existing PSH table, labelled "estimate".
- **Inter-row pitch** (flat roofs, tilt θ): `pitch = L·cosθ + L·sinθ / tan(α)` where α = solar elevation at winter-solstice noon = `90° − |lat| − 23.45°`.
- **System sizing**: `kWp = annual_kWh_target / specific_yield(location, tilt, azimuth)`.
- **Inverter (indicative)**: AC = DC / 1.1–1.25, rounded to market sizes; strings of 8–14 panels within MPPT window; labelled "indicative — final design by installer".
- **Degradation**: 2% year-1, then 0.55%/yr compounding on generation (typical mono-PERC datasheet).
- **Financials**: subsidy table (configurable, PM Surya Ghar defaults), simple + discounted payback, 25-yr cash-flow with tariff escalation (default 3%/yr, editable), CO₂ @ 0.82 kg/kWh (CEA grid factor, keep configurable).
- Every proposal value is tagged **estimate** vs **requires site survey** (tilt, shading, structural).

## 7. Implementation roadmap

Each phase: explain → design → implement → test → refactor. No phase starts until the previous one's exit criteria pass.

| Phase | Scope | Exit criteria |
|-------|-------|---------------|
| **0. Foundation & bug purge** | Zustand store + invalidation DAG; move engine client-side; fix B1-B11; schema fixes (A5); session draft persistence; unit tests for geometry/placement (incl. MultiPolygon regression for B9) | All 9 current steps work with zero stale-state paths; engine tests green; refresh restores session |
| **1. Locate phase** | Merge steps 1+2; Geocoding v6; draggable marker; camera choreography; imagery tuning + zoom clamp; token-missing error state | Worldwide address → correct pin, adjustable, one confirmation |
| **2. Roof editor** | Custom draw mode: live edge lengths/area, snapping, magnetic close; `direct_select` editing; undo/redo; validation (self-intersection, min area); roof type + user-provided tilt (no auto-estimation) | Draw + edit a complex roof without ever redrawing from scratch |
| **3. Obstacles + Project Summary** | Obstacle palette in same canvas; clip/validate to roof; **Project Summary step** with per-row Edit buttons and **quality checks**; engine gated behind "Generate Design" | Obstacle edits instantly update usable area; generation impossible while blockers exist |
| **4. Placement v2 (2D Design)** | Local-plane oriented packing; row pitch + walkways; panel click-toggle; live KPI recalc; **Design Confidence** panel (verified vs estimated) | Panels align to roof orientation; row spacing verifiably correct; toggle updates KPIs <100 ms |
| **5. Energy & financial v2** | PVGIS/NASA proxy + cache + offline fallback; tilt/azimuth-aware sizing; tariff/subsidy/ROI modules; consistent recommendation (fixes B5/E3/E4) | Same engine answers step 4 (Energy) and step 8 (Proposal); abroad locations get real irradiance |
| **6. 3D Review (viewer only)** | R3F scene: extruded roof, instanced panels, obstacle boxes, orbit controls, sun-position light, snapshot export; code-split; **no 3D editing** — 2D stays source of truth | 60 fps orbit on mid hardware; 3D matches 2D layout exactly |
| **7. Proposal & polish** | Print-optimized proposal page, canvas snapshots, PDF, save/resume, keyboard shortcut overlay, transitions/microinteractions pass | Client-ready PDF; full journey < 5 min for a simple roof |

**Dependencies to add**: `zustand`, `three` + `@react-three/fiber` + `@react-three/drei` (Phase 6 only). Everything else uses what's installed.

## 8. Risks

- Turf `booleanContains`/`difference` edge cases (MultiPolygon, holes) — covered by unit tests in Phase 0 before any placement rework.
- PVGIS availability — mitigated by server-side caching + NASA POWER + offline PSH fallback chain.
- mapbox-gl-draw customization limits — spike in Phase 2; fall back to a thin custom pointer-event editor for the draw mode only if snapping proves unworkable.
- Subsidy/tariff figures change — kept as data tables, never hard-coded in formulas, marked with as-of dates.

## 9. User amendments (all incorporated into §3, §4 and §7 above)
1. Don't estimate roof tilt automatically

The plan currently says:

Estimate roof tilt

I would remove that.

2. Don't implement AI roof detection
Skip this entirely.
I'd keep:
Professional CAD roof editor

3. Add a Project Summary step

This is the biggest thing missing.

After:
Roof
↓
Energy
↓
Obstacles

show:

Project Summary
Address
Roof
Area
Orientation
Obstacles
Monthly Usage
Goal
Recommended System
Estimated Capacity.

Buttons:
Edit Roof
Edit Usage
Edit Obstacles
Generate Design

Only after clicking:
Generate Design
should the engine start.

4. Split "Design" into two stages

Instead of:
Generate Layout
↓
3D
I'd do:
2D Design
↓
3D Review

Then:
Satisfied?
↓
Open 3D Viewer
Much smoother.

5. 3D editing

This is the only part I'd scale back.
The roadmap says:
Move panels
Rotate panels
Delete panels
Add panels

inside Three.js.

I wouldn't.

Instead:

2D editor:
Source of truth

3D:
Viewer
Orbit
Measure
Inspect
Export

Trying to build a full CAD editor inside Three.js is a huge project.

6. Add Quality Checks

Before generating:

Roof too small

↓

Warning
Obstacle overlaps

↓

Warning
Impossible polygon

↓

Fix required
Capacity below 1kW

↓

Warning

These are tiny additions that make the software feel professional.

7. Add Design Confidence

After generation:

Confidence

★★★★★

Roof:

Verified

Tilt:

Estimated

Shading:

Estimated

Electricity Usage:

Verified

One thing I think the roadmap should emphasize more:

Every step must reduce uncertainty before moving to the next. The system should automatically detect or calculate wherever possible, ask the user only when necessary, clearly distinguish between measured values and estimates, and never present estimated values as precise facts.