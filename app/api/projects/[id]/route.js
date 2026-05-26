import ConnectDB from "@/utils/ConnectDB";
import Project from "@/models/Project";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  try {
    await ConnectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid Project ID" }, { status: 400 });
    }

    const project = await Project.findById(id);

    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
