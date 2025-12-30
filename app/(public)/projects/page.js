"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { MapPin, Zap, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function ProjectsPage() {
  return (
    <>
      <Navbar />
      <main>
        <ProjectsHero />
        <ProjectsGrid />
        <ProjectsCTA />
      </main>
      <Footer />
    </>
  );
}

function ProjectsHero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 bg-dark text-white overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497440001374-f26997328c1b?q=80&w=2064&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-dark/80 to-dark"></div>
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-sm font-medium mb-6 border border-white/10">
            <Zap className="w-4 h-4 text-yellow-400" /> Proven Track Record
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Powering the future, <br/><span className="text-primary">one roof at a time.</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Explore our portfolio of successful installations across residential, commercial, and industrial sectors.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function ProjectsGrid() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        if (data.success) {
          const formattedProjects = data.data.map(p => ({
            id: p._id,
            title: p.title,
            location: p.location,
            capacity: p.capacity,
            type: p.type,
            image: (p.images && p.images.length > 0) ? p.images[0] : "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?q=80&w=2058&auto=format&fit=crop",
            desc: p.description
          }));
          setProjects(formattedProjects);
        }
      } catch (error) {
        console.error("Failed to fetch projects", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  return (
    <section className="section bg-light">
      <div className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ProjectCard({ project, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group card card-hover-lift"
    >
      <div className="relative h-64 overflow-hidden">
        <div className="absolute inset-0" /> {/* Loading placeholder effect */}
        <img 
          src={project.image} 
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-dark shadow-sm">
          {project.type}
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-dark mb-1 group-hover:text-primary transition-colors">
              {project.title}
            </h3>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="w-3 h-3" /> {project.location}
            </div>
          </div>
          <div className="bg-green-50 text-primary px-3 py-1 rounded-lg text-sm font-bold">
            {project.capacity}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          {project.desc}
        </p>

        <Link 
          href="/contact" 
          className="inline-flex items-center text-sm font-semibold text-dark hover:text-primary transition-colors"
        >
          View Details <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}

function ProjectsCTA() {
  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-dark mb-6">Ready to start your project?</h2>
        <p className="text-gray-600 mb-8 text-lg">
          Join hundreds of satisfied customers who have switched to solar.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/contact" 
            className="btn-primary px-8 py-3 rounded-full shadow-lg shadow-green-200"
          >
            Get a Free Quote
          </Link>
          <Link 
            href="/products" 
            className="px-8 py-3 rounded-full border border-gray-200 font-semibold text-dark hover:bg-gray-50 transition-colors"
          >
            View Solar Plans
          </Link>
        </div>
      </div>
    </section>
  );
}
