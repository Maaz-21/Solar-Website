"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Zap,
  Layers,
  Sun,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const fallbackImage =
  "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?q=80&w=2058&auto=format&fit=crop";

export default function ProjectDetailsPage() {
  const { id } = useParams();

  const projectId = useMemo(
    () => (Array.isArray(id) ? id[0] : id),
    [id]
  );

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!projectId) return;

    async function fetchProject() {
      try {
        const res = await fetch(`/api/projects/${projectId}`);

        const data = await res.json();

        if (data.success) {
          setProject(data.data);
        } else {
          setError(data.error || "Project not found");
        }
      } catch (err) {
        setError("Failed to fetch project");
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [projectId]);

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="min-h-screen flex items-center justify-center bg-light">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>

        <Footer />
      </>
    );
  }

  if (error || !project) {
    return (
      <>
        <Navbar />

        <div className="min-h-screen flex flex-col items-center justify-center pt-24 bg-light">
          <h1 className="text-2xl font-bold text-dark mb-4">
            Project Not Found
          </h1>

          <p className="text-gray-600 mb-6">
            The project you are looking for does not exist.
          </p>

          <Link
            href="/projects"
            className="btn-primary px-6 py-2.5 rounded-full"
          >
            Back to Projects
          </Link>
        </div>

        <Footer />
      </>
    );
  }

  const projectImages =
    Array.isArray(project.images) && project.images.length > 0
      ? project.images
      : [fallbackImage];

  const currentImage = projectImages[activeImage];

  const projectType = project.type
    ? project.type.charAt(0).toUpperCase() +
      project.type.slice(1)
    : "Solar";

  const createdDate = project.createdAt
    ? new Date(project.createdAt).toLocaleDateString()
    : "";

  const nextImage = () => {
    setActiveImage((prev) =>
      prev === projectImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setActiveImage((prev) =>
      prev === 0 ? projectImages.length - 1 : prev - 1
    );
  };

  return (
    <>
      <Navbar />

      <main className="bg-light min-h-screen">

        {/* HERO */}

        <section className="relative pt-32 pb-20 bg-dark overflow-hidden">

          <div className="absolute inset-0">
            <img
              src={currentImage}
              alt={project.title}
              className="w-full h-full object-cover opacity-20"
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-dark"></div>

          <div className="max-w-6xl mx-auto px-6 relative z-10 text-white">

            <Link
              href="/projects"
              className="inline-flex items-center text-sm text-gray-300 hover:text-white transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-sm mb-6">
                <Sun className="w-4 h-4 text-yellow-400" />
                {projectType}
              </div>

              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                {project.title}
              </h1>

              <div className="flex flex-wrap gap-6 text-sm text-gray-200">

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {project.location}
                </div>

                {createdDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {createdDate}
                  </div>
                )}

              </div>

            </motion.div>
          </div>
        </section>

        {/* CONTENT */}

        <section className="section bg-light">

          <div className="max-w-7xl mx-auto grid lg:grid-cols-[2fr,1fr] gap-10">

            {/* LEFT */}

            <div>

              {/* IMAGE GALLERY */}

              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

                <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">

                  <img
                    src={currentImage}
                    alt={project.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />

                  {projectImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition"
                      >
                        <ChevronLeft className="w-5 h-5 text-dark" />
                      </button>

                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition"
                      >
                        <ChevronRight className="w-5 h-5 text-dark" />
                      </button>
                    </>
                  )}

                </div>

                {/* THUMBNAILS */}

                {projectImages.length > 1 && (
                  <div className="p-4 border-t border-gray-100 flex gap-3 overflow-x-auto">

                    {projectImages.map((img, index) => (

                      <button
                        key={index}
                        onClick={() => setActiveImage(index)}
                        className={`relative min-w-[90px] h-20 rounded-xl overflow-hidden border-2 transition-all ${
                          activeImage === index
                            ? "border-primary"
                            : "border-transparent"
                        }`}
                      >

                        <img
                          src={img}
                          alt={`Thumbnail ${index}`}
                          className="w-full h-full object-cover"
                        />

                      </button>

                    ))}

                  </div>
                )}

              </div>

              {/* OVERVIEW */}

              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mt-8">

                <h2 className="text-2xl font-bold text-dark mb-5">
                  Project Overview
                </h2>

                <p className="text-gray-600 leading-relaxed text-lg">
                  {project.description ||
                    "This installation delivers clean, reliable solar energy with optimized engineering and long-term performance."}
                </p>

              </div>

            </div>

            {/* RIGHT SIDEBAR */}

            <div className="space-y-6">

              {/* HIGHLIGHTS */}

              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">

                <h3 className="text-xl font-bold text-dark mb-6">
                  Project Highlights
                </h3>

                <div className="space-y-5">

                  <InfoCard
                    icon={Zap}
                    title="Capacity"
                    value={project.capacity || "Custom"}
                  />

                  <InfoCard
                    icon={Layers}
                    title="System Type"
                    value={projectType}
                  />

                  <InfoCard
                    icon={MapPin}
                    title="Location"
                    value={project.location || "India"}
                  />

                </div>

              </div>

              {/* CTA */}

              <div className="rounded-3xl bg-primary text-white p-8">

                <h3 className="text-2xl font-bold mb-4">
                  Want a similar system?
                </h3>

                <p className="text-green-50 mb-8">
                  Get a tailored solar proposal with system design,
                  savings estimate, and subsidy guidance.
                </p>

                <div className="flex flex-col gap-3">

                  <Link
                    href="/contact"
                    className="bg-white text-primary py-3 rounded-full text-center font-bold hover:bg-gray-100 transition"
                  >
                    Get Free Consultation
                  </Link>

                  <Link
                    href="/products"
                    className="border border-white/20 py-3 rounded-full text-center font-semibold hover:bg-white/10 transition"
                  >
                    Explore Products
                  </Link>

                </div>

              </div>

            </div>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}

function InfoCard({ icon: Icon, title, value }) {
  return (
    <div className="flex items-start gap-4">

      <div className="w-12 h-12 rounded-2xl bg-green-50 text-primary flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>

      <div>
        <p className="text-sm text-gray-500">
          {title}
        </p>

        <p className="font-semibold text-dark">
          {value}
        </p>
      </div>

    </div>
  );
}