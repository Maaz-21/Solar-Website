"use client";

/**
 * Project Summary (user amendment #3) — one card that reviews every input
 * with per-row Edit buttons, runs the pre-generation quality checks
 * (amendment #6), and gates the placement engine behind an explicit
 * "Generate Design" click.
 */

import { useMemo, useState, useEffect, useRef } from "react";
import {
  MapPin, Home, Boxes, Zap, Pencil, ArrowLeft, Sparkles,
  AlertTriangle, XCircle, Check, Loader2,
} from "lucide-react";
import { useDesignStore } from "../store/useDesignStore";
import { runQualityChecks, hasBlockers, DEFAULT_PANEL } from "@/lib/solar-engine";

const AREA_PER_KW_M2 = (DEFAULT_PANEL.lengthM * DEFAULT_PANEL.widthM * 1000) / DEFAULT_PANEL.wattage;

const PROGRESS_STEPS = [
  "Validating roof geometry...",
  "Applying setbacks and obstacles...",
  "Fetching solar resource data...",
  "Optimizing panel orientation...",
  "Placing panels row by row...",
  "Calculating energy and financials...",
];

function SummaryRow({ icon, label, value, sub, onEdit }) {
  return (
    <div className="sd-summary-row">
      <div className="sd-summary-row-main">
        <span className="sd-summary-row-icon">{icon}</span>
        <div>
          <div className="sd-summary-row-label">{label}</div>
          <div className="sd-summary-row-value">{value}</div>
          {sub && <div className="sd-summary-row-sub">{sub}</div>}
        </div>
      </div>
      <button className="sd-btn sd-btn-ghost sd-btn-sm" onClick={onEdit}>
        <Pencil size={12} /> Edit
      </button>
    </div>
  );
}

