"use client";

import { PenTool, RotateCcw, ArrowRight, ArrowLeft, Info } from "lucide-react";

export default function Step3_RoofDetection({
  roofPolygon,
  isDrawing,
  onStartDraw,
  onClearRoof,
  onBack,
  onNext,
}) {
  const pointCount = roofPolygon?.coordinates?.[0]?.length
    ? roofPolygon.coordinates[0].length - 1  // GeoJSON closes the ring
    : 0;

  return (
    <div className="sd-step-animate-in">
      <div className="sd-step-panel-header">
        <h2>🏠 Roof Detection</h2>
        <p>Outline your rooftop by clicking on the map to place corner points.</p>
      </div>

      <div className="sd-step-panel-body">
        {/* Drawing guide */}
        <div className="sd-drawing-guide">
          <div className="sd-drawing-guide-title">
            <Info size={14} /> How to Draw
          </div>
          <div className="sd-drawing-guide-text">
            1. Click <strong>Draw Roof</strong> below to start<br />
            2. Click on each corner of your roof on the map<br />
            3. Double-click or click the first point to complete the shape
          </div>
        </div>

        {/* Auto-detect placeholder */}
        <button
          className="sd-btn sd-btn-secondary sd-btn-full"
          disabled
          title="Coming soon — AI-powered roof detection"
          style={{ marginBottom: 14 }}
        >
          🤖 Detect Automatically (Coming Soon)
        </button>

        {/* Drawing status */}
        {isDrawing && (
          <div className="sd-drawing-status">
            <span className="sd-drawing-status-dot" />
            Drawing mode active — click on the map to place points
          </div>
        )}

        {/* Roof drawn result */}
        {roofPolygon && !isDrawing && (
          <div className="sd-card">
            <div className="sd-card-title">
              <PenTool size={14} /> Roof Outline
            </div>
            <div className="sd-info-rows">
              <div className="sd-info-row">
                <span>Status</span>
                <strong style={{ color: "var(--sd-primary-light)" }}>✓ Drawn</strong>
              </div>
              <div className="sd-info-row">
                <span>Corner Points</span>
                <strong>{pointCount}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          {!roofPolygon && (
            <button
              className={`sd-btn sd-btn-full ${isDrawing ? "sd-btn-secondary" : "sd-btn-primary"}`}
              onClick={onStartDraw}
            >
              <PenTool size={14} />
              {isDrawing ? "Drawing..." : "Draw Roof"}
            </button>
          )}
          {roofPolygon && (
            <button className="sd-btn sd-btn-danger sd-btn-full" onClick={onClearRoof}>
              <RotateCcw size={14} /> Redraw Roof
            </button>
          )}
        </div>
      </div>

      <div className="sd-step-panel-footer">
        <button className="sd-btn sd-btn-secondary" onClick={onBack}>
          <ArrowLeft size={14} /> Back
        </button>
        <button
          className="sd-btn sd-btn-primary"
          onClick={onNext}
          disabled={!roofPolygon}
        >
          Review Measurements <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
