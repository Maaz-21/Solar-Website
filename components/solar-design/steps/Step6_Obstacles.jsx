"use client";

import { useState } from "react";
import { Square, Trash2, ArrowRight, ArrowLeft, Plus } from "lucide-react";

const OBSTACLE_TYPES = [
  { id: "water_tank", label: "Water Tank", icon: "🚰" },
  { id: "solar_heater", label: "Solar Heater", icon: "☀️" },
  { id: "chimney", label: "Chimney", icon: "🏠" },
  { id: "ac_unit", label: "AC Unit", icon: "❄️" },
  { id: "lift_room", label: "Lift Room", icon: "🛗" },
  { id: "custom", label: "Custom", icon: "📦" },
];

export default function Step6_Obstacles({
  obstacles,
  isDrawing,
  onAddObstacle,
  onDeleteObstacle,
  onStartDraw,
  onBack,
  onNext,
}) {
  const [selectedType, setSelectedType] = useState(null);
  const [obstacleHeight, setObstacleHeight] = useState("1.5");

  const handleStartDrawObstacle = () => {
    if (!selectedType) return;
    onStartDraw({
      type: selectedType.id,
      label: selectedType.label,
      heightM: Number(obstacleHeight) || 1.5,
    });
  };

  const handleSkip = () => {
    onNext();
  };

  return (
    <div className="sd-step-animate-in">
      <div className="sd-step-panel-header">
        <h2>🚧 Roof Obstacles</h2>
        <p>Mark any obstacles on your roof that panels cannot be placed on.</p>
      </div>

      <div className="sd-step-panel-body">
        {/* Type selector */}
        <div className="sd-input-group">
          <label className="sd-input-label">Obstacle Type</label>
          <div className="sd-obstacle-types">
            {OBSTACLE_TYPES.map((type) => (
              <button
                key={type.id}
                className={`sd-obstacle-type-btn ${
                  selectedType?.id === type.id ? "selected" : ""
                }`}
                onClick={() => setSelectedType(type)}
              >
                <span className="sd-obstacle-icon">{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Height input */}
        {selectedType && (
          <div className="sd-input-group">
            <label className="sd-input-label">
              Height ({selectedType.label})
            </label>
            <div className="sd-input-row">
              <input
                type="number"
                className="sd-input sd-input-with-suffix"
                value={obstacleHeight}
                onChange={(e) => setObstacleHeight(e.target.value)}
                min={0.1}
                max={10}
                step={0.1}
              />
              <span className="sd-input-suffix">meters</span>
            </div>
          </div>
        )}

        {/* Draw button */}
        <button
          className={`sd-btn sd-btn-full ${isDrawing ? "sd-btn-secondary" : "sd-btn-primary"}`}
          onClick={handleStartDrawObstacle}
          disabled={!selectedType || isDrawing}
          style={{ marginBottom: 14 }}
        >
          {isDrawing ? (
            <>
              <span className="sd-drawing-status-dot" /> Drawing obstacle...
            </>
          ) : (
            <>
              <Plus size={14} /> Draw {selectedType?.label || "Obstacle"} on Map
            </>
          )}
        </button>

        {isDrawing && (
          <div className="sd-drawing-guide">
            <div className="sd-drawing-guide-title">
              <Square size={14} /> Draw Obstacle Boundary
            </div>
            <div className="sd-drawing-guide-text">
              Click on the map to mark the corners of the obstacle.
              Double-click to complete the shape.
            </div>
          </div>
        )}

        {/* Obstacle list */}
        {obstacles.length > 0 && (
          <div className="sd-obstacle-list">
            <label className="sd-input-label">
              Marked Obstacles ({obstacles.length})
            </label>
            {obstacles.map((obs, idx) => (
              <div key={idx} className="sd-obstacle-item">
                <div className="sd-obstacle-item-info">
                  <span>{OBSTACLE_TYPES.find((t) => t.id === obs.type)?.icon || "📦"}</span>
                  <div>
                    <div>{obs.label || "Obstacle"}</div>
                    <div className="sd-obstacle-item-meta">
                      Height: {obs.heightM || "—"}m
                    </div>
                  </div>
                </div>
                <button
                  className="sd-obstacle-delete"
                  onClick={() => onDeleteObstacle(idx)}
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
            <p>No obstacles marked. If your roof is clear, skip this step.</p>
          </div>
        )}
      </div>

      <div className="sd-step-panel-footer">
        <button className="sd-btn sd-btn-secondary" onClick={onBack}>
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          {obstacles.length === 0 && (
            <button className="sd-btn sd-btn-ghost" onClick={handleSkip}>
              Skip
            </button>
          )}
          <button className="sd-btn sd-btn-primary" onClick={onNext}>
            Generate Design <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
