import { NextResponse } from "next/server";
import connectDB from "@/utils/ConnectDB";
import SolarProject from "@/models/SolarProject";
import { verifyAdmin } from "@/utils/verifyAdmin";

// All single-project operations are admin-only: documents contain customer
// PII (name, phone, email, address) and must not be readable, editable or
// deletable by unauthenticated visitors guessing ids.

function errorResponse(error) {
  const status = error.message?.includes("Unauthorized") ? 401 : 500;
  return NextResponse.json(
    { success: false, error: status === 401 ? "Unauthorized" : error.message },
    { status }
  );
}

// GET /api/solar-design/projects/:id
export async function GET(request, { params }) {
  try {
    await verifyAdmin();
    await connectDB();
    const { id } = await params;
    const project = await SolarProject.findById(id);

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, project });
  } catch (error) {
    return errorResponse(error);
  }
}

// PUT /api/solar-design/projects/:id
export async function PUT(request, { params }) {
  try {
    await verifyAdmin();
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const project = await SolarProject.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, project });
  } catch (error) {
    return errorResponse(error);
  }
}

// DELETE /api/solar-design/projects/:id
export async function DELETE(request, { params }) {
  try {
    await verifyAdmin();
    await connectDB();
    const { id } = await params;
    const project = await SolarProject.findByIdAndDelete(id);

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Project deleted" });
  } catch (error) {
    return errorResponse(error);
  }
}
