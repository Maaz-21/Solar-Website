import ConnectDB from "@/utils/ConnectDB";
import Enquiry from "@/models/Enquiry";
import { verifyAdmin } from "@/utils/verifyAdmin";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function PUT(request, { params }) {
  try {
    await verifyAdmin();
    await ConnectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid Enquiry ID" }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !["new", "contacted", "closed"].includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status value" }, { status: 400 });
    }

    const enquiry = await Enquiry.findByIdAndUpdate(id, { status }, { new: true });

    if (!enquiry) {
      return NextResponse.json({ success: false, error: "Enquiry not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: enquiry });
  } catch (error) {
    const status = error.message.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}