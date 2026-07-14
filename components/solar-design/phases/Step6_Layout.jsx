"use client";

/**
 * 2D Design — the source of truth for all design editing (user amendment
 * #5). Click panels on the map to toggle them; orientation and walkway
 * controls re-pack live; every change recalculates KPIs client-side.
 * Includes the Design Confidence panel (amendment #7).
 */

import { Sun, Zap, TrendingUp, ArrowRight, ArrowLeft, RefreshCw, MousePointerClick, Star } from "lucide-react";
import { useDesignStore, activeSystemKW } from "../store/useDesignStore";

const fmtINR = (val) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val ?? 0);
const fmtNum = (val) => new Intl.NumberFormat("en-IN").format(val ?? 0);

function ConfidencePanel({ confidence }) {
  if (!confidence) return null;
  return (
    <div className="sd-card">
      <div className="sd-card-title">
        <Star size={14} /> Design Confidence
        <span className="sd-confidence-stars">
          {"★".repeat(confidence.stars)}
          {"☆".repeat(5 - confidence.stars)}
        </span>
      </div>
      <div className="sd-confidence-list">
        {confidence.items.map((item) => (
          <div key={item.key} className="sd-confidence-item">
            <span className={`sd-chip sd-chip--${item.status}`}>
              {item.status === "verified" ? "Verified" : item.status === "estimated" ? "Estimated" : "Default"}
            </span>
            <div>
              <div className="sd-confidence-label">{item.label}</div>
              <div className="sd-confidence-note">{item.note}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Step6_Layout() {
  const design = useDesignStore((s) => s.design);
  const designStale = useDesignStore((s) => s.designStale);
  const report = useDesignStore((s) => s.report);
  const confidence = useDesignStore((s) => s.confidence);
  const settings = useDesignStore((s) => s.designSettings);
  const roofType = useDesignStore((s) => s.roof.roofType);
  const isGenerating = useDesignStore((s) => s.ui.isGenerating);
  const {
    setPanelOrientation, setWalkway, generateDesign, prevStep, nextStep, goToStep,
  } = useDesignStore.getState();

  if (!design) {
    return (
      <div className="sd-step-animate-in">
        <div className="sd-step-panel-header">
          <h2>2D Design</h2>
        </div>
        <div className="sd-step-panel-body">
          <div className="sd-empty-state">
            <div className="sd-empty-state-icon">☀️</div>
            <h3>No design yet</h3>
            <p>Generate the design from the Project Summary first.</p>
            <button className="sd-btn sd-btn-primary" onClick={() => goToStep(5)} style={{ marginTop: 12 }}>
              Go to Summary
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeCount = design.panels.filter((p) => p.enabled !== false).length;
  const disabledCount = design.panels.length - activeCount;
  const kW = activeSystemKW(design);

  return (
    <div className="sd-step-animate-in">
      <div className="sd-step-panel-header">
        <h2>2D Design</h2>
        <p>Click any panel on the map to include or exclude it.</p>
      </div>

      <div className="sd-step-panel-body">
        {designStale && (
          <div className="sd-stale-banner">
            <RefreshCw size={14} />
            Inputs changed since this design was generated.
            <button className="sd-btn sd-btn-primary sd-btn-sm" onClick={generateDesign} disabled={isGenerating}>
              Regenerate
            </button>
          </div>
        )}

        <div className="sd-stats-grid" style={{ marginBottom: 12 }}>
          <div className="sd-stat sd-stat-highlight">
            <span className="sd-stat-value">{activeCount}</span>
            <span className="sd-stat-label">Panels</span>
          </div>
          <div className="sd-stat sd-stat-highlight">
            <span className="sd-stat-value">{kW} <small>kWp</small></span>
            <span className="sd-stat-label">DC Size</span>
          </div>
          {report?.system?.inverter && (
            <div className="sd-stat">
              <span className="sd-stat-value">{report.system.inverter.acCapacityKW} <small>kW</small></span>
              <span className="sd-stat-label">Inverter (AC)</span>
            </div>
          )}
          <div className="sd-stat">
            <span className="sd-stat-value">{design.roofUtilization}<small>%</small></span>
            <span className="sd-stat-label">Roof Use</span>
          </div>
        </div>

        {report && (
          <div className="sd-card">
            <div className="sd-card-title"><Zap size={14} /> Production & Savings</div>
            <div className="sd-info-rows">
              <div className="sd-info-row">
                <span>Annual generation</span>
                <strong>{fmtNum(report.annualGeneration)} kWh</strong>
              </div>
              <div className="sd-info-row">
                <span>First-year savings</span>
                <strong className="sd-text-green">{fmtINR(report.financial.firstYearSavings)}</strong>
              </div>
              <div className="sd-info-row">
                <span>Net cost (after subsidy)</span>
                <strong>{fmtINR(report.financial.netCost)}</strong>
              </div>
              <div className="sd-info-row sd-info-highlight">
                <span><TrendingUp size={13} /> Payback</span>
                <strong className="sd-text-green">
                  {report.financial.paybackYears ? `${report.financial.paybackYears} years` : "—"}
                </strong>
              </div>
            </div>
          </div>
        )}

        <div className="sd-card">
          <div className="sd-card-title"><Sun size={14} /> Layout Controls</div>

          <div className="sd-input-group">
            <label className="sd-input-label">Panel orientation</label>
            <div className="sd-toggle-group">
              {["auto", "portrait", "landscape"].map((opt) => (
                <button
                  key={opt}
                  className={`sd-toggle-option ${settings.panelOrientation === opt ? "active" : ""}`}
                  onClick={() => setPanelOrientation(opt)}
                >
                  {opt[0].toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {roofType === "flat" && (
            <div className="sd-input-group">
              <label className="sd-input-label">Maintenance walkways</label>
              <div className="sd-toggle-group">
                <button
                  className={`sd-toggle-option ${settings.walkwayEveryNRows === 0 ? "active" : ""}`}
                  onClick={() => setWalkway(0)}
                >
                  None
                </button>
                <button
                  className={`sd-toggle-option ${settings.walkwayEveryNRows === 4 ? "active" : ""}`}
                  onClick={() => setWalkway(4, 0.6)}
                >
                  Every 4 rows
                </button>
                <button
                  className={`sd-toggle-option ${settings.walkwayEveryNRows === 2 ? "active" : ""}`}
                  onClick={() => setWalkway(2, 0.6)}
                >
                  Every 2 rows
                </button>
              </div>
            </div>
          )}

          <div className="sd-drawing-guide" style={{ marginTop: 4 }}>
            <div className="sd-drawing-guide-title">
              <MousePointerClick size={14} /> Panel editing
            </div>
            <div className="sd-drawing-guide-text">
              Click any panel on the map to exclude it (shaded areas, aesthetics)
              — click again to restore. {disabledCount > 0 && <strong>{disabledCount} excluded.</strong>}
            </div>
          </div>
        </div>

        <ConfidencePanel confidence={confidence} />
      </div>

      <div className="sd-step-panel-footer">
        <button className="sd-btn sd-btn-secondary" onClick={prevStep}>
          <ArrowLeft size={14} /> Back
        </button>
        <button className="sd-btn sd-btn-primary" onClick={nextStep} disabled={activeCount === 0}>
          3D Review <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
