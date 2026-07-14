"use client";

/**
 * Obstacles step — same canvas as the roof editor. Pick a type, set its
 * height, draw its footprint; usable area updates instantly.
 */

import { useState } from "react";
import { Square, Trash2, ArrowRight, ArrowLeft, Plus, Undo2, Redo2 } from "lucide-react";
import { useDesignStore } from "../store/useDesignStore";

export const OBSTACLE_TYPES = [
  { id: "water_tank", label: "Water Tank", icon: "🚰", defaultHeight: 1.5 },
  { id: "solar_heater", label: "Solar Heater", icon: "☀️", defaultHeight: 1.2 },
  { id: "chimney", label: "Chimney", icon: "🏭", defaultHeight: 1.0 },
  { id: "ac_unit", label: "AC Unit", icon: "❄️", defaultHeight: 0.8 },
  { id: "lift_room", label: "Lift Room", icon: "🛗", defaultHeight: 2.8 },
  { id: "skylight", label: "Skylight", icon: "🪟", defaultHeight: 0.3 },
  { id: "tree", label: "Tree Overlap", icon: "🌳", defaultHeight: 4.0 },
  { id: "custom", label: "Custom", icon: "📦", defaultHeight: 1.5 },
];

export default function Step3_Obstacles() {
  const obstacles = useDesignStore((s) => s.obstacles);
  const metrics = useDesignStore((s) => s.metrics);
  const drawMode = useDesignStore((s) => s.ui.drawMode);
  const canUndo = useDesignStore((s) => s.history.past.length > 0);
  const canRedo = useDesignStore((s) => s.history.future.length > 0);
  const {
    startObstacleDraw, removeObstacle, updateObstacle,
    undo, redo, prevStep, nextStep,
  } = useDesignStore.getState();

  const [selectedType, setSelectedType] = useState(null);
  const [height, setHeight] = useState("1.5");
  const isDrawing = drawMode === "obstacle";

  const pickType = (type) => {
    setSelectedType(type);
    setHeight(String(type.defaultHeight));
  };

  const startDraw = () => {
    if (!selectedType) return;
    startObstacleDraw({
      type: selectedType.id,
      label: selectedType.label,
      heightM: Number(height) || selectedType.defaultHeight,
    });
  };

  return (
    <div className="sd-step-animate-in">
      <div className="sd-step-panel-header">
        <h2>Roof Obstacles</h2>
        <p>Mark anything panels cannot sit on — tanks, chimneys, AC units, shade from trees.</p>
      </div>

      <div className="sd-step-panel-body">
        <div className="sd-input-group">
          <label className="sd-input-label">Obstacle type</label>
          <div className="sd-obstacle-types">
            {OBSTACLE_TYPES.map((type) => (
              <button
                key={type.id}
                className={`sd-obstacle-type-btn ${selectedType?.id === type.id ? "selected" : ""}`}
                onClick={() => pickType(type)}
              >
                <span className="sd-obstacle-icon">{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {selectedType && (
          <div className="sd-input-group">
            <label className="sd-input-label">Height ({selectedType.label})</label>
            <div className="sd-input-row">
              <input
                type="number"
                className="sd-input sd-input-with-suffix"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                min={0.1}
                max={12}
                step={0.1}
              />
              <span className="sd-input-suffix">meters</span>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <button
            className={`sd-btn sd-btn-full ${isDrawing ? "sd-btn-secondary" : "sd-btn-primary"}`}
            onClick={startDraw}
            disabled={!selectedType || isDrawing}
            style={{ flex: 1 }}
          >
            {isDrawing ? (
              <>
                <span className="sd-drawing-status-dot" /> Drawing obstacle...
              </>
            ) : (
              <>
                <Plus size={14} /> Draw {selectedType?.label ?? "Obstacle"}
              </>
            )}
          </button>
          <button className="sd-btn sd-btn-ghost" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
            <Undo2 size={14} />
          </button>
          <button className="sd-btn sd-btn-ghost" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">
            <Redo2 size={14} />
          </button>
        </div>

        {isDrawing && (
          <div className="sd-drawing-guide">
            <div className="sd-drawing-guide-title">
              <Square size={14} /> Draw the footprint
            </div>
            <div className="sd-drawing-guide-text">
              Click the corners of the obstacle on the map. Edges snap to right
              angles; click the first point to close.
            </div>
          </div>
        )}

        {metrics && (
          <div className="sd-card">
            <div className="sd-info-rows">
              <div className="sd-info-row sd-info-highlight">
                <span>Usable area</span>
                <strong className="sd-text-green">{Math.round(metrics.usableArea)} m²</strong>
              </div>
              <div className="sd-info-row">
                <span>Obstacles marked</span>
                <strong>{obstacles.length}</strong>
              </div>
            </div>
          </div>
        )}

        {obstacles.length > 0 && (
          <div className="sd-obstacle-list">
            <label className="sd-input-label">Marked obstacles</label>
            {obstacles.map((obs) => (
              <div key={obs.id} className="sd-obstacle-item">
                <div className="sd-obstacle-item-info">
                  <span>{OBSTACLE_TYPES.find((t) => t.id === obs.type)?.icon ?? "📦"}</span>
                  <div>
                    <div>{obs.label}</div>
                    <div className="sd-obstacle-item-meta">
                      Height:{" "}
                      <input
                        type="number"
                        className="sd-inline-input"
                        value={obs.heightM}
                        min={0.1}
                        max={12}
                        step={0.1}
                        onChange={(e) =>
                          updateObstacle(obs.id, { heightM: Number(e.target.value) || 0.1 })
                        }
                      />{" "}
                      m
                    </div>
                  </div>
                </div>
                <button
                  className="sd-obstacle-delete"
                  onClick={() => removeObstacle(obs.id)}
                  title="Remove obstacle"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {obstacles.length === 0 && !isDrawing && (
          <div className="sd-empty-state" style={{ padding: "20px 16px" }}>
            <p>No obstacles marked. If your roof is clear, continue to the next step.</p>
          </div>
        )}
      </div>

      <div className="sd-step-panel-footer">
        <button className="sd-btn sd-btn-secondary" onClick={prevStep}>
          <ArrowLeft size={14} /> Back
        </button>
        <button className="sd-btn sd-btn-primary" onClick={nextStep}>
          Energy Profile <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
