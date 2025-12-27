import ConnectDB from "@/utils/ConnectDB";
import Enquiry from "@/models/Enquiry";
import { verifyAdmin } from "@/utils/verifyAdmin";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await verifyAdmin();
    await ConnectDB();
    
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    
    const query = {};
    if (statusFilter) {
      query.status = statusFilter;
    }

    const enquiries = await Enquiry.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: enquiries });
  } catch (error) {
    const status = error.message.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}