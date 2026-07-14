"use client";

/**
 * Energy profile — the ONLY questions the engineering actually needs:
 * consumption (bill or kWh), tariff, coverage goal, and future-load toggles.
 * The recommendation uses the same location/tilt-aware specific yield the
 * final report uses, so the numbers always agree.
 */

import { useState, useMemo } from "react";
import { Zap, ArrowRight, ArrowLeft, TrendingUp, Loader2 } from "lucide-react";
import { useDesignStore } from "../store/useDesignStore";
import {
  recommendSystemSize, getOfflinePSH, specificYieldFromPSH,
  getStateTariff, DEFAULT_PANEL,
} from "@/lib/solar-engine";

const AREA_PER_KW_M2 = (DEFAULT_PANEL.lengthM * DEFAULT_PANEL.widthM * 1000) / DEFAULT_PANEL.wattage;

export default function Step4_Energy() {
  const location = useDesignStore((s) => s.location);
  const metrics = useDesignStore((s) => s.metrics);
  const irradiance = useDesignStore((s) => s.irradiance);
  const saved = useDesignStore((s) => s.energyProfile);
  const { setEnergyProfile, prevStep, nextStep } = useDesignStore.getState();

  const defaultTariff = getStateTariff(location?.state ?? "");
  const [mode, setMode] = useState(saved?.mode && saved.mode !== "skipped" ? saved.mode : "bill");
  const [monthlyBill, setMonthlyBill] = useState(saved?.monthlyBill || "");
  const [monthlyUnits, setMonthlyUnits] = useState(saved?.monthlyUnits || "");
  const [tariff, setTariff] = useState(saved?.tariff ?? defaultTariff);
  const [coverage, setCoverage] = useState(saved?.coverage ?? 100);
  const [evCharging, setEvCharging] = useState(saved?.evCharging ?? false);
  const [batteryBackup, setBatteryBackup] = useState(saved?.batteryBackup ?? false);
  const [netMetering, setNetMetering] = useState(saved?.netMetering ?? true);
  const [busy, setBusy] = useState(false);

  // Same engine as the report; offline PSH as preview until PVGIS answers.
  const specificYield = useMemo(() => {
    if (irradiance?.specificYield) return irradiance.specificYield;
    const [lng, lat] = location?.coordinates ?? [];
    return Math.round(
      specificYieldFromPSH(getOfflinePSH({
        city: location?.city ?? "", state: location?.state ?? "", lat, lng,
      }).psh)
    );
  }, [irradiance, location]);

  const usageKWh = useMemo(() => {
    if (mode === "bill" && Number(monthlyBill) > 0 && Number(tariff) > 0) {
      return Number(monthlyBill) / Number(tariff);
    }
    if (mode === "units" && Number(monthlyUnits) > 0) return Number(monthlyUnits);
    return 0;
  }, [mode, monthlyBill, monthlyUnits, tariff]);

  const preview = useMemo(() => {
    if (!usageKWh) return null;
    const rec = recommendSystemSize({
      monthlyUsageKWh: usageKWh, coverage, evCharging, batteryBackup, specificYield,
    });
    const maxKW = metrics?.usableArea ? metrics.usableArea / AREA_PER_KW_M2 : null;
    return {
      monthlyKWh: Math.round(usageKWh),
      annualKWh: Math.round(usageKWh * 12),
      recommendedKW: rec?.recommendedKW ?? 0,
      maxKW: maxKW ? Math.round(maxKW * 10) / 10 : null,
      fits: maxKW ? (rec?.recommendedKW ?? 0) <= maxKW : true,
    };
  }, [usageKWh, coverage, evCharging, batteryBackup, specificYield, metrics]);

  const buildProfile = (skipped) =>
    skipped
      ? { mode: "skipped", tariff: Number(tariff) || defaultTariff, netMetering }
      : {
          mode,
          monthlyBill: Number(monthlyBill) || 0,
          monthlyUnits: Math.round(usageKWh),
          tariff: Number(tariff) || defaultTariff,
          coverage, evCharging, batteryBackup, netMetering,
        };

  const submit = async (skipped) => {
    setBusy(true);
    await setEnergyProfile(buildProfile(skipped));
    setBusy(false);
    nextStep();
  };

  return (
    <div className="sd-step-animate-in">
      <div className="sd-step-panel-header">
        <h2>Electricity Usage</h2>
        <p>Sizes the system to your consumption. Skip it to design for maximum roof capacity.</p>
      </div>

      <div className="sd-step-panel-body">
        <div className="sd-toggle-group">
          <button
            className={`sd-toggle-option ${mode === "bill" ? "active" : ""}`}
            onClick={() => setMode("bill")}
          >
            Monthly Bill (₹)
          </button>
          <button
            className={`sd-toggle-option ${mode === "units" ? "active" : ""}`}
            onClick={() => setMode("units")}
          >
            Monthly Units (kWh)
          </button>
        </div>

        {mode === "bill" ? (
          <div className="sd-input-group">
            <label className="sd-input-label">Average monthly bill</label>
            <div className="sd-input-row">
              <input
                type="number" className="sd-input sd-input-with-suffix"
                value={monthlyBill} onChange={(e) => setMonthlyBill(e.target.value)}
                placeholder="e.g. 3000" min={0}
              />
              <span className="sd-input-suffix">₹ / month</span>
            </div>
          </div>
        ) : (
          <div className="sd-input-group">
            <label className="sd-input-label">Average monthly consumption</label>
            <div className="sd-input-row">
              <input
                type="number" className="sd-input sd-input-with-suffix"
                value={monthlyUnits} onChange={(e) => setMonthlyUnits(e.target.value)}
                placeholder="e.g. 400" min={0}
              />
              <span className="sd-input-suffix">kWh / month</span>
            </div>
          </div>
        )}

        <div className="sd-input-group">
          <label className="sd-input-label">Electricity tariff</label>
          <div className="sd-input-row">
            <input
              type="number" className="sd-input sd-input-with-suffix"
              value={tariff} onChange={(e) => setTariff(e.target.value)}
              min={1} max={30} step={0.5}
            />
            <span className="sd-input-suffix">₹ / kWh</span>
          </div>
          <p className="sd-field-note">
            Defaulted for {location?.state || "your region"} — adjust to match your bill.
          </p>
        </div>

        <div className="sd-slider-container">
          <div className="sd-slider-header">
            <span className="sd-input-label" style={{ margin: 0 }}>Target solar coverage</span>
            <strong style={{ color: "var(--sd-primary-light)", fontSize: 14 }}>{coverage}%</strong>
          </div>
          <input
            type="range" className="sd-slider"
            min={50} max={120} step={10}
            value={coverage} onChange={(e) => setCoverage(Number(e.target.value))}
          />
        </div>

        <div className="sd-check-group">
          <label className="sd-check">
            <input type="checkbox" checked={evCharging} onChange={(e) => setEvCharging(e.target.checked)} />
            <span>Planning an electric vehicle <em>(+15% sizing)</em></span>
          </label>
          <label className="sd-check">
            <input type="checkbox" checked={batteryBackup} onChange={(e) => setBatteryBackup(e.target.checked)} />
            <span>Battery backup planned <em>(+10% sizing)</em></span>
          </label>
          <label className="sd-check">
            <input type="checkbox" checked={netMetering} onChange={(e) => setNetMetering(e.target.checked)} />
            <span>Net metering available</span>
          </label>
        </div>

        {preview && (
          <div className="sd-card">
            <div className="sd-card-title">
              <TrendingUp size={14} /> System Recommendation
            </div>
            <div className="sd-info-rows">
              <div className="sd-info-row">
                <span>Monthly usage</span>
                <strong>{preview.monthlyKWh} kWh</strong>
              </div>
              <div className="sd-info-row">
                <span>Annual usage</span>
                <strong>{preview.annualKWh.toLocaleString("en-IN")} kWh</strong>
              </div>
              <div className="sd-divider" style={{ margin: "4px 0" }} />
              <div className="sd-info-row sd-info-highlight">
                <span><Zap size={14} /> Recommended size</span>
                <strong className="sd-text-green">{preview.recommendedKW} kW</strong>
              </div>
              {preview.maxKW !== null && (
                <div className="sd-info-row">
                  <span>Max roof capacity (approx.)</span>
                  <strong>{preview.maxKW} kW</strong>
                </div>
              )}
              {!preview.fits && (
                <p className="sd-field-note sd-field-note--warn">
                  Your roof fits about {preview.maxKW} kW — the design will use the
                  available space and cover part of your usage.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="sd-step-panel-footer">
        <button className="sd-btn sd-btn-secondary" onClick={prevStep}>
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="sd-btn sd-btn-ghost" onClick={() => submit(true)} disabled={busy}>
            Skip
          </button>
          <button
            className="sd-btn sd-btn-primary"
            onClick={() => submit(false)}
            disabled={busy || !usageKWh}
          >
            {busy ? <Loader2 size={14} className="sd-spin" /> : null}
            Review Project <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
