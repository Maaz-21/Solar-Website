import ConnectDB from "@/utils/ConnectDB";
import Testimonial from "@/models/Testimonial";
import Project from "@/models/Project";
import Blog from "@/models/Blog";

/**
 * Server-side data for the public homepage. Runs at build / ISR revalidate,
 * so visitors get fully-rendered sections with zero client fetches.
 * Fails soft: any DB problem renders the page without the affected section
 * until the next revalidation.
 */
export async function getHomepageData() {
  try {
    await ConnectDB();
    const [testimonials, projects, posts] = await Promise.all([
      Testimonial.find({ isActive: true })
        .sort({ createdAt: -1 })
        .select("name designation message rating photo")
        .lean(),
      Project.find({})
        .sort({ createdAt: -1 })
        .limit(3)
        .select("location capacity type images")
        .lean(),
      Blog.find({ published: true })
        .sort({ createdAt: -1 })
        .limit(3)
        .select("title slug image category createdAt")
        .lean(),
    ]);
    // Serialize ObjectIds/Dates so the data can cross the RSC boundary.
    return JSON.parse(JSON.stringify({ testimonials, projects, posts }));
  } catch (error) {
    console.error("getHomepageData failed:", error?.message);
    return { testimonials: [], projects: [], posts: [] };
  }
}
