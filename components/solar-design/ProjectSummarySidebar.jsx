"use client";

import { useState } from "react";
import {
  X, Sun, Zap, Leaf, TrendingUp, Calendar, MapPin,
  Save, CheckCircle, AlertCircle, Compass, Ruler, Grid3x3
} from "lucide-react";

export default function ProjectSummarySidebar({
  roofMetrics, panelLayout, energyReport, location,
  onSave, saveStatus, onClose,
}) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);

  const handleSave = () => {
    if (!customerName.trim()) return;
    onSave({ customerName, customerEmail, customerPhone });
    setShowSaveForm(false);
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency", currency: "INR", maximumFractionDigits: 0,
    }).format(val);

  const formatNumber = (val) =>
    new Intl.NumberFormat("en-IN").format(val);

  return (
    <aside className="sd-sidebar">
      <div className="sd-sidebar-header">
        <h2>Solar Design Report</h2>
        <button className="sd-sidebar-close" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <div className="sd-sidebar-scroll">
        {/* Location */}
        {location && (
          <div className="sd-sidebar-section">
            <div className="sd-section-title">
              <MapPin size={16} /> Location
            </div>
            <p className="sd-location-text">{location.address}</p>
            {location.city && (
              <p className="sd-location-sub">{location.city}, {location.state}</p>
            )}
          </div>
        )}

        {/* System Summary */}
        {panelLayout && (
          <div className="sd-sidebar-section">
            <div className="sd-section-title">
              <Sun size={16} /> System Summary
            </div>
            <div className="sd-stats-grid">
              <div className="sd-stat">
                <span className="sd-stat-value">{panelLayout.panelCount}</span>
                <span className="sd-stat-label">Solar Panels</span>
              </div>
              <div className="sd-stat">
                <span className="sd-stat-value">{panelLayout.systemSizeKW} <small>kW</small></span>
                <span className="sd-stat-label">System Size</span>
              </div>
              <div className="sd-stat">
                <span className="sd-stat-value">{panelLayout.totalPanelArea} <small>m²</small></span>
                <span className="sd-stat-label">Panel Area</span>
              </div>
              <div className="sd-stat">
                <span className="sd-stat-value">{panelLayout.roofUtilization}<small>%</small></span>
                <span className="sd-stat-label">Utilization</span>
              </div>
            </div>
          </div>
        )}

        {/* Roof Metrics */}
        {roofMetrics && (
          <div className="sd-sidebar-section">
            <div className="sd-section-title">
              <Ruler size={16} /> Roof Analysis
            </div>
            <div className="sd-info-rows">
              <div className="sd-info-row">
                <span><Grid3x3 size={14} /> Total Roof Area</span>
                <strong>{Math.round(roofMetrics.totalArea)} m²</strong>
              </div>
              <div className="sd-info-row">
                <span><Grid3x3 size={14} /> Usable Area</span>
                <strong>{Math.round(roofMetrics.usableArea)} m²</strong>
              </div>
              <div className="sd-info-row">
                <span><Compass size={14} /> Orientation</span>
                <strong>{Math.round(roofMetrics.orientation)}°</strong>
              </div>
              <div className="sd-info-row">
                <span><Ruler size={14} /> Setback</span>
                <strong>{roofMetrics.setbackDistance} m</strong>
              </div>
            </div>
          </div>
        )}

        {/* Energy Report */}
        {energyReport && (
          <>
            <div className="sd-sidebar-section">
              <div className="sd-section-title">
                <Zap size={16} /> Energy Generation
              </div>
              <div className="sd-stats-grid">
                <div className="sd-stat sd-stat-accent">
                  <span className="sd-stat-value">{energyReport.dailyGeneration} <small>kWh</small></span>
                  <span className="sd-stat-label">Daily</span>
                </div>
                <div className="sd-stat sd-stat-accent">
                  <span className="sd-stat-value">{formatNumber(energyReport.monthlyGeneration)} <small>kWh</small></span>
                  <span className="sd-stat-label">Monthly</span>
                </div>
                <div className="sd-stat sd-stat-highlight">
                  <span className="sd-stat-value">{formatNumber(energyReport.yearlyGeneration)} <small>kWh</small></span>
                  <span className="sd-stat-label">Yearly</span>
                </div>
                <div className="sd-stat">
                  <span className="sd-stat-value">{energyReport.irradiance} <small>PSH</small></span>
                  <span className="sd-stat-label">Irradiance</span>
                </div>
              </div>
            </div>

            <div className="sd-sidebar-section">
              <div className="sd-section-title">
                <TrendingUp size={16} /> Financial Savings
              </div>
              <div className="sd-info-rows">
                <div className="sd-info-row">
                  <span>Monthly Savings</span>
                  <strong className="sd-text-green">{formatCurrency(energyReport.monthlySavings)}</strong>
                </div>
                <div className="sd-info-row">
                  <span>Yearly Savings</span>
                  <strong className="sd-text-green">{formatCurrency(energyReport.yearlySavings)}</strong>
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
                  <strong className="sd-text-green">{formatCurrency(energyReport.lifetimeSavings)}</strong>
                </div>
              </div>
            </div>

            <div className="sd-sidebar-section">
              <div className="sd-section-title">
                <Leaf size={16} /> Environmental Impact
              </div>
              <div className="sd-stats-grid">
                <div className="sd-stat sd-stat-green">
                  <span className="sd-stat-value">{formatNumber(energyReport.co2SavingsYearly)} <small>kg</small></span>
                  <span className="sd-stat-label">CO₂/year</span>
                </div>
                <div className="sd-stat sd-stat-green">
                  <span className="sd-stat-value">{formatNumber(energyReport.co2SavingsLifetime)} <small>kg</small></span>
                  <span className="sd-stat-label">CO₂ Lifetime</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Save Project */}
        <div className="sd-sidebar-section sd-save-section">
          {!showSaveForm ? (
            <button
              className="sd-btn sd-btn-primary sd-btn-full"
              onClick={() => setShowSaveForm(true)}
              disabled={saveStatus === "saving"}
            >
              {saveStatus === "saved" ? (
                <><CheckCircle size={16} /> Project Saved!</>
              ) : saveStatus === "error" ? (
                <><AlertCircle size={16} /> Error - Try Again</>
              ) : (
                <><Save size={16} /> Save Project</>
              )}
            </button>
          ) : (
            <div className="sd-save-form">
              <h4>Save Your Solar Design</h4>
              <input
                type="text"
                placeholder="Your Name *"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="sd-save-input"
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="sd-save-input"
              />
              <input
                type="tel"
                placeholder="Phone (optional)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="sd-save-input"
              />
              <div className="sd-save-actions">
                <button className="sd-btn sd-btn-primary" onClick={handleSave}>
                  <Save size={14} /> Save
                </button>
                <button
                  className="sd-btn sd-btn-ghost"
                  onClick={() => setShowSaveForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
