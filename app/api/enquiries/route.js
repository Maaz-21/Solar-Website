import ConnectDB from "@/utils/ConnectDB";
import Enquiry from "@/models/Enquiry";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await ConnectDB();
    const body = await request.json();
    const { name, phone, email, message, city, pincode, billRange } = body;

    if (!name || !phone || !email) {
      return NextResponse.json({ success: false, error: "Name, phone, and email are required" }, { status: 400 });
    }

    const enquiry = await Enquiry.create({
      name,
      phone,
      email,
      message,
      city,
      pincode,
      billRange
    });

    return NextResponse.json({ success: true, data: enquiry }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
