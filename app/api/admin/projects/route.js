import ConnectDB from "@/utils/ConnectDB";
import Project from "@/models/Project";
import { verifyAdmin } from "@/utils/verifyAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await verifyAdmin();
    await ConnectDB();
    const projects = await Project.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    const status = error.message.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}

export async function POST(request) {
  try {
    await verifyAdmin();
    await ConnectDB();
    const body = await request.json();
    const { title, location, capacity, description, images, type } = body;

    if (!title || !location || !capacity) {
      return NextResponse.json({ success: false, error: "Title, location, and capacity are required" }, { status: 400 });
    }

    const project = await Project.create({
      title,
      location,
      capacity,
      description,
      images,
      type
    });

    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error) {
    const status = error.message.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}