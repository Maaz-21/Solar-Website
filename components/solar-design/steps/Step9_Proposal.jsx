"use client";

import { useState, useCallback } from "react";
import {
  FileText, MapPin, Ruler, Sun, Zap, TrendingUp, Leaf,
  Calendar, Save, CheckCircle, AlertCircle, Printer, RotateCcw, Loader2,
} from "lucide-react";

export default function Step9_Proposal({
  location,
  roofMetrics,
  panelLayout,
  energyReport,
  onSave,
  saveStatus,
  onReset,
}) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  const formatNumber = (val) => new Intl.NumberFormat("en-IN").format(val);

  const handleSave = useCallback(() => {
    if (!customerName.trim()) return;
    onSave({ customerName, customerEmail, customerPhone });
  }, [customerName, customerEmail, customerPhone, onSave]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="sd-step-animate-in">
      <div className="sd-step-panel-header">
        <h2>📄 Solar Proposal</h2>
        <p>Your complete solar installation proposal is ready.</p>
      </div>

      <div className="sd-step-panel-body">
        {/* Project Info */}
        <div className="sd-proposal-section">
          <div className="sd-proposal-section-title">
            <MapPin size={16} /> Project Information
          </div>
          <div className="sd-info-rows">
            <div className="sd-info-row">
              <span>Address</span>
              <strong style={{ maxWidth: 180, textAlign: "right", fontSize: 12, lineHeight: 1.4 }}>
                {location?.address}
              </strong>
            </div>
            {location?.city && (
              <div className="sd-info-row">
                <span>City / State</span>
                <strong>{location.city}, {location.state}</strong>
              </div>
            )}
            <div className="sd-info-row">
              <span>Date</span>
              <strong>{new Date().toLocaleDateString("en-IN")}</strong>
            </div>
          </div>
        </div>

        {/* Roof Analysis */}
        {roofMetrics && (
          <div className="sd-proposal-section">
            <div className="sd-proposal-section-title">
              <Ruler size={16} /> Roof Analysis
            </div>
            <div className="sd-info-rows">
              <div className="sd-info-row">
                <span>Roof Area</span>
                <strong>{Math.round(roofMetrics.totalArea)} m²</strong>
              </div>
              <div className="sd-info-row">
                <span>Usable Area</span>
                <strong>{Math.round(roofMetrics.usableArea)} m²</strong>
              </div>
            </div>
          </div>
        )}

        {/* System Design */}
        {panelLayout && (
          <div className="sd-proposal-section">
            <div className="sd-proposal-section-title">
              <Sun size={16} /> System Design
            </div>
            <div className="sd-stats-grid">
              <div className="sd-stat sd-stat-highlight">
                <span className="sd-stat-value">{panelLayout.panelCount}</span>
                <span className="sd-stat-label">Panels</span>
              </div>
              <div className="sd-stat sd-stat-highlight">
                <span className="sd-stat-value">
                  {panelLayout.systemSizeKW} <small>kW</small>
                </span>
                <span className="sd-stat-label">System Size</span>
              </div>
            </div>
          </div>
        )}

        {/* Energy & Financial */}
        {energyReport && (
          <>
            <div className="sd-proposal-section">
              <div className="sd-proposal-section-title">
                <Zap size={16} /> Energy Production
              </div>
              <div className="sd-info-rows">
                <div className="sd-info-row">
                  <span>Daily Generation</span>
                  <strong>{energyReport.dailyGeneration} kWh</strong>
                </div>
                <div className="sd-info-row">
                  <span>Monthly Generation</span>
                  <strong>{formatNumber(energyReport.monthlyGeneration)} kWh</strong>
                </div>
                <div className="sd-info-row sd-info-highlight">
                  <span>Annual Generation</span>
                  <strong className="sd-text-green">
                    {formatNumber(energyReport.yearlyGeneration)} kWh
                  </strong>
                </div>
              </div>
            </div>

            <div className="sd-proposal-section">
              <div className="sd-proposal-section-title">
                <TrendingUp size={16} /> Financial Analysis
              </div>
              <div className="sd-info-rows">
                <div className="sd-info-row">
                  <span>Monthly Savings</span>
                  <strong className="sd-text-green">
                    {formatCurrency(energyReport.monthlySavings)}
                  </strong>
                </div>
                <div className="sd-info-row">
                  <span>Annual Savings</span>
                  <strong className="sd-text-green">
                    {formatCurrency(energyReport.yearlySavings)}
                  </strong>
                </div>
                <div className="sd-info-row">
                  <span>System Cost</span>
                  <strong>{formatCurrency(energyReport.systemCost)}</strong>
                </div>
                <div className="sd-info-row">
                  <span><Calendar size={14} /> Payback Period</span>
                  <strong>{energyReport.paybackYears} years</strong>
                </div>
                <div className="sd-info-row sd-info-highlight">
                  <span>25-Year Savings</span>
                  <strong className="sd-text-green">
                    {formatCurrency(energyReport.lifetimeSavings)}
                  </strong>
                </div>
              </div>
            </div>

            <div className="sd-proposal-section">
              <div className="sd-proposal-section-title">
                <Leaf size={16} /> Environmental Impact
              </div>
              <div className="sd-stats-grid">
                <div className="sd-stat sd-stat-green">
                  <span className="sd-stat-value">
                    {formatNumber(energyReport.co2SavingsYearly)} <small>kg</small>
                  </span>
                  <span className="sd-stat-label">CO₂ / year</span>
                </div>
                <div className="sd-stat sd-stat-green">
                  <span className="sd-stat-value">
                    {formatNumber(energyReport.co2SavingsLifetime)} <small>kg</small>
                  </span>
                  <span className="sd-stat-label">CO₂ Lifetime</span>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="sd-divider" />

        {/* Customer Info */}
        <div className="sd-proposal-section">
          <div className="sd-proposal-section-title">
            <FileText size={16} /> Save Your Proposal
          </div>
          <div className="sd-input-group">
            <label className="sd-input-label">Your Name *</label>
            <input
              type="text"
              className="sd-input"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Full name"
            />
          </div>
          <div className="sd-input-group">
            <label className="sd-input-label">Email (optional)</label>
            <input
              type="email"
              className="sd-input"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>
          <div className="sd-input-group">
            <label className="sd-input-label">Phone (optional)</label>
            <input
              type="tel"
              className="sd-input"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="+91 XXXXX XXXXX"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="sd-proposal-actions">
          <button
            className="sd-btn sd-btn-primary sd-btn-full"
            onClick={handleSave}
            disabled={!customerName.trim() || saveStatus === "saving"}
          >
            {saveStatus === "saved" ? (
              <><CheckCircle size={16} /> Proposal Saved!</>
            ) : saveStatus === "error" ? (
              <><AlertCircle size={16} /> Error — Try Again</>
            ) : saveStatus === "saving" ? (
              <><Loader2 size={16} className="sd-spin" /> Saving...</>
            ) : (
              <><Save size={16} /> Save Proposal</>
            )}
          </button>

          <button
            className="sd-btn sd-btn-secondary sd-btn-full"
            onClick={handlePrint}
          >
            <Printer size={16} /> Print / Download PDF
          </button>

          <button
            className="sd-btn sd-btn-ghost sd-btn-full"
            onClick={onReset}
          >
            <RotateCcw size={14} /> Start New Design
          </button>
        </div>
      </div>
    </div>
  );
}
