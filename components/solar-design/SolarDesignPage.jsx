"use client";

import "./solar-design.css";
import { useState, useCallback, useRef } from "react";
import MapCanvas from "./MapCanvas";
import AddressSearchBar from "./AddressSearchBar";
import SolarToolbar from "./SolarToolbar";
import ProjectSummarySidebar from "./ProjectSummarySidebar";
import RoofMetricsOverlay from "./RoofMetricsOverlay";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Application states for the design flow
const STEPS = {
  LOCATION: "location",    // User entering location
  DRAWING: "drawing",      // Drawing roof polygon
  DESIGNED: "designed",    // Panels placed, metrics shown
};

export default function SolarDesignPage() {
  // ─── State ───────────────────────────────────────────────────────────
  const [step, setStep] = useState(STEPS.LOCATION);
  const [location, setLocation] = useState(null);
  const [roofPolygon, setRoofPolygon] = useState(null);
  const [obstacles, setObstacles] = useState([]);
  const [panelLayout, setPanelLayout] = useState(null);
  const [roofMetrics, setRoofMetrics] = useState(null);
  const [energyReport, setEnergyReport] = useState(null);
  const [drawMode, setDrawMode] = useState(null); // "roof" | "obstacle" | null
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const mapRef = useRef(null);

  // ─── Location selected ──────────────────────────────────────────────
  const handleLocationSelect = useCallback((loc) => {
    setLocation(loc);
    setStep(STEPS.DRAWING);
    setError(null);
    // Reset previous design
    setRoofPolygon(null);
    setPanelLayout(null);
    setRoofMetrics(null);
    setEnergyReport(null);
    setObstacles([]);
    setSidebarOpen(false);
  }, []);

  // ─── Roof polygon completed ─────────────────────────────────────────
  const handleRoofComplete = useCallback(async (polygon) => {
    setRoofPolygon(polygon);
    setDrawMode(null);
    setIsLoading(true);
    setError(null);

    try {
      // Call the layout generation API
      const layoutRes = await fetch("/api/solar-design/generate-layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roofPolygon: { type: "Polygon", coordinates: polygon.coordinates },
          obstacles,
        }),
      });
      const layoutData = await layoutRes.json();

      if (!layoutData.success) {
        throw new Error(layoutData.error || "Failed to generate layout");
      }

      setPanelLayout(layoutData.panelLayout);
      setRoofMetrics(layoutData.roofMetrics);

      // Calculate energy
      const energyRes = await fetch("/api/solar-design/calculate-energy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemSizeKW: layoutData.panelLayout.systemSizeKW,
          city: location?.city || "",
          state: location?.state || "",
          lat: location?.coordinates?.[1],
          lng: location?.coordinates?.[0],
        }),
      });
      const energyData = await energyRes.json();

      if (energyData.success) {
        setEnergyReport(energyData.energyReport);
      }

      setStep(STEPS.DESIGNED);
      setSidebarOpen(true);
    } catch (err) {
      console.error("Design generation error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [location, obstacles]);

  // ─── Obstacle added ─────────────────────────────────────────────────
  const handleObstacleAdd = useCallback((obstacle) => {
    setObstacles((prev) => [...prev, obstacle]);
    setDrawMode(null);
  }, []);

  // ─── Regenerate layout (after obstacles or settings change) ─────────
  const handleRegenerate = useCallback(async () => {
    if (!roofPolygon) return;
    setIsLoading(true);
    setError(null);

    try {
      const layoutRes = await fetch("/api/solar-design/generate-layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roofPolygon: { type: "Polygon", coordinates: roofPolygon.coordinates },
          obstacles: obstacles.map((o) => ({
            type: "Polygon",
            coordinates: o.coordinates,
          })),
        }),
      });
      const layoutData = await layoutRes.json();

      if (!layoutData.success) throw new Error(layoutData.error);

      setPanelLayout(layoutData.panelLayout);
      setRoofMetrics(layoutData.roofMetrics);

      const energyRes = await fetch("/api/solar-design/calculate-energy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemSizeKW: layoutData.panelLayout.systemSizeKW,
          city: location?.city || "",
          state: location?.state || "",
          lat: location?.coordinates?.[1],
          lng: location?.coordinates?.[0],
        }),
      });
      const energyData = await energyRes.json();
      if (energyData.success) setEnergyReport(energyData.energyReport);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [roofPolygon, obstacles, location]);

  // ─── Save project ───────────────────────────────────────────────────
  const handleSaveProject = useCallback(async (customerInfo) => {
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/solar-design/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...customerInfo,
          location,
          roofPolygon: roofPolygon
            ? { type: "Polygon", coordinates: roofPolygon.coordinates }
            : {},
          obstacles,
          panelLayout,
          energyReport,
          roofMetrics,
          status: "designed",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setSaveStatus("error");
      setError(err.message);
    }
  }, [location, roofPolygon, obstacles, panelLayout, energyReport, roofMetrics]);

  // ─── Reset everything ───────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setStep(STEPS.LOCATION);
    setLocation(null);
    setRoofPolygon(null);
    setObstacles([]);
    setPanelLayout(null);
    setRoofMetrics(null);
    setEnergyReport(null);
    setDrawMode(null);
    setSidebarOpen(false);
    setError(null);
  }, []);

  return (
    <div className="sd-container">
      {/* Header Bar */}
      <header className="sd-header">
        <div className="sd-header-left">
          <Link href="/" className="sd-back-btn">
            <ArrowLeft size={18} />
          </Link>
          <div className="sd-logo">
            <span className="sd-logo-icon">T</span>
            <span className="sd-logo-text">Solar Design Studio</span>
          </div>
        </div>

        <div className="sd-header-center">
          <AddressSearchBar
            onLocationSelect={handleLocationSelect}
            isDisabled={isLoading}
          />
        </div>

        <div className="sd-header-right">
          {step !== STEPS.LOCATION && (
            <button className="sd-btn sd-btn-ghost" onClick={handleReset}>
              New Design
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="sd-main">
        {/* Map Canvas */}
        <div className="sd-map-area">
          <MapCanvas
            ref={mapRef}
            location={location}
            roofPolygon={roofPolygon}
            obstacles={obstacles}
            panelLayout={panelLayout}
            drawMode={drawMode}
            onRoofComplete={handleRoofComplete}
            onObstacleAdd={handleObstacleAdd}
          />

          {/* Toolbar */}
          {step !== STEPS.LOCATION && (
            <SolarToolbar
              step={step}
              drawMode={drawMode}
              onDrawRoof={() => setDrawMode("roof")}
              onDrawObstacle={() => setDrawMode("obstacle")}
              onCancelDraw={() => setDrawMode(null)}
              onRegenerate={handleRegenerate}
              onClearObstacles={() => {
                setObstacles([]);
                if (roofPolygon) handleRegenerate();
              }}
              isLoading={isLoading}
              hasRoof={!!roofPolygon}
              hasObstacles={obstacles.length > 0}
            />
          )}

          {/* Roof Metrics Overlay */}
          {roofMetrics && step === STEPS.DESIGNED && (
            <RoofMetricsOverlay
              roofMetrics={roofMetrics}
              panelLayout={panelLayout}
            />
          )}

          {/* Loading Overlay */}
          {isLoading && (
            <div className="sd-loading-overlay">
              <div className="sd-loading-spinner" />
              <p>Generating solar design...</p>
            </div>
          )}

          {/* Error Toast */}
          {error && (
            <div className="sd-error-toast">
              <p>{error}</p>
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}

          {/* Welcome prompt when no location selected */}
          {step === STEPS.LOCATION && (
            <div className="sd-welcome-overlay">
              <div className="sd-welcome-card">
                <div className="sd-welcome-icon">☀️</div>
                <h2>Design Your Solar System</h2>
                <p>
                  Enter your address above to view your rooftop and design a
                  custom solar panel layout instantly.
                </p>
                <div className="sd-welcome-steps">
                  <div className="sd-welcome-step">
                    <span className="sd-step-num">1</span>
                    <span>Enter your address</span>
                  </div>
                  <div className="sd-welcome-step">
                    <span className="sd-step-num">2</span>
                    <span>Draw your roof outline</span>
                  </div>
                  <div className="sd-welcome-step">
                    <span className="sd-step-num">3</span>
                    <span>Get instant solar design</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Draw prompt */}
          {step === STEPS.DRAWING && !drawMode && !roofPolygon && (
            <div className="sd-draw-prompt">
              <p>Click <strong>&quot;Draw Roof&quot;</strong> in the toolbar to outline your rooftop</p>
            </div>
          )}
        </div>

        {/* Summary Sidebar */}
        {sidebarOpen && (
          <ProjectSummarySidebar
            roofMetrics={roofMetrics}
            panelLayout={panelLayout}
            energyReport={energyReport}
            location={location}
            onSave={handleSaveProject}
            saveStatus={saveStatus}
            onClose={() => setSidebarOpen(false)}
          />
        )}
      </main>

      {/* Sidebar toggle */}
      {step === STEPS.DESIGNED && !sidebarOpen && (
        <button
          className="sd-sidebar-toggle"
          onClick={() => setSidebarOpen(true)}
        >
          📊 View Report
        </button>
      )}
    </div>
  );
}
