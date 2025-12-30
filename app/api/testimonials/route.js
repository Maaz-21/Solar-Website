import ConnectDB from "@/utils/ConnectDB";
import Testimonial from "@/models/Testimonial";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await ConnectDB();
    const testimonials = await Testimonial.find({ isActive: true }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: testimonials });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}
