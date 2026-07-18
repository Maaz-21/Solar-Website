"use client";

/**
 * Solar Design Studio shell — thin view layer over useDesignStore.
 *
 * Layout by step:
 *   1-7  → map workspace + contextual side panel
 *   7    → Three.js viewer overlays the map (viewer-only 3D review)
 *   8    → full-width proposal document (map hidden, print-ready)
 */

import "./solar-design.css";
import dynamic from "next/dynamic";
import Link from "next/link";
import { RotateCcw, X, LogOut } from "lucide-react";
import { toast } from "@/components/Toaster";
import { useDesignStore } from "./store/useDesignStore";
import MapView from "./map/MapView";
import WizardStepper from "./WizardStepper";
import Step1_Locate from "./phases/Step1_Locate";
import Step2_Roof from "./phases/Step2_Roof";
import Step3_Obstacles from "./phases/Step3_Obstacles";
import Step4_Energy from "./phases/Step4_Energy";
import Step5_Summary from "./phases/Step5_Summary";
import Step6_Layout from "./phases/Step6_Layout";
import Step7_ThreeD from "./phases/Step7_ThreeD";
import Step8_Proposal from "./phases/Step8_Proposal";

// Three.js loads only when the 3D step is opened.
const RoofScene = dynamic(() => import("./three/RoofScene"), {
  ssr: false,
  loading: () => (
    <div className="sd-three-overlay sd-three-loading">
      <div className="sd-loading-spinner" />
      <p>Building 3D model…</p>
    </div>
  ),
});

const STEP_VIEWS = {
  1: Step1_Locate,
  2: Step2_Roof,
  3: Step3_Obstacles,
  4: Step4_Energy,
  5: Step5_Summary,
  6: Step6_Layout,
  7: Step7_ThreeD,
};

export default function SolarDesignPage() {
  const step = useDesignStore((s) => s.step);
  const drawMode = useDesignStore((s) => s.ui.drawMode);
  const error = useDesignStore((s) => s.ui.error);
  const draftRestored = useDesignStore((s) => s.ui.draftRestored);
  const { reset, setError, clearDraftRestored } = useDesignStore.getState();

  const mapInstruction =
    drawMode === "roof"
      ? "Click the corners of your roof · Backspace removes a point · click the first point or press Enter to finish"
      : drawMode === "obstacle"
      ? "Click the corners of the obstacle · click the first point to finish"
      : drawMode === "edit"
      ? "Drag corners to adjust · drag edge midpoints to add corners"
      : step === 1
      ? "Drag the marker to fine-tune the location"
      : step === 6
      ? "Click panels to include or exclude them"
      : null;

  const StepView = STEP_VIEWS[step];

  return (
    <div className="sd-wizard-root">
      <header className="sd-wizard-header">
        <div className="sd-wizard-title">
          <span className="sd-wizard-title-icon">☀️</span>
          <span className="sd-wizard-title-text">Solar Design Studio</span>
        </div>

        <WizardStepper />

        <div className="sd-wizard-actions">
          {step > 1 && (
            <button
              className="sd-btn sd-btn-ghost sd-btn-sm"
              onClick={() =>
                toast.confirm("Start a new design? The current draft will be cleared.", {
                  confirmLabel: "Start new",
                  onConfirm: reset,
                })
              }
            >
              <RotateCcw size={13} /> New
            </button>
          )}
          <Link href="/" className="sd-btn sd-btn-ghost sd-btn-sm" title="Exit to website">
            <LogOut size={13} /> Exit
          </Link>
        </div>
      </header>

      <main className="sd-wizard-body">
        {step === 8 ? (
          <Step8_Proposal />
        ) : (
          <>
            <div className="sd-map-panel">
              <MapView />
              {step === 7 && <RoofScene />}

              {mapInstruction && step !== 7 && (
                <div className="sd-map-instruction">{mapInstruction}</div>
              )}

              {error && (
                <div className="sd-error-toast">
                  <p>{error}</p>
                  <button onClick={() => setError(null)} aria-label="Dismiss">
                    <X size={14} />
                  </button>
                </div>
              )}

              {draftRestored && step === 1 && (
                <div className="sd-draft-chip">
                  Draft restored from your last session
                  <button onClick={clearDraftRestored} aria-label="Dismiss">
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>

            <div className="sd-step-panel" key={step}>
              {StepView && <StepView />}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
