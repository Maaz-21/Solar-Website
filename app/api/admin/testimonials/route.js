import ConnectDB from "@/utils/ConnectDB";
import Testimonial from "@/models/Testimonial";
import { verifyAdmin } from "@/utils/verifyAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await verifyAdmin();
    await ConnectDB();
    const testimonials = await Testimonial.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: testimonials });
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
    const { name, message, rating, designation, photo, isActive } = body;

    if (!name || !message) {
      return NextResponse.json(
        { success: false, error: "Name and message are required" },
        { status: 400 }
      );
    }

    const testimonial = await Testimonial.create({
      name,
      message,
      rating: rating || 5,
      designation,
      photo,
      isActive: isActive !== undefined ? isActive : true,
    });

    return NextResponse.json({ success: true, data: testimonial }, { status: 201 });
  } catch (error) {
    const status = error.message.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
