"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sun, Zap, TrendingUp, ArrowRight, ArrowLeft, RefreshCw, Check, Loader2,
} from "lucide-react";

const PROGRESS_STEPS = [
  "Analyzing roof geometry...",
  "Applying setbacks...",
  "Checking obstacle clearances...",
  "Optimizing panel orientation...",
  "Placing panels...",
  "Calculating energy output...",
];

export default function Step7_PanelLayout({
  roofPolygon,
  obstacles,
  location,
  electricityData,
  panelLayout,
  roofMetrics,
  energyReport,
  isLoading,
  onGenerate,
  onRegenerate,
  onBack,
  onNext,
}) {
  const [progressIdx, setProgressIdx] = useState(0);
  const progressTimer = useRef(null);
  const hasGeneratedRef = useRef(false);

  // Auto-generate on mount
  useEffect(() => {
    if (!panelLayout && !isLoading && !hasGeneratedRef.current) {
      hasGeneratedRef.current = true;
      onGenerate();
    }
  }, [panelLayout, isLoading, onGenerate]);

  // Animated progress
  useEffect(() => {
    if (isLoading) {
      setProgressIdx(0);
      progressTimer.current = setInterval(() => {
        setProgressIdx((prev) =>
          prev < PROGRESS_STEPS.length - 1 ? prev + 1 : prev
        );
      }, 600);
    } else {
      setProgressIdx(PROGRESS_STEPS.length);
      clearInterval(progressTimer.current);
    }
    return () => clearInterval(progressTimer.current);
  }, [isLoading]);

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  const formatNumber = (val) => new Intl.NumberFormat("en-IN").format(val);

  return (
    <div className="sd-step-animate-in">
      <div className="sd-step-panel-header">
        <h2>☀️ Solar Panel Layout</h2>
        <p>
          {isLoading
            ? "Generating your optimal solar design..."
            : panelLayout
            ? "Your solar panel layout is ready."
            : "Preparing panel placement..."}
        </p>
      </div>

      <div className="sd-step-panel-body">
        {/* Progress animation */}
        {isLoading && (
          <div className="sd-progress-list">
            {PROGRESS_STEPS.map((step, idx) => {
              let state = "pending";
              if (idx < progressIdx) state = "completed";
              else if (idx === progressIdx) state = "active";

              return (
                <div key={idx} className={`sd-progress-item ${state}`}>
                  <span className="sd-progress-check">
                    {state === "completed" ? (
                      <Check size={11} />
                    ) : state === "active" ? (
                      <Loader2 size={11} className="sd-spin" />
                    ) : null}
                  </span>
                  {step}
                </div>
              );
            })}
          </div>
        )}

        {/* Results */}
        {panelLayout && !isLoading && (
          <>
            {/* System summary */}
            <div className="sd-stats-grid" style={{ marginBottom: 12 }}>
              <div className="sd-stat sd-stat-highlight">
                <span className="sd-stat-value">{panelLayout.panelCount}</span>
                <span className="sd-stat-label">Solar Panels</span>
              </div>
              <div className="sd-stat sd-stat-highlight">
                <span className="sd-stat-value">
                  {panelLayout.systemSizeKW} <small>kW</small>
                </span>
                <span className="sd-stat-label">System Size</span>
              </div>
              <div className="sd-stat">
                <span className="sd-stat-value">
                  {panelLayout.totalPanelArea} <small>m²</small>
                </span>
                <span className="sd-stat-label">Panel Area</span>
              </div>
              <div className="sd-stat">
                <span className="sd-stat-value">
                  {panelLayout.roofUtilization}<small>%</small>
                </span>
                <span className="sd-stat-label">Utilization</span>
              </div>
            </div>

            {/* Energy report */}
            {energyReport && (
              <>
                <div className="sd-card">
                  <div className="sd-card-title">
                    <Zap size={14} /> Energy Generation
                  </div>
                  <div className="sd-stats-grid">
                    <div className="sd-stat sd-stat-accent">
                      <span className="sd-stat-value">
                        {energyReport.dailyGeneration} <small>kWh</small>
                      </span>
                      <span className="sd-stat-label">Daily</span>
                    </div>
                    <div className="sd-stat sd-stat-accent">
                      <span className="sd-stat-value">
                        {formatNumber(energyReport.monthlyGeneration)} <small>kWh</small>
                      </span>
                      <span className="sd-stat-label">Monthly</span>
                    </div>
                    <div className="sd-stat sd-stat-highlight">
                      <span className="sd-stat-value">
                        {formatNumber(energyReport.yearlyGeneration)} <small>kWh</small>
                      </span>
                      <span className="sd-stat-label">Yearly</span>
                    </div>
                    <div className="sd-stat">
                      <span className="sd-stat-value">
                        {energyReport.irradiance} <small>PSH</small>
                      </span>
                      <span className="sd-stat-label">Irradiance</span>
                    </div>
                  </div>
                </div>

                <div className="sd-card">
                  <div className="sd-card-title">
                    <TrendingUp size={14} /> Financial Savings
                  </div>
                  <div className="sd-info-rows">
                    <div className="sd-info-row">
                      <span>Monthly Savings</span>
                      <strong className="sd-text-green">
                        {formatCurrency(energyReport.monthlySavings)}
                      </strong>
                    </div>
                    <div className="sd-info-row">
                      <span>Yearly Savings</span>
                      <strong className="sd-text-green">
                        {formatCurrency(energyReport.yearlySavings)}
                      </strong>
                    </div>
                    <div className="sd-info-row">
                      <span>System Cost</span>
                      <strong>{formatCurrency(energyReport.systemCost)}</strong>
                    </div>
                    <div className="sd-info-row sd-info-highlight">
                      <span>Payback Period</span>
                      <strong className="sd-text-green">
                        {energyReport.paybackYears} years
                      </strong>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Regenerate */}
            <button
              className="sd-btn sd-btn-secondary sd-btn-full"
              onClick={() => {
                hasGeneratedRef.current = false;
                onRegenerate();
              }}
              disabled={isLoading}
              style={{ marginTop: 4 }}
            >
              <RefreshCw size={14} /> Regenerate Layout
            </button>
          </>
        )}
      </div>

      <div className="sd-step-panel-footer">
        <button className="sd-btn sd-btn-secondary" onClick={onBack}>
          <ArrowLeft size={14} /> Back
        </button>
        <button
          className="sd-btn sd-btn-primary"
          onClick={onNext}
          disabled={!panelLayout || isLoading}
        >
          3D Preview <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
