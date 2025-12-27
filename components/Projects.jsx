"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { useState, useEffect } from "react";

export default function ProjectsPreview() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        if (data.success) {
          const formattedProjects = data.data.slice(0, 3).map(p => ({
            location: p.location,
            size: p.capacity + " " + p.type,
            image: (p.images && p.images.length > 0) ? p.images[0] : "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?q=80&w=2058&auto=format&fit=crop",
          }));
          setProjects(formattedProjects);
        }
      } catch (error) {
        console.error("Failed to fetch projects", error);
      }
    }
    fetchProjects();
  }, []);

  return (
    <section className="section bg-yellow-50/50">
      <div className="max-w-7xl mx-auto">

        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-dark mb-8"
        >
          Recent solar installations
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-6">
          {projects.map((p, i) => (
            <motion.div
              key={p.location}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="group rounded-xl overflow-hidden border border-gray-100 bg-white hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300"
            >
              <div className="relative h-52 overflow-hidden">
                <Image 
                  src={p.image} 
                  alt={p.location} 
                  fill 
                  className="object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>

              <div className="p-5">
                <p className="text-sm text-gray-500 mb-1">{p.location}</p>
                <p className="font-semibold text-dark text-lg">{p.size}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-10"
        >
          <a href="/projects" className="inline-flex items-center text-primary font-medium hover:text-green-700 transition-colors group">
            View all installations <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
