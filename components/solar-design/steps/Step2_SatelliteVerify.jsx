"use client";

import { MapPin, Check, Move, ArrowRight, ArrowLeft } from "lucide-react";

export default function Step2_SatelliteVerify({
  location,
  isAdjusting,
  onToggleAdjust,
  onBack,
  onNext,
}) {
  return (
    <div className="sd-step-animate-in">
      <div className="sd-step-panel-header">
        <h2>🛰️ Satellite Verification</h2>
        <p>Confirm that the satellite view shows the correct property.</p>
      </div>

      <div className="sd-step-panel-body">
        <div className="sd-verify-card">
          <MapPin size={24} style={{ color: "var(--sd-primary-light)", margin: "0 auto" }} />
          <div className="sd-verify-address">{location?.address}</div>
          {location?.coordinates && (
            <div className="sd-verify-coords">
              {location.coordinates[1].toFixed(6)}, {location.coordinates[0].toFixed(6)}
            </div>
          )}

          <div className="sd-verify-actions">
            <button
              className={`sd-btn ${isAdjusting ? "sd-btn-primary" : "sd-btn-secondary"}`}
              onClick={onToggleAdjust}
            >
              <Move size={14} />
              {isAdjusting ? "Adjusting..." : "Adjust Position"}
            </button>
          </div>
        </div>

        {isAdjusting && (
          <div className="sd-drawing-guide" style={{ marginTop: 14 }}>
            <div className="sd-drawing-guide-title">
              <Move size={14} /> Drag to Adjust
            </div>
            <div className="sd-drawing-guide-text">
              Click and drag the map to reposition the marker over your property.
              The marker will stay centered while you pan the map.
            </div>
          </div>
        )}

        <div className="sd-card" style={{ marginTop: 14 }}>
          <div className="sd-card-title">
            <Check size={14} /> Verification Checklist
          </div>
          <div className="sd-drawing-guide-text" style={{ lineHeight: 2 }}>
            ✅ Can you see the rooftop clearly?<br />
            ✅ Is the correct building centered?<br />
            ✅ Is the imagery recent enough?
          </div>
        </div>
      </div>

      <div className="sd-step-panel-footer">
        <button className="sd-btn sd-btn-secondary" onClick={onBack}>
          <ArrowLeft size={14} /> Back
        </button>
        <button className="sd-btn sd-btn-primary" onClick={onNext}>
          Begin Roof Outline <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
