import ConnectDB from "@/utils/ConnectDB";
import Testimonial from "@/models/Testimonial";
import { verifyAdmin } from "@/utils/verifyAdmin";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  try {
    await verifyAdmin();
    await ConnectDB();
    const { id } = await params;
    const body = await request.json();

    const testimonial = await Testimonial.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!testimonial) {
      return NextResponse.json(
        { success: false, error: "Testimonial not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: testimonial });
  } catch (error) {
    const status = error.message.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}

export async function DELETE(request, { params }) {
  try {
    await verifyAdmin();
    await ConnectDB();
    const { id } = await params;

    const testimonial = await Testimonial.findByIdAndDelete(id);

    if (!testimonial) {
      return NextResponse.json(
        { success: false, error: "Testimonial not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Testimonial deleted successfully" });
  } catch (error) {
    const status = error.message.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
