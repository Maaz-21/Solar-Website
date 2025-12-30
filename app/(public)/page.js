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

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <SolutionsSummary />
      <Contact />
      <WhySolar />
      <Testimonials />
      <ProjectsPreview />
      <Blog />
      <FAQs />
      <FinalCTA />
      <Footer />
    </>
  );
}
