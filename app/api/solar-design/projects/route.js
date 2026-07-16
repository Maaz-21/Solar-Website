import { NextResponse } from "next/server";
import connectDB from "@/utils/ConnectDB";
import SolarProject from "@/models/SolarProject";
import { verifyAdmin } from "@/utils/verifyAdmin";

// POST /api/solar-design/projects — Create a new project
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const project = await SolarProject.create({
      customerName: body.customerName || "",
      customerEmail: body.customerEmail || "",
      customerPhone: body.customerPhone || "",
      location: body.location || {},
      roofPolygon: body.roofPolygon || {},
      roof: body.roof || {},
      obstacles: body.obstacles || [],
      electricityProfile: body.electricityProfile || {},
      panelLayout: body.panelLayout || {},
      panelSpecs: body.panelSpecs || {},
      energyReport: body.energyReport || {},
      roofMetrics: body.roofMetrics || {},
      confidence: body.confidence || {},
      status: body.status || "draft",
    });

    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (error) {
    console.error("Error creating solar project:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET /api/solar-design/projects — List all projects (admin only:
// exposes customer names, contact details and addresses)
export async function GET() {
  try {
    await verifyAdmin();
    await connectDB();
    const projects = await SolarProject.find()
      .sort({ createdAt: -1 })
      .select(
        "customerName customerEmail customerPhone location.address location.city location.state " +
        "status panelLayout.systemSizeKW panelLayout.panelCount roofMetrics.totalArea " +
        "roofMetrics.usableArea energyReport.annualGeneration energyReport.financial " +
        "electricityProfile.monthlyBill roof.roofType roof.tiltDeg confidence.stars createdAt"
      )
      .limit(100);

    return NextResponse.json({ success: true, projects });
  } catch (error) {
    const status = error.message?.includes("Unauthorized") ? 401 : 500;
    if (status !== 401) console.error("Error fetching solar projects:", error);
    return NextResponse.json(
      { success: false, error: status === 401 ? "Unauthorized" : error.message },
      { status }
    );
  }
}
