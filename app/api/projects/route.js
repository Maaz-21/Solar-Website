import ConnectDB from "@/utils/ConnectDB";
import Project from "@/models/Project";
import { NextResponse } from "next/server";

const CACHE_HEADERS = { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" };

export async function GET() {
  try {
    await ConnectDB();
    const projects = await Project.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: projects }, { headers: CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
