"use client";

import { Eye, Box, RotateCw, ArrowRight, ArrowLeft } from "lucide-react";

export default function Step8_DesignReview({
  viewMode,
  onViewModeChange,
  panelLayout,
  roofMetrics,
  onBack,
  onNext,
}) {
  return (
    <div className="sd-step-animate-in">
      <div className="sd-step-panel-header">
        <h2>🏗️ 3D Design Review</h2>
        <p>Inspect your solar installation from different angles.</p>
      </div>

      <div className="sd-step-panel-body">
        {/* View toggle */}
        <div className="sd-view-toggle">
          <button
            className={`sd-view-toggle-btn ${viewMode === "2d" ? "active" : ""}`}
            onClick={() => onViewModeChange("2d")}
          >
            <Eye size={14} /> 2D View
          </button>
          <button
            className={`sd-view-toggle-btn ${viewMode === "3d" ? "active" : ""}`}
            onClick={() => onViewModeChange("3d")}
          >
            <Box size={14} /> 3D View
          </button>
        </div>

        {viewMode === "3d" && (
          <div className="sd-drawing-guide">
            <div className="sd-drawing-guide-title">
              <RotateCw size={14} /> Navigation Controls
            </div>
            <div className="sd-drawing-guide-text">
              • <strong>Right-click + drag</strong> to rotate the view<br />
              • <strong>Scroll</strong> to zoom in/out<br />
              • <strong>Ctrl + drag</strong> to change pitch
            </div>
          </div>
        )}

        {/* Summary */}
        {panelLayout && (
          <div className="sd-card">
            <div className="sd-card-title">
              <Eye size={14} /> Design Summary
            </div>
            <div className="sd-info-rows">
              <div className="sd-info-row">
                <span>Panels</span>
                <strong>{panelLayout.panelCount}</strong>
              </div>
              <div className="sd-info-row">
                <span>System Size</span>
                <strong>{panelLayout.systemSizeKW} kW</strong>
              </div>
              <div className="sd-info-row">
                <span>Panel Area</span>
                <strong>{panelLayout.totalPanelArea} m²</strong>
              </div>
              {roofMetrics && (
                <div className="sd-info-row">
                  <span>Roof Utilization</span>
                  <strong>{panelLayout.roofUtilization}%</strong>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Future editing placeholder */}
        <div className="sd-card" style={{ opacity: 0.5, cursor: "not-allowed" }}>
          <div className="sd-card-title">
            <RotateCw size={14} /> Panel Editing
          </div>
          <div className="sd-drawing-guide-text">
            Manual panel editing (move, rotate, delete, add) — coming in a
            future update.
          </div>
        </div>
      </div>

      <div className="sd-step-panel-footer">
        <button className="sd-btn sd-btn-secondary" onClick={onBack}>
          <ArrowLeft size={14} /> Back
        </button>
        <button className="sd-btn sd-btn-primary" onClick={onNext}>
          View Proposal <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
