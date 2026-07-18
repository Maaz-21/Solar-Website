import ConnectDB from "@/utils/ConnectDB";
import Faq from "@/models/Faq";
import { NextResponse } from "next/server";

const CACHE_HEADERS = { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" };

export async function GET() {
  try {
    await ConnectDB();
    const faqs = await Faq.find({ isActive: true }).select("question answer category").lean();
    return NextResponse.json({ success: true, data: faqs }, { headers: CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch FAQs" },
      { status: 500 }
    );
  }
}
