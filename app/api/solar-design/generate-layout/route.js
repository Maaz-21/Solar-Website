import { NextResponse } from "next/server";
import { computeRoofMetrics } from "@/lib/solar-engine/geometry/roof";
import { generatePanelLayout, generateOptimalLayout } from "@/lib/solar-engine/placement/packer";
import { DEFAULT_PANEL, SYSTEM_DEFAULTS } from "@/lib/solar-engine/constants";

/**
 * POST /api/solar-design/generate-layout
 *
 * Server-side layout generation. The Design Studio runs the same engine
 * client-side for live interaction; this route remains for external
 * integrations and non-browser clients.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      roofPolygon,
      obstacles = [],
      panelSpecs = DEFAULT_PANEL,
      setbackDistance = SYSTEM_DEFAULTS.setbackDistanceM,
      panelOrientation, // "portrait" | "landscape" | undefined (auto)
      targetSystemSizeKW,
      latitude = 20,
      tiltDeg = 0,
      flushMount = true,
      walkway = { everyNRows: 0, widthM: SYSTEM_DEFAULTS.walkwayWidthM },
      analysisOnly = false,
    } = body;

    if (!roofPolygon?.coordinates?.length) {
      return NextResponse.json(
        { success: false, error: "Roof polygon is required" },
        { status: 400 }
      );
    }

    const normalizedObstacles = obstacles.map((o) =>
      o?.polygon ? o : { polygon: { type: "Polygon", coordinates: o.coordinates } }
    );

    const roofMetrics = computeRoofMetrics(
      roofPolygon.coordinates,
      normalizedObstacles,
      setbackDistance,
      latitude
    );

    if (!roofMetrics.usableGeometry) {
      return NextResponse.json(
        { success: false, error: "No usable roof area after setbacks" },
        { status: 400 }
      );
    }

    if (analysisOnly) {
      return NextResponse.json({ success: true, roofMetrics });
    }

    const maxPanelCount =
      Number.isFinite(Number(targetSystemSizeKW)) && Number(targetSystemSizeKW) > 0
        ? Math.max(1, Math.floor((Number(targetSystemSizeKW) * 1000) / panelSpecs.wattage))
        : null;

    const layoutParams = {
      usableGeometry: roofMetrics.usableGeometry,
      edgeBearing: roofMetrics.edgeBearing,
      latitude,
      panelSpecs,
      tiltDeg,
      flushMount,
      walkway,
      roofAreaM2: roofMetrics.totalArea,
      maxPanelCount,
    };

    const layout = panelOrientation
      ? generatePanelLayout({ ...layoutParams, panelOrientation })
      : generateOptimalLayout(layoutParams);

    return NextResponse.json({ success: true, roofMetrics, panelLayout: layout });
  } catch (error) {
    console.error("Error generating layout:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
