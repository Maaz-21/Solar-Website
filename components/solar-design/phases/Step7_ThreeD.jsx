"use client";

/**
 * 3D Review — viewer only (user amendment #5): orbit, inspect, snapshot.
 * All editing happens in 2D; "Adjust design" returns there. The scene
 * itself renders in the map panel (see SolarDesignPage).
 */

import { Box, ArrowRight, ArrowLeft, RotateCw, Camera, Pencil, Check } from "lucide-react";
import { useState } from "react";
import { useDesignStore, activeSystemKW } from "../store/useDesignStore";

export default function Step7_ThreeD() {
  const design = useDesignStore((s) => s.design);
  const roof = useDesignStore((s) => s.roof);
  const threeSnapshot = useDesignStore((s) => s.ui.threeSnapshot);
  const { prevStep, nextStep, goToStep } = useDesignStore.getState();
  const [captured, setCaptured] = useState(false);

  const activeCount = design?.panels?.filter((p) => p.enabled !== false).length ?? 0;

  const captureSnapshot = () => {
    // RoofScene registers its canvas globally when mounted.
    const canvas = document.querySelector(".sd-three-overlay canvas");
    if (canvas) {
      try {
        useDesignStore.getState().setSnapshot("threeSnapshot", canvas.toDataURL("image/jpeg", 0.85));
        setCaptured(true);
        setTimeout(() => setCaptured(false), 2000);
      } catch { /* capture unavailable */ }
    }
  };

  return (
    <div className="sd-step-animate-in">
      <div className="sd-step-panel-header">
        <h2>3D Review</h2>
        <p>Inspect the installation from every angle. Editing stays in the 2D designer.</p>
      </div>

      <div className="sd-step-panel-body">
        <div className="sd-drawing-guide">
          <div className="sd-drawing-guide-title">
            <RotateCw size={14} /> Navigation
          </div>
          <div className="sd-drawing-guide-text">
            • <strong>Drag</strong> to orbit around the building<br />
            • <strong>Scroll</strong> to zoom<br />
            • <strong>Right-click + drag</strong> to pan
          </div>
        </div>

        {design && (
          <div className="sd-card">
            <div className="sd-card-title"><Box size={14} /> Model</div>
            <div className="sd-info-rows">
              <div className="sd-info-row">
                <span>Panels shown</span>
                <strong>{activeCount}</strong>
              </div>
              <div className="sd-info-row">
                <span>System size</span>
                <strong>{activeSystemKW(design)} kWp</strong>
              </div>
              <div className="sd-info-row">
                <span>Mounting</span>
                <strong>
                  {roof.roofType === "flat"
                    ? `Tilted racking · ${roof.tiltDeg}°`
                    : `Flush · ${roof.tiltDeg}° slope`}
                </strong>
              </div>
            </div>
            <p className="sd-field-note" style={{ marginTop: 8 }}>
              Building height and roof slope direction are visualization
              assumptions — panel layout and counts match the 2D design exactly.
            </p>
          </div>
        )}

        <button className="sd-btn sd-btn-secondary sd-btn-full" onClick={captureSnapshot}>
          {captured ? <Check size={14} /> : <Camera size={14} />}
          {captured ? "Snapshot saved to proposal" : "Capture snapshot for proposal"}
        </button>
        {threeSnapshot && (
          <img src={threeSnapshot} alt="3D snapshot" className="sd-snapshot-preview" />
        )}

        <button className="sd-btn sd-btn-ghost sd-btn-full" onClick={() => goToStep(6)}>
          <Pencil size={14} /> Adjust design in 2D
        </button>
      </div>

      <div className="sd-step-panel-footer">
        <button className="sd-btn sd-btn-secondary" onClick={prevStep}>
          <ArrowLeft size={14} /> Back
        </button>
        <button className="sd-btn sd-btn-primary" onClick={nextStep}>
          View Proposal <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
