import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Contact from "@/components/Contact";
import WhySolar from "@/components/WhySolar";
import Blog from "@/components/Blog";
import FAQs from "@/components/Faq";
import ProjectsPreview from "@/components/Projects";
import SolutionsSummary from "@/components/Solutions";
import FinalCTA from "@/components/FinalCTA";
import Testimonials from "@/components/Testimonials";
import DesignStudioShowcase from "@/components/DesignStudioShowcase";
import { getHomepageData } from "@/lib/publicData";

// Rebuild the page with fresh CMS content every 5 minutes (ISR) — visitors
// always get a fully-rendered static page with no client-side data fetching.
export const revalidate = 300;

export default async function Home() {
  const { testimonials, projects, posts } = await getHomepageData();

  return (
    <>
      <Navbar />
      <Hero />
      <DesignStudioShowcase />
      <SolutionsSummary />
      <WhySolar />
      <Testimonials testimonials={testimonials} />
      <ProjectsPreview projects={projects} />
      <Contact />
      <Blog posts={posts} />
      <FAQs />
      <FinalCTA />
      <Footer />
    </>
  );
}
