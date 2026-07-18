import ConnectDB from "@/utils/ConnectDB";
import Blog from "@/models/Blog";
import { NextResponse } from "next/server";

const CACHE_HEADERS = { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" };

export async function GET(request, { params }) {
  try {
    await ConnectDB();
    const { slug } = await params;
    const blog = await Blog.findOne({ slug, published: true }).lean();
    if (!blog) {
      return NextResponse.json({ success: false, error: "Blog not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: blog }, { headers: CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
