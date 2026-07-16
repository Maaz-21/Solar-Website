import ConnectDB from "@/utils/ConnectDB";
import Enquiry from "@/models/Enquiry";
import Project from "@/models/Project";
import Blog from "@/models/Blog";
import SolarProject from "@/models/SolarProject";
import { verifyAdmin } from "@/utils/verifyAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await verifyAdmin();
    await ConnectDB();

    const [enquiries, newEnquiries, projects, blogs, solarDesigns, studioLeads, kwAgg] =
      await Promise.all([
        Enquiry.countDocuments(),
        Enquiry.countDocuments({ status: "new" }),
        Project.countDocuments(),
        Blog.countDocuments(),
        SolarProject.countDocuments(),
        Enquiry.countDocuments({ "solarDesign.source": "design-studio" }),
        SolarProject.aggregate([
          { $group: { _id: null, totalKW: { $sum: "$panelLayout.systemSizeKW" } } },
        ]),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        enquiries,
        newEnquiries,
        projects,
        blogs,
        solarDesigns,
        studioLeads,
        totalDesignedKW: Math.round((kwAgg[0]?.totalKW ?? 0) * 10) / 10,
      },
    });
  } catch (error) {
    const status = error.message.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
