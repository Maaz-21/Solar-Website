import { NextResponse } from "next/server";
import ConnectDB from "@/utils/ConnectDB";
import Enquiry from "@/models/Enquiry";
import { verifyAdmin } from "@/utils/verifyAdmin";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    await verifyAdmin();
    await ConnectDB();

    const enquiries = await Enquiry.find().sort({ createdAt: -1 }).lean();

    const data = enquiries.map(enq => ({
      Name: enq.name,
      Phone: enq.phone,
      Email: enq.email,
      City: enq.city,
      Pincode: enq.pincode,
      "Bill Range": enq.billRange,
      Message: enq.message,
      Status: enq.status,
      "Created Date": new Date(enq.createdAt).toLocaleString("en-IN"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Enquiries");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="enquiries.xlsx"',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes("Unauthorized") ? 401 : 500 }
    );
  }
}
