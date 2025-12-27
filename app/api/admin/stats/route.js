import ConnectDB from "@/utils/ConnectDB";
import Enquiry from "@/models/Enquiry";
import Project from "@/models/Project";
import Blog from "@/models/Blog";
import { verifyAdmin } from "@/utils/verifyAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await verifyAdmin();
    await ConnectDB();

    const [enquiries, newEnquiries, projects, blogs] = await Promise.all([
      Enquiry.countDocuments(),
      Enquiry.countDocuments({ status: 'new' }),
      Project.countDocuments(),
      Blog.countDocuments()
    ]);

    return NextResponse.json({
      success: true,
      data: {
        enquiries,
        newEnquiries,
        projects,
        blogs
      }
    });
  } catch (error) {
    const status = error.message.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
