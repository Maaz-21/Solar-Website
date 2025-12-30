import ConnectDB from "@/utils/ConnectDB";
import Faq from "@/models/Faq";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await ConnectDB();
    const faqs = await Faq.find({ isActive: true }).select("question answer category");
    return NextResponse.json({ success: true, data: faqs });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch FAQs" },
      { status: 500 }
    );
  }
}
