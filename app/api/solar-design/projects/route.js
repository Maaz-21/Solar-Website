import { NextResponse } from "next/server";
import connectDB from "@/utils/ConnectDB";
import SolarProject from "@/models/SolarProject";

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
      obstacles: body.obstacles || [],
      panelLayout: body.panelLayout || {},
      panelSpecs: body.panelSpecs || {},
      energyReport: body.energyReport || {},
      roofMetrics: body.roofMetrics || {},
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

// GET /api/solar-design/projects — List all projects
export async function GET() {
  try {
    await connectDB();
    const projects = await SolarProject.find()
      .sort({ createdAt: -1 })
      .select("customerName location.address location.city status panelLayout.systemSizeKW createdAt")
      .limit(50);

    return NextResponse.json({ success: true, projects });
  } catch (error) {
    console.error("Error fetching solar projects:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
