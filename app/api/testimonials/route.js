import ConnectDB from "@/utils/ConnectDB";
import Testimonial from "@/models/Testimonial";
import { NextResponse } from "next/server";

// Cached at the CDN edge: content changes rarely, so most requests never
// touch the database. stale-while-revalidate keeps responses instant.
const CACHE_HEADERS = { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" };

export async function GET() {
  try {
    await ConnectDB();
    const testimonials = await Testimonial.find({ isActive: true })
      .sort({ createdAt: -1 })
      .select("name designation message rating photo")
      .lean();
    return NextResponse.json({ success: true, data: testimonials }, { headers: CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}
