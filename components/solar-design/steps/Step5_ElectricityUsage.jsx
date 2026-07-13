"use client";

import { useState, useMemo } from "react";
import { Zap, ArrowRight, ArrowLeft, TrendingUp } from "lucide-react";

const DEFAULT_RATE = 8; // ₹/kWh

export default function Step5_ElectricityUsage({
  roofMetrics,
  electricityData,
  onElectricityChange,
  onBack,
  onNext,
}) {
  const [inputMode, setInputMode] = useState(electricityData?.mode || "bill"); // "bill" or "units"
  const [monthlyBill, setMonthlyBill] = useState(electricityData?.monthlyBill || "");
  const [monthlyUnits, setMonthlyUnits] = useState(electricityData?.monthlyUnits || "");
  const [coverage, setCoverage] = useState(electricityData?.coverage || 100);

  const calculations = useMemo(() => {
    let kWh = 0;
    if (inputMode === "bill" && monthlyBill) {
      kWh = Number(monthlyBill) / DEFAULT_RATE;
    } else if (inputMode === "units" && monthlyUnits) {
      kWh = Number(monthlyUnits);
    }
    if (!kWh || kWh <= 0) return null;

    const annualUsage = kWh * 12;
    const targetUsage = annualUsage * (coverage / 100);
    // Rough system sizing: kW = Annual kWh / (365 * PSH * PR)
    // Using ~5 PSH and 0.75 PR as defaults
    const recommendedKW = targetUsage / (365 * 5 * 0.75);
    const usableArea = roofMetrics?.usableArea || 100;
    // Each kW needs roughly 5 m²
    const maxKW = usableArea / 5;

    return {
      monthlyKWh: Math.round(kWh),
      annualUsage: Math.round(annualUsage),
      targetUsage: Math.round(targetUsage),
      recommendedKW: Math.round(recommendedKW * 10) / 10,
      maxKW: Math.round(maxKW * 10) / 10,
      fitsOnRoof: recommendedKW <= maxKW,
    };
  }, [inputMode, monthlyBill, monthlyUnits, coverage, roofMetrics]);

  const handleContinue = () => {
    onElectricityChange({
      mode: inputMode,
      monthlyBill: Number(monthlyBill) || 0,
      monthlyUnits: calculations?.monthlyKWh || Number(monthlyUnits) || 0,
      coverage,
      recommendedKW: calculations?.recommendedKW || 0,
    });
    onNext();
  };

  const handleSkip = () => {
    onElectricityChange(null);
    onNext();
  };

  return (
    <div className="sd-step-animate-in">
      <div className="sd-step-panel-header">
        <h2>⚡ Electricity Usage</h2>
        <p>Help us size your solar system by entering your current electricity consumption.</p>
      </div>

      <div className="sd-step-panel-body">
        {/* Input mode toggle */}
        <div className="sd-toggle-group">
          <button
            className={`sd-toggle-option ${inputMode === "bill" ? "active" : ""}`}
            onClick={() => setInputMode("bill")}
          >
            Monthly Bill (₹)
          </button>
          <button
            className={`sd-toggle-option ${inputMode === "units" ? "active" : ""}`}
            onClick={() => setInputMode("units")}
          >
            Monthly Units (kWh)
          </button>
        </div>

        {/* Input field */}
        {inputMode === "bill" ? (
          <div className="sd-input-group">
            <label className="sd-input-label">Average Monthly Bill</label>
            <div className="sd-input-row">
              <input
                type="number"
                className="sd-input sd-input-with-suffix"
                value={monthlyBill}
                onChange={(e) => setMonthlyBill(e.target.value)}
                placeholder="e.g. 3000"
                min={0}
              />
              <span className="sd-input-suffix">₹ / month</span>
            </div>
          </div>
        ) : (
          <div className="sd-input-group">
            <label className="sd-input-label">Average Monthly Consumption</label>
            <div className="sd-input-row">
              <input
                type="number"
                className="sd-input sd-input-with-suffix"
                value={monthlyUnits}
                onChange={(e) => setMonthlyUnits(e.target.value)}
                placeholder="e.g. 400"
                min={0}
              />
              <span className="sd-input-suffix">kWh / month</span>
            </div>
          </div>
        )}

        {/* Coverage slider */}
        <div className="sd-slider-container">
          <div className="sd-slider-header">
            <span className="sd-input-label" style={{ margin: 0 }}>Target Solar Coverage</span>
            <strong style={{ color: "var(--sd-primary-light)", fontSize: 14 }}>{coverage}%</strong>
          </div>
          <input
            type="range"
            className="sd-slider"
            min={50}
            max={120}
            step={10}
            value={coverage}
            onChange={(e) => setCoverage(Number(e.target.value))}
          />
        </div>

        {/* Calculations */}
        {calculations && (
          <div className="sd-card">
            <div className="sd-card-title">
              <TrendingUp size={14} /> System Recommendation
            </div>
            <div className="sd-info-rows">
              <div className="sd-info-row">
                <span>Monthly Usage</span>
                <strong>{calculations.monthlyKWh} kWh</strong>
              </div>
              <div className="sd-info-row">
                <span>Annual Usage</span>
                <strong>{calculations.annualUsage.toLocaleString("en-IN")} kWh</strong>
              </div>
              <div className="sd-divider" style={{ margin: "4px 0" }} />
              <div className="sd-info-row sd-info-highlight">
                <span><Zap size={14} /> Recommended Size</span>
                <strong className="sd-text-green">{calculations.recommendedKW} kW</strong>
              </div>
              <div className="sd-info-row">
                <span>Max Roof Capacity</span>
                <strong>{calculations.maxKW} kW</strong>
              </div>
              {!calculations.fitsOnRoof && (
                <div className="sd-drawing-guide" style={{ marginTop: 8, borderColor: "rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.08)" }}>
                  <div className="sd-drawing-guide-text" style={{ color: "var(--sd-danger)" }}>
                    ⚠️ Your roof can fit up to {calculations.maxKW} kW. The system will be sized to your available roof space.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="sd-step-panel-footer">
        <button className="sd-btn sd-btn-secondary" onClick={onBack}>
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="sd-btn sd-btn-ghost" onClick={handleSkip}>
            Skip
          </button>
          <button className="sd-btn sd-btn-primary" onClick={handleContinue}>
            Mark Obstacles <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
