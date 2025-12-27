import ConnectDB from "@/utils/ConnectDB";
import Project from "@/models/Project";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await ConnectDB();
    const projects = await Project.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
