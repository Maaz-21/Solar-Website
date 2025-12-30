"use client";

import { motion } from "framer-motion";
import { Home, Building2, Battery, ArrowRight } from "lucide-react";
import Link from "next/link";

const solutions = [
  {
    title: "Home rooftop solar",
    desc: "Reduce electricity bills and increase property value.",
    icon: Home,
  },
  {
    title: "Commercial solar",
    desc: "Lower operating costs with high-efficiency systems.",
    icon: Building2,
  },
  {
    title: "Hybrid & battery backup",
    desc: "Power your home even during outages and winter storms.",
    icon: Battery,
  },
];

export default function SolutionsSummary() {
  return (
    <section className="section bg-white">
      <div className="max-w-7xl mx-auto">

        <h2 className="section-heading"> Solutions we provide </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {solutions.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -3 }}
              className="solution-card"
            >
              <div className="solution-icon">
                <s.icon className="w-6 h-6 text-primary" />
              </div>
              
              <h3 className="font-semibold text-dark mb-2 text-lg">{s.title}</h3>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">{s.desc}</p>
              
              <Link href="/solutions" className="link-arrow">
                Learn more <ArrowRight className="ml-1 w-3 h-3 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
