"use client";

import { useState, useEffect } from "react";
import {
  Ruler, Grid3X3, Compass, ArrowRight, ArrowLeft, RefreshCw, Loader2,
} from "lucide-react";

export default function Step4_MeasurementReview({
  roofPolygon,
  roofMetrics,
  setbackDistance,
  onSetbackChange,
  roofTilt,
  onRoofTiltChange,
  isLoading,
  onRecalculate,
  onBack,
  onNext,
}) {
  // Load roof metrics on mount if not already loaded
  useEffect(() => {
    if (roofPolygon && !roofMetrics && !isLoading) {
      onRecalculate();
    }
  }, [roofPolygon, roofMetrics, isLoading, onRecalculate]);

  const orientationLabel = (deg) => {
    if (deg === null || deg === undefined) return "N/A";
    const d = ((deg % 360) + 360) % 360;
    if (d >= 337.5 || d < 22.5) return `${Math.round(d)}° (North)`;
    if (d < 67.5) return `${Math.round(d)}° (North-East)`;
    if (d < 112.5) return `${Math.round(d)}° (East)`;
    if (d < 157.5) return `${Math.round(d)}° (South-East)`;
    if (d < 202.5) return `${Math.round(d)}° (South)`;
    if (d < 247.5) return `${Math.round(d)}° (South-West)`;
    if (d < 292.5) return `${Math.round(d)}° (West)`;
    return `${Math.round(d)}° (North-West)`;
  };

  return (
    <div className="sd-step-animate-in">
      <div className="sd-step-panel-header">
        <h2>📐 Roof Measurements</h2>
        <p>Review and verify the calculated roof dimensions before proceeding.</p>
      </div>

      <div className="sd-step-panel-body">
        {isLoading ? (
          <div className="sd-empty-state">
            <Loader2 size={32} className="sd-spin" style={{ color: "var(--sd-primary-light)" }} />
            <h3 style={{ marginTop: 12 }}>Analyzing Roof...</h3>
            <p>Calculating dimensions and area from the drawn polygon.</p>
          </div>
        ) : roofMetrics ? (
          <>
            {/* Main metrics */}
            <div className="sd-card">
              <div className="sd-card-title">
                <Ruler size={14} /> Dimensions
              </div>
              <div className="sd-info-rows">
                <div className="sd-info-row">
                  <span><Grid3X3 size={14} /> Total Roof Area</span>
                  <strong>{Math.round(roofMetrics.totalArea)} m²</strong>
                </div>
                <div className="sd-info-row">
                  <span><Grid3X3 size={14} /> Usable Area</span>
                  <strong>{Math.round(roofMetrics.usableArea)} m²</strong>
                </div>
                {roofMetrics.width && (
                  <div className="sd-info-row">
                    <span><Ruler size={14} /> Width</span>
                    <strong>{roofMetrics.width.toFixed(1)} m</strong>
                  </div>
                )}
                {roofMetrics.height && (
                  <div className="sd-info-row">
                    <span><Ruler size={14} /> Height</span>
                    <strong>{roofMetrics.height.toFixed(1)} m</strong>
                  </div>
                )}
                <div className="sd-info-row">
                  <span><Compass size={14} /> Orientation</span>
                  <strong>{orientationLabel(roofMetrics.orientation)}</strong>
                </div>
              </div>
            </div>

            {/* Editable params */}
            <div className="sd-card">
              <div className="sd-card-title">
                <Ruler size={14} /> Adjustable Parameters
              </div>
              <div className="sd-input-group">
                <label className="sd-input-label">Setback Distance (m)</label>
                <input
                  type="number"
                  className="sd-input"
                  value={setbackDistance}
                  onChange={(e) => onSetbackChange(Number(e.target.value))}
                  min={0}
                  max={5}
                  step={0.1}
                />
              </div>
              <div className="sd-input-group">
                <label className="sd-input-label">Roof Tilt (°)</label>
                <input
                  type="number"
                  className="sd-input"
                  value={roofTilt}
                  onChange={(e) => onRoofTiltChange(Number(e.target.value))}
                  min={0}
                  max={45}
                  step={1}
                  placeholder="0 for flat roof"
                />
              </div>
              <button
                className="sd-btn sd-btn-secondary sd-btn-sm"
                onClick={onRecalculate}
                disabled={isLoading}
              >
                <RefreshCw size={12} /> Recalculate
              </button>
            </div>
          </>
        ) : (
          <div className="sd-empty-state">
            <div className="sd-empty-state-icon">⚠️</div>
            <h3>Measurement Error</h3>
            <p>Could not calculate roof measurements. Try redrawing the roof.</p>
          </div>
        )}
      </div>

      <div className="sd-step-panel-footer">
        <button className="sd-btn sd-btn-secondary" onClick={onBack}>
          <ArrowLeft size={14} /> Back
        </button>
        <button
          className="sd-btn sd-btn-primary"
          onClick={onNext}
          disabled={!roofMetrics || isLoading}
        >
          Energy Profile <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