export default function Step5_Summary() {
  const location = useDesignStore((s) => s.location);
  const roof = useDesignStore((s) => s.roof);
  const obstacles = useDesignStore((s) => s.obstacles);
  const metrics = useDesignStore((s) => s.metrics);
  const energyProfile = useDesignStore((s) => s.energyProfile);
  const isGenerating = useDesignStore((s) => s.ui.isGenerating);
  const design = useDesignStore((s) => s.design);
  const { goToStep, prevStep, generateDesign } = useDesignStore.getState();

  const [progressIdx, setProgressIdx] = useState(0);
  const timerRef = useRef(null);
  const startedRef = useRef(false);

  const findings = useMemo(
    () => runQualityChecks({ roofPolygon: roof.polygon, obstacles, metrics }),
    [roof.polygon, obstacles, metrics]
  );
  const blocked = hasBlockers(findings);

  const maxKW = metrics?.usableArea
    ? Math.round((metrics.usableArea / AREA_PER_KW_M2) * 10) / 10
    : 0;
  const targetKW = energyProfile?.recommendedKW
    ? Math.min(energyProfile.recommendedKW, maxKW)
    : maxKW;

  // Progress theatre while the (fast) engine + irradiance fetch run.
  useEffect(() => {
    if (isGenerating) {
      setProgressIdx(0);
      timerRef.current = setInterval(() => {
        setProgressIdx((p) => (p < PROGRESS_STEPS.length - 1 ? p + 1 : p));
      }, 450);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isGenerating]);

  // Navigate once generation completes.
  useEffect(() => {
    if (startedRef.current && !isGenerating && design) {
      startedRef.current = false;
      goToStep(6);
    }
  }, [isGenerating, design, goToStep]);

  const handleGenerate = async () => {
    startedRef.current = true;
    await generateDesign();
    if (!useDesignStore.getState().design) startedRef.current = false;
  };

  const usageLabel = !energyProfile || energyProfile.mode === "skipped"
    ? "Skipped — sized to roof capacity"
    : `${energyProfile.monthlyUnits} kWh/month · ${energyProfile.coverage}% coverage`;

  const usageSub = energyProfile && energyProfile.mode !== "skipped"
    ? [
        `₹${energyProfile.tariff}/kWh`,
        energyProfile.evCharging && "EV planned",
        energyProfile.batteryBackup && "battery planned",
        energyProfile.netMetering ? "net metering" : "no net metering",
      ].filter(Boolean).join(" · ")
    : null;

  return (
    <div className="sd-step-animate-in">
      <div className="sd-step-panel-header">
        <h2>Project Summary</h2>
        <p>Review everything before the engine designs your system.</p>
      </div>

      <div className="sd-step-panel-body">
        {isGenerating ? (
          <div className="sd-progress-list">
            {PROGRESS_STEPS.map((step, idx) => {
              const state = idx < progressIdx ? "completed" : idx === progressIdx ? "active" : "pending";
              return (
                <div key={idx} className={`sd-progress-item ${state}`}>
                  <span className="sd-progress-check">
                    {state === "completed" ? <Check size={11} /> :
                     state === "active" ? <Loader2 size={11} className="sd-spin" /> : null}
                  </span>
                  {step}
                </div>
              );
            })}
          </div>
        ) : (
          <>
            <div className="sd-summary-list">
              <SummaryRow
                icon={<MapPin size={15} />}
                label="Location"
                value={location?.address ?? "—"}
                sub={location?.pinConfirmed ? "Pin confirmed" : "Pin not confirmed"}
                onEdit={() => goToStep(1)}
              />
              <SummaryRow
                icon={<Home size={15} />}
                label="Roof"
                value={
                  metrics
                    ? `${Math.round(metrics.totalArea)} m² total · ${Math.round(metrics.usableArea)} m² usable`
                    : "Not drawn"
                }
                sub={
                  metrics
                    ? `${roof.roofType === "flat" ? "Flat roof" : "Pitched roof"} · tilt ${roof.tiltDeg}° · setback ${roof.setbackM} m · facing ${Math.round(metrics.orientation)}°`
                    : null
                }
                onEdit={() => goToStep(2)}
              />
              <SummaryRow
                icon={<Boxes size={15} />}
                label="Obstacles"
                value={obstacles.length ? `${obstacles.length} marked` : "None marked"}
                sub={obstacles.length ? obstacles.map((o) => o.label).join(", ") : null}
                onEdit={() => goToStep(3)}
              />
              <SummaryRow
                icon={<Zap size={15} />}
                label="Electricity usage"
                value={usageLabel}
                sub={usageSub}
                onEdit={() => goToStep(4)}
              />
            </div>

            <div className="sd-card">
              <div className="sd-info-rows">
                <div className="sd-info-row sd-info-highlight">
                  <span>Planned system size</span>
                  <strong className="sd-text-green">≈ {targetKW} kW</strong>
                </div>
                <div className="sd-info-row">
                  <span>Roof capacity (approx.)</span>
                  <strong>{maxKW} kW · ~{Math.round(maxKW * 1000 / DEFAULT_PANEL.wattage)} panels</strong>
                </div>
              </div>
            </div>

            {findings.length > 0 && (
              <div className="sd-quality-list">
                {findings.map((f) => (
                  <div key={f.id} className={`sd-quality-item sd-quality-item--${f.level}`}>
                    {f.level === "blocker" ? <XCircle size={15} /> : <AlertTriangle size={15} />}
                    <div>
                      <div className="sd-quality-title">{f.title}</div>
                      <div className="sd-quality-message">{f.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              className="sd-btn sd-btn-primary sd-btn-full sd-btn-generate"
              onClick={handleGenerate}
              disabled={blocked || !metrics?.usableArea}
            >
              <Sparkles size={15} />
              {blocked ? "Fix issues to continue" : "Generate Design"}
            </button>
          </>
        )}
      </div>

      <div className="sd-step-panel-footer">
        <button className="sd-btn sd-btn-secondary" onClick={prevStep} disabled={isGenerating}>
          <ArrowLeft size={14} /> Back
        </button>
        <div />
      </div>
    </div>
  );
}
