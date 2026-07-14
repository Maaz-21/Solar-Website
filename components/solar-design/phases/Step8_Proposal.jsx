"use client";

/**
 * Proposal — print-optimized document (light theme), snapshots, financial
 * breakdown with subsidy line items, confidence/assumptions disclosure,
 * save-to-CRM and browser-print PDF.
 */

import { useState } from "react";
import {
  FileText, Save, CheckCircle, AlertCircle, Printer, RotateCcw, Loader2, ArrowLeft,
} from "lucide-react";
import { useDesignStore, activeSystemKW } from "../store/useDesignStore";

const fmtINR = (val) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val ?? 0);
const fmtNum = (val) => new Intl.NumberFormat("en-IN").format(val ?? 0);
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function Step8_Proposal() {
  const location = useDesignStore((s) => s.location);
  const metrics = useDesignStore((s) => s.metrics);
  const roof = useDesignStore((s) => s.roof);
  const obstacles = useDesignStore((s) => s.obstacles);
  const design = useDesignStore((s) => s.design);
  const report = useDesignStore((s) => s.report);
  const confidence = useDesignStore((s) => s.confidence);
  const mapSnapshot = useDesignStore((s) => s.ui.mapSnapshot);
  const threeSnapshot = useDesignStore((s) => s.ui.threeSnapshot);
  const saveStatus = useDesignStore((s) => s.ui.saveStatus);
  const { saveProject, reset, prevStep } = useDesignStore.getState();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const activeCount = design?.panels?.filter((p) => p.enabled !== false).length ?? 0;
  const kW = activeSystemKW(design);
  const monthly = report?.monthlyGeneration;
  const maxMonthly = monthly ? Math.max(...monthly) : 0;

  return (
    <div className="sd-proposal-page sd-step-animate-in">
      <div className="sd-proposal-doc" id="sd-proposal-doc">
        {/* Header */}
        <header className="sd-doc-header">
          <div>
            <h1>Solar Installation Proposal</h1>
            <p className="sd-doc-sub">{location?.address}</p>
            <p className="sd-doc-meta">
              Prepared {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              {confidence && <> · Design confidence {"★".repeat(confidence.stars)}{"☆".repeat(5 - confidence.stars)}</>}
            </p>
          </div>
          <div className="sd-doc-badge">☀️</div>
        </header>

        {/* Snapshots */}
        {(mapSnapshot || threeSnapshot) && (
          <section className="sd-doc-section sd-doc-snapshots">
            {mapSnapshot && (
              <figure>
                <img src={mapSnapshot} alt="Panel layout on satellite view" />
                <figcaption>Panel layout — satellite view</figcaption>
              </figure>
            )}
            {threeSnapshot && (
              <figure>
                <img src={threeSnapshot} alt="3D visualization" />
                <figcaption>3D visualization</figcaption>
              </figure>
            )}
          </section>
        )}

        {/* System at a glance */}
        <section className="sd-doc-section">
          <h2>System at a Glance</h2>
          <div className="sd-doc-stats">
            <div><strong>{kW} kWp</strong><span>DC capacity</span></div>
            <div><strong>{activeCount}</strong><span>Panels ({design?.panelSpecs?.wattage} Wp)</span></div>
            {report?.system?.inverter && (
              <div><strong>{report.system.inverter.acCapacityKW} kW</strong><span>Inverter (AC)</span></div>
            )}
            <div><strong>{fmtNum(report?.annualGeneration)}</strong><span>kWh / year</span></div>
            <div><strong>{report?.financial?.paybackYears ?? "—"} yrs</strong><span>Payback</span></div>
            <div><strong>{fmtNum(report?.co2SavingsYearlyKg)}</strong><span>kg CO₂ saved / yr</span></div>
          </div>
        </section>

        {/* Roof analysis */}
        <section className="sd-doc-section">
          <h2>Site & Roof Analysis</h2>
          <table className="sd-doc-table">
            <tbody>
              <tr><td>Total roof area</td><td>{Math.round(metrics?.totalArea ?? 0)} m²</td></tr>
              <tr><td>Usable area (after {roof.setbackM} m setback, {obstacles.length} obstacle{obstacles.length === 1 ? "" : "s"})</td><td>{Math.round(metrics?.usableArea ?? 0)} m²</td></tr>
              <tr><td>Roof type / mounting</td><td>{roof.roofType === "flat" ? `Flat · racking at ${roof.tiltDeg}°` : `Pitched · flush at ${roof.tiltDeg}°`}</td></tr>
              <tr><td>Orientation</td><td>{Math.round(metrics?.orientation ?? 0)}°</td></tr>
              <tr><td>Solar resource</td><td>{report?.specificYield} kWh/kWp/yr ({report?.yieldSource === "pvgis" ? "PVGIS satellite data" : report?.yieldSource === "nasa-power" ? "NASA POWER data" : "regional estimate"})</td></tr>
            </tbody>
          </table>
        </section>

        {/* Monthly generation */}
        {monthly && (
          <section className="sd-doc-section">
            <h2>Estimated Monthly Generation</h2>
            <div className="sd-doc-bars">
              {monthly.map((val, i) => (
                <div key={i} className="sd-doc-bar-col">
                  <div className="sd-doc-bar" style={{ height: `${(val / maxMonthly) * 100}%` }} />
                  <span className="sd-doc-bar-val">{fmtNum(val)}</span>
                  <span className="sd-doc-bar-label">{MONTHS[i]}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Financials */}
        {report && (
          <section className="sd-doc-section">
            <h2>Financial Analysis</h2>
            <table className="sd-doc-table">
              <tbody>
                <tr><td>System cost (est. ₹{report.assumptions.costPerWatt}/Wp)</td><td>{fmtINR(report.financial.grossCost)}</td></tr>
                <tr className="sd-doc-row-green">
                  <td>{report.financial.subsidyScheme} (as of {report.financial.subsidyAsOf})</td>
                  <td>− {fmtINR(report.financial.subsidyAmount)}</td>
                </tr>
                <tr className="sd-doc-row-strong"><td>Net investment</td><td>{fmtINR(report.financial.netCost)}</td></tr>
                <tr><td>First-year savings (₹{report.tariff}/kWh)</td><td>{fmtINR(report.financial.firstYearSavings)}</td></tr>
                <tr><td>Payback period</td><td>{report.financial.paybackYears} years</td></tr>
                <tr><td>25-year savings (with {Math.round(report.financial.escalation * 100)}%/yr tariff escalation)</td><td>{fmtINR(report.financial.lifetimeSavings)}</td></tr>
                <tr><td>Net present value (8% discount)</td><td>{fmtINR(report.financial.npv)}</td></tr>
              </tbody>
            </table>
          </section>
        )}

        {/* Equipment */}
        {report?.system && (
          <section className="sd-doc-section">
            <h2>Indicative Equipment</h2>
            <table className="sd-doc-table">
              <tbody>
                <tr><td>Solar modules</td><td>{activeCount} × {design.panelSpecs.wattage} Wp mono-PERC ({design.panelSpecs.lengthM} × {design.panelSpecs.widthM} m)</td></tr>
                {report.system.inverter && (
                  <tr><td>Inverter</td><td>{report.system.inverter.acCapacityKW} kW string inverter (DC/AC ratio {report.system.inverter.dcAcRatio})</td></tr>
                )}
                {report.system.strings && (
                  <tr><td>String layout</td><td>{report.system.strings.strings} string{report.system.strings.strings > 1 ? "s" : ""} of ≈{report.system.strings.panelsPerString} panels</td></tr>
                )}
                <tr><td>Mounting structure</td><td>{roof.roofType === "flat" ? `Ballasted/anchored racking, ${roof.tiltDeg}° tilt` : "Flush rail mounting"}</td></tr>
              </tbody>
            </table>
            <p className="sd-doc-note">
              Final equipment selection and electrical design are confirmed by the
              installer after a site survey.
            </p>
          </section>
        )}

        {/* Confidence & assumptions */}
        {confidence && (
          <section className="sd-doc-section">
            <h2>Verified vs Estimated Inputs</h2>
            <table className="sd-doc-table">
              <tbody>
                {confidence.items.map((item) => (
                  <tr key={item.key}>
                    <td>{item.label}</td>
                    <td>
                      <span className={`sd-doc-chip sd-doc-chip--${item.status}`}>
                        {item.status === "verified" ? "Verified" : item.status === "estimated" ? "Estimated" : "Default"}
                      </span>{" "}
                      {item.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="sd-doc-note">
              Generation figures assume {Math.round((report?.assumptions?.performanceRatio ?? 0.78) * 100)}%
              performance ratio, {Math.round((report?.assumptions?.degradationFirstYear ?? 0.02) * 100)}% first-year and{" "}
              {(report?.assumptions?.degradationAnnual ?? 0.0055) * 100}%/yr module degradation.
              Roof tilt, structural adequacy and shading require on-site verification.
            </p>
          </section>
        )}
      </div>

      {/* Actions (not printed) */}
      <div className="sd-proposal-side">
        <div className="sd-card">
          <div className="sd-card-title"><FileText size={14} /> Save Proposal</div>
          <div className="sd-input-group">
            <label className="sd-input-label">Your name *</label>
            <input type="text" className="sd-input" value={customerName}
              onChange={(e) => setCustomerName(e.target.value)} placeholder="Full name" />
          </div>
          <div className="sd-input-group">
            <label className="sd-input-label">Email</label>
            <input type="email" className="sd-input" value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)} placeholder="your@email.com" />
          </div>
          <div className="sd-input-group">
            <label className="sd-input-label">Phone</label>
            <input type="tel" className="sd-input" value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" />
          </div>

          <button
            className="sd-btn sd-btn-primary sd-btn-full"
            onClick={() => saveProject({ customerName, customerEmail, customerPhone })}
            disabled={!customerName.trim() || saveStatus === "saving"}
          >
            {saveStatus === "saved" ? <><CheckCircle size={15} /> Saved!</> :
             saveStatus === "error" ? <><AlertCircle size={15} /> Error — retry</> :
             saveStatus === "saving" ? <><Loader2 size={15} className="sd-spin" /> Saving...</> :
             <><Save size={15} /> Save Proposal</>}
          </button>
          <button className="sd-btn sd-btn-secondary sd-btn-full" onClick={() => window.print()}>
            <Printer size={15} /> Print / Download PDF
          </button>
          <button className="sd-btn sd-btn-ghost sd-btn-full" onClick={prevStep}>
            <ArrowLeft size={14} /> Back to 3D
          </button>
          <button
            className="sd-btn sd-btn-ghost sd-btn-full"
            onClick={() => { if (confirm("Start a new design? The current draft will be cleared.")) reset(); }}
          >
            <RotateCcw size={14} /> Start New Design
          </button>
        </div>
      </div>
    </div>
  );
}
