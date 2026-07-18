import ConnectDB from "@/utils/ConnectDB";
import Blog from "@/models/Blog";
import { NextResponse } from "next/server";

const CACHE_HEADERS = { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" };

export async function GET() {
  try {
    await ConnectDB();
    const blogs = await Blog.find({ published: true }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: blogs }, { headers: CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
