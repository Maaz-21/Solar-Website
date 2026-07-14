"use client";

/**
 * Roof editor step — CAD-style drawing with live measurements on the map.
 * Roof type and tilt are USER inputs (never auto-estimated); the setback
 * slider previews usable area live via the client-side engine.
 */

import {
  PenTool, RotateCcw, ArrowRight, ArrowLeft, Info, Undo2, Redo2,
  Pencil, Compass, Ruler,
} from "lucide-react";
import { useDesignStore } from "../store/useDesignStore";

function orientationLabel(deg) {
  if (deg === null || deg === undefined) return "—";
  const d = ((deg % 360) + 360) % 360;
  const dirs = ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"];
  return `${Math.round(d)}° (${dirs[Math.round(d / 45) % 8]})`;
}

export default function Step2_Roof() {
  const roof = useDesignStore((s) => s.roof);
  const metrics = useDesignStore((s) => s.metrics);
  const drawMode = useDesignStore((s) => s.ui.drawMode);
  const canUndo = useDesignStore((s) => s.history.past.length > 0);
  const canRedo = useDesignStore((s) => s.history.future.length > 0);
  const {
    setDrawMode, clearRoof, setRoofType, setTilt, setSetback,
    undo, redo, prevStep, nextStep,
  } = useDesignStore.getState();

  const isDrawing = drawMode === "roof";
  const isEditing = drawMode === "edit";
  const hasRoof = !!roof.polygon;

  return (
    <div className="sd-step-animate-in">
      <div className="sd-step-panel-header">
        <h2>Roof Outline</h2>
        <p>Trace your roof on the satellite image. Edge lengths and area update live.</p>
      </div>

      <div className="sd-step-panel-body">
        {!hasRoof && !isDrawing && (
          <div className="sd-drawing-guide">
            <div className="sd-drawing-guide-title">
              <Info size={14} /> How to draw
            </div>
            <div className="sd-drawing-guide-text">
              1. Click <strong>Draw Roof</strong>, then click each corner of your roof<br />
              2. Edges snap to right angles automatically<br />
              3. Click the first point (or press <kbd>Enter</kbd>) to close —{" "}
              <kbd>Backspace</kbd> removes the last point, <kbd>Esc</kbd> cancels
            </div>
          </div>
        )}

        {isDrawing && (
          <div className="sd-drawing-status">
            <span className="sd-drawing-status-dot" />
            Drawing — click corners on the map · <kbd>Backspace</kbd> undo point · <kbd>Esc</kbd> cancel
          </div>
        )}
        {isEditing && (
          <div className="sd-drawing-status">
            <span className="sd-drawing-status-dot" />
            Editing — drag corners; drag edge midpoints to add corners
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {!hasRoof ? (
            <button
              className={`sd-btn sd-btn-full ${isDrawing ? "sd-btn-secondary" : "sd-btn-primary"}`}
              onClick={() => setDrawMode("roof")}
              disabled={isDrawing}
            >
              <PenTool size={14} /> {isDrawing ? "Drawing..." : "Draw Roof"}
            </button>
          ) : (
            <>
              <button
                className={`sd-btn ${isEditing ? "sd-btn-primary" : "sd-btn-secondary"}`}
                style={{ flex: 1 }}
                onClick={() => setDrawMode(isEditing ? null : "edit")}
              >
                <Pencil size={14} /> {isEditing ? "Done" : "Edit Shape"}
              </button>
              <button
                className="sd-btn sd-btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setDrawMode("roof")}
              >
                <RotateCcw size={14} /> Redraw
              </button>
            </>
          )}
          <button className="sd-btn sd-btn-ghost" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
            <Undo2 size={14} />
          </button>
          <button className="sd-btn sd-btn-ghost" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">
            <Redo2 size={14} />
          </button>
        </div>

        {/* Live measurements */}
        {hasRoof && metrics && (
          <div className="sd-card">
            <div className="sd-card-title">
              <Ruler size={14} /> Measurements
            </div>
            <div className="sd-info-rows">
              <div className="sd-info-row">
                <span>Total roof area</span>
                <strong>{Math.round(metrics.totalArea)} m²</strong>
              </div>
              <div className="sd-info-row sd-info-highlight">
                <span>Usable area (after setback)</span>
                <strong className="sd-text-green">{Math.round(metrics.usableArea)} m²</strong>
              </div>
              <div className="sd-info-row">
                <span>Perimeter</span>
                <strong>{metrics.perimeterM} m</strong>
              </div>
              <div className="sd-info-row">
                <span>Longest / shortest edge</span>
                <strong>{metrics.longestEdgeM} m / {metrics.shortestEdgeM} m</strong>
              </div>
              <div className="sd-info-row">
                <span><Compass size={13} /> Orientation</span>
                <strong>{orientationLabel(metrics.orientation)}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Roof configuration */}
        {hasRoof && (
          <div className="sd-card">
            <div className="sd-card-title">
              <Info size={14} /> Roof Configuration
            </div>

            <div className="sd-input-group">
              <label className="sd-input-label">Roof type</label>
              <div className="sd-toggle-group">
                <button
                  className={`sd-toggle-option ${roof.roofType === "flat" ? "active" : ""}`}
                  onClick={() => setRoofType("flat")}
                >
                  Flat (RCC)
                </button>
                <button
                  className={`sd-toggle-option ${roof.roofType === "pitched" ? "active" : ""}`}
                  onClick={() => setRoofType("pitched")}
                >
                  Pitched / Sloped
                </button>
              </div>
            </div>

            <div className="sd-input-group">
              <label className="sd-input-label">
                {roof.roofType === "flat" ? "Panel mounting tilt (°)" : "Roof slope (°)"}
              </label>
              <div className="sd-input-row">
                <input
                  type="number"
                  className="sd-input sd-input-with-suffix"
                  value={roof.tiltDeg}
                  onChange={(e) => setTilt(Number(e.target.value) || 0)}
                  min={0}
                  max={60}
                  step={1}
                />
                <span className="sd-input-suffix">degrees</span>
              </div>
              <p className="sd-field-note">
                {roof.tiltUserEdited ? "Provided by you" : "Standard default"} — verify on site.
                Slope cannot be measured from satellite imagery.
              </p>
            </div>

            <div className="sd-slider-container">
              <div className="sd-slider-header">
                <span className="sd-input-label" style={{ margin: 0 }}>Edge setback</span>
                <strong style={{ color: "var(--sd-primary-light)", fontSize: 13 }}>
                  {roof.setbackM.toFixed(1)} m
                </strong>
              </div>
              <input
                type="range"
                className="sd-slider"
                min={0}
                max={2}
                step={0.1}
                value={roof.setbackM}
                onChange={(e) => setSetback(Number(e.target.value))}
              />
              <p className="sd-field-note">
                Safety and maintenance clearance from the roof edge — the dashed
                inner outline on the map updates live.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="sd-step-panel-footer">
        <button className="sd-btn sd-btn-secondary" onClick={prevStep}>
          <ArrowLeft size={14} /> Back
        </button>
        <button
          className="sd-btn sd-btn-primary"
          onClick={() => nextStep()}
          disabled={!hasRoof || !metrics?.usableArea}
        >
          Mark Obstacles <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
