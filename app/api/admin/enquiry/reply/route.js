import { NextResponse } from "next/server";
import ConnectDB from "@/utils/ConnectDB";
import Enquiry from "@/models/Enquiry";
import { verifyAdmin } from "@/utils/verifyAdmin";
import { sendEmail } from "@/utils/Sendmail";

export async function POST(request) {
  try {
    await verifyAdmin();
    await ConnectDB();

    const { enquiryId, subject, message } = await request.json();

    if (!enquiryId || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const enquiry = await Enquiry.findById(enquiryId);
    if (!enquiry) {
      return NextResponse.json(
        { success: false, error: "Enquiry not found" },
        { status: 404 }
      );
    }

    if (!enquiry.email) {
      return NextResponse.json(
        { success: false, error: "Enquiry has no email address" },
        { status: 400 }
      );
    }

    // Send email
    const emailSent = await sendEmail(enquiry.email, subject, message);
    if (!emailSent) {
      return NextResponse.json(
        { success: false, error: "Failed to send email" },
        { status: 500 }
      );
    }

    // Save reply to database
    enquiry.replies.push({
      subject,
      message,
      repliedAt: new Date(),
    });
    
    // Auto-update status to 'contacted' if it was 'new'
    if (enquiry.status === 'new') {
      enquiry.status = 'contacted';
    }

    await enquiry.save();

    return NextResponse.json({ success: true, data: enquiry });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes("Unauthorized") ? 401 : 500 }
    );
  }
}
