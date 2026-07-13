import { NextResponse } from "next/server";
import { computeRoofMetrics } from "@/lib/solar-engine/roofGeometry";
import { generateOptimalLayout } from "@/lib/solar-engine/panelPlacement";
import { DEFAULT_PANEL, SYSTEM_DEFAULTS } from "@/lib/solar-engine/constants";

// POST /api/solar-design/generate-layout
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      roofPolygon,
      obstacles = [],
      panelSpecs = DEFAULT_PANEL,
      setbackDistance = SYSTEM_DEFAULTS.setbackDistanceM,
      panelOrientation, // "portrait", "landscape", or undefined (auto)
      targetSystemSizeKW,
      analysisOnly = false,
    } = body;

    if (!roofPolygon?.coordinates?.length) {
      return NextResponse.json(
        { success: false, error: "Roof polygon is required" },
        { status: 400 }
      );
    }

    // 1. Compute roof metrics
    const roofMetrics = computeRoofMetrics(
      roofPolygon.coordinates,
      obstacles,
      setbackDistance
    );

    if (!roofMetrics.usableGeometry) {
      return NextResponse.json(
        { success: false, error: "No usable roof area after setbacks" },
        { status: 400 }
      );
    }

    // Measurement review deliberately happens before panel placement.
    if (analysisOnly) {
      return NextResponse.json({ success: true, roofMetrics });
    }

    const maxPanelCount = Number.isFinite(Number(targetSystemSizeKW)) && Number(targetSystemSizeKW) > 0
      ? Math.max(1, Math.floor((Number(targetSystemSizeKW) * 1000) / panelSpecs.wattage))
      : null;

    // 2. Generate panel layout
    const layoutParams = {
      usableGeometry: roofMetrics.usableGeometry,
      orientation: roofMetrics.orientation,
      panelSpecs,
      roofAreaM2: roofMetrics.totalArea,
      maxPanelCount,
    };

    let layout;
    if (panelOrientation) {
      const { generatePanelLayout } = await import(
        "@/lib/solar-engine/panelPlacement"
      );
      layout = generatePanelLayout({
        ...layoutParams,
        panelOrientation,
      });
    } else {
      layout = generateOptimalLayout(layoutParams);
    }

    return NextResponse.json({
      success: true,
      roofMetrics,
      panelLayout: layout,
    });
  } catch (error) {
    console.error("Error generating layout:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
