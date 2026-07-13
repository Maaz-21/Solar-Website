"use client";

import "./solar-design.css";
import { useState, useCallback, useRef, useMemo } from "react";
import MapCanvas from "./MapCanvas";
import WizardStepper from "./WizardStepper";
import Step1_Location from "./steps/Step1_Location";
import Step2_SatelliteVerify from "./steps/Step2_SatelliteVerify";
import Step3_RoofDetection from "./steps/Step3_RoofDetection";
import Step4_MeasurementReview from "./steps/Step4_MeasurementReview";
import Step5_ElectricityUsage from "./steps/Step5_ElectricityUsage";
import Step6_Obstacles from "./steps/Step6_Obstacles";
import Step7_PanelLayout from "./steps/Step7_PanelLayout";
import Step8_DesignReview from "./steps/Step8_DesignReview";
import Step9_Proposal from "./steps/Step9_Proposal";
import { RotateCcw } from "lucide-react";

export default function SolarDesignPage() {
  // ─── Core Wizard State ─────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(1);
  const [location, setLocation] = useState(null);
  const [roofPolygon, setRoofPolygon] = useState(null);
  const [obstacles, setObstacles] = useState([]);
  const [panelLayout, setPanelLayout] = useState(null);
  const [roofMetrics, setRoofMetrics] = useState(null);
  const [energyReport, setEnergyReport] = useState(null);
  const [electricityData, setElectricityData] = useState(null);
  const [drawMode, setDrawMode] = useState(null); // "roof" | "obstacle" | null
  const [viewMode, setViewMode] = useState("2d");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [setbackDistance, setSetbackDistance] = useState(0.5);
  const [roofTilt, setRoofTilt] = useState(0);

  // Obstacle drawing metadata (type, label, height)
  const pendingObstacleRef = useRef(null);
  const mapRef = useRef(null);

  // ─── Navigation ────────────────────────────────────────────────
  const goTo = useCallback((step) => {
    setCurrentStep(step);
    setDrawMode(null);
    setError(null);
  }, []);

  const goNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 9));
    setDrawMode(null);
  }, []);

  const goBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setDrawMode(null);
  }, []);

  // ─── Step 1: Location ──────────────────────────────────────────
  const handleLocationSelect = useCallback((loc) => {
    setLocation(loc);
    // Reset downstream data when location changes
    setRoofPolygon(null);
    setPanelLayout(null);
    setRoofMetrics(null);
    setEnergyReport(null);
    setObstacles([]);
    setElectricityData(null);
  }, []);

  // ─── Step 2: Satellite ─────────────────────────────────────────
  const handleToggleAdjust = useCallback(() => {
    setIsAdjusting((prev) => !prev);
  }, []);

  // ─── Step 3: Roof Drawing ──────────────────────────────────────
  const handleStartRoofDraw = useCallback(() => {
    setRoofPolygon(null);
    setPanelLayout(null);
    setRoofMetrics(null);
    setEnergyReport(null);
    setDrawMode("roof");
  }, []);

  const handleRoofComplete = useCallback((polygon) => {
    setRoofPolygon(polygon);
    setDrawMode(null);
  }, []);

  const handleClearRoof = useCallback(() => {
    setRoofPolygon(null);
    setPanelLayout(null);
    setRoofMetrics(null);
    setEnergyReport(null);
    setDrawMode(null);
  }, []);

  // ─── Step 4: Measurements ──────────────────────────────────────
  const handleRecalculateMeasurements = useCallback(async () => {
    if (!roofPolygon) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/solar-design/generate-layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roofPolygon: { type: "Polygon", coordinates: roofPolygon.coordinates },
          obstacles: obstacles.map((o) => ({
            type: "Polygon",
            coordinates: o.coordinates,
          })),
          setbackDistance,
          analysisOnly: true,
        }),
      });
      const data = await res.json();

      if (!data.success) throw new Error(data.error || "Measurement failed");
      setRoofMetrics(data.roofMetrics);
    } catch (err) {
      console.error("Measurement error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [roofPolygon, obstacles, setbackDistance]);

  // ─── Step 6: Obstacles ─────────────────────────────────────────
  const handleStartObstacleDraw = useCallback((meta) => {
    pendingObstacleRef.current = meta;
    setDrawMode("obstacle");
  }, []);

  const handleObstacleAdd = useCallback((polygon) => {
    const meta = pendingObstacleRef.current || {};
    setObstacles((prev) => [
      ...prev,
      {
        ...polygon,
        type: meta.type || "custom",
        label: meta.label || "Obstacle",
        heightM: meta.heightM || 1.5,
      },
    ]);
    setDrawMode(null);
    pendingObstacleRef.current = null;
  }, []);

  const handleDeleteObstacle = useCallback((idx) => {
    setObstacles((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  // ─── Step 7: Generate Layout ───────────────────────────────────
  const handleGenerateLayout = useCallback(async () => {
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
          setbackDistance,
          targetSystemSizeKW: electricityData?.recommendedKW || undefined,
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
    } catch (err) {
      console.error("Design generation error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [roofPolygon, obstacles, location, setbackDistance, electricityData]);

  // ─── Step 8: View Mode ─────────────────────────────────────────
  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  // ─── Step 9: Save ──────────────────────────────────────────────
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

  // ─── Reset ─────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setCurrentStep(1);
    setLocation(null);
    setRoofPolygon(null);
    setObstacles([]);
    setPanelLayout(null);
    setRoofMetrics(null);
    setEnergyReport(null);
    setElectricityData(null);
    setDrawMode(null);
    setViewMode("2d");
    setError(null);
    setIsAdjusting(false);
    setSetbackDistance(0.5);
    setRoofTilt(0);
  }, []);

  // ─── Map instruction based on step ─────────────────────────────
  const mapInstruction = useMemo(() => {
    if (drawMode === "roof") return "Click on corners of your roof. Double-click to finish.";
    if (drawMode === "obstacle") return "Click to draw obstacle boundary. Double-click to finish.";
    if (currentStep === 2 && isAdjusting) return "Drag the map to adjust the marker position.";
    if (currentStep === 1) return null;
    return null;
  }, [currentStep, drawMode, isAdjusting]);

  // ─── Render Step Panel ─────────────────────────────────────────
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1_Location
            location={location}
            onLocationSelect={handleLocationSelect}
            onNext={goNext}
          />
        );
      case 2:
        return (
          <Step2_SatelliteVerify
            location={location}
            isAdjusting={isAdjusting}
            onToggleAdjust={handleToggleAdjust}
            onBack={goBack}
            onNext={goNext}
          />
        );
      case 3:
        return (
          <Step3_RoofDetection
            roofPolygon={roofPolygon}
            isDrawing={drawMode === "roof"}
            onStartDraw={handleStartRoofDraw}
            onClearRoof={handleClearRoof}
            onBack={goBack}
            onNext={goNext}
          />
        );
      case 4:
        return (
          <Step4_MeasurementReview
            roofPolygon={roofPolygon}
            roofMetrics={roofMetrics}
            setbackDistance={setbackDistance}
            onSetbackChange={setSetbackDistance}
            roofTilt={roofTilt}
            onRoofTiltChange={setRoofTilt}
            isLoading={isLoading}
            onRecalculate={handleRecalculateMeasurements}
            onBack={goBack}
            onNext={goNext}
          />
        );
      case 5:
        return (
          <Step5_ElectricityUsage
            roofMetrics={roofMetrics}
            electricityData={electricityData}
            onElectricityChange={setElectricityData}
            onBack={goBack}
            onNext={goNext}
          />
        );
      case 6:
        return (
          <Step6_Obstacles
            obstacles={obstacles}
            isDrawing={drawMode === "obstacle"}
            onAddObstacle={handleObstacleAdd}
            onDeleteObstacle={handleDeleteObstacle}
            onStartDraw={handleStartObstacleDraw}
            onBack={goBack}
            onNext={goNext}
          />
        );
      case 7:
        return (
          <Step7_PanelLayout
            roofPolygon={roofPolygon}
            obstacles={obstacles}
            location={location}
            electricityData={electricityData}
            panelLayout={panelLayout}
            roofMetrics={roofMetrics}
            energyReport={energyReport}
            isLoading={isLoading}
            onGenerate={handleGenerateLayout}
            onRegenerate={handleGenerateLayout}
            onBack={goBack}
            onNext={goNext}
          />
        );
      case 8:
        return (
          <Step8_DesignReview
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            panelLayout={panelLayout}
            roofMetrics={roofMetrics}
            onBack={goBack}
            onNext={goNext}
          />
        );
      case 9:
        return (
          <Step9_Proposal
            location={location}
            roofMetrics={roofMetrics}
            panelLayout={panelLayout}
            energyReport={energyReport}
            onSave={handleSaveProject}
            saveStatus={saveStatus}
            onReset={handleReset}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="sd-wizard-root">
      {/* Wizard Header */}
      <header className="sd-wizard-header">
        <div className="sd-wizard-title">
          <span className="sd-wizard-title-icon">☀️</span>
          <span className="sd-wizard-title-text">Solar Design Studio</span>
        </div>

        <WizardStepper currentStep={currentStep} onStepClick={goTo} />

        <div className="sd-wizard-actions">
          {currentStep > 1 && (
            <button className="sd-btn sd-btn-ghost sd-btn-sm" onClick={handleReset}>
              <RotateCcw size={13} /> New
            </button>
          )}
        </div>
      </header>

      {/* Main Body: Map + Step Panel */}
      <main className="sd-wizard-body">
        {/* Map */}
        <div className="sd-map-panel">
          <MapCanvas
            ref={mapRef}
            location={location}
            roofPolygon={roofPolygon}
            obstacles={obstacles}
            panelLayout={panelLayout}
            drawMode={drawMode}
            viewMode={viewMode}
            onRoofComplete={handleRoofComplete}
            onObstacleAdd={handleObstacleAdd}
          />

          {/* Map instruction overlay */}
          {mapInstruction && (
            <div className="sd-map-instruction">{mapInstruction}</div>
          )}

          {/* Error toast */}
          {error && (
            <div className="sd-error-toast">
              <p>{error}</p>
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}
        </div>

        {/* Step Panel */}
        <div className="sd-step-panel" key={currentStep}>
          {renderStep()}
        </div>
      </main>
    </div>
  );
}
