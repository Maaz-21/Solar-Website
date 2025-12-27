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
    desc: "Power your home even during outages.",
    icon: Battery,
  },
];

export default function SolutionsSummary() {
  return (
    <section className="section bg-white">
      <div className="max-w-7xl mx-auto">

        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-dark mb-8"
        >
          Solutions we provide
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-6">
          {solutions.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="p-6 rounded-xl border border-gray-100 bg-white hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                <s.icon className="w-6 h-6 text-primary" />
              </div>
              
              <h3 className="font-semibold text-dark mb-2 text-lg">{s.title}</h3>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">{s.desc}</p>
              
              <Link href="/solutions" className="inline-flex items-center text-primary text-sm font-medium hover:text-green-700 transition-colors">
                Learn more <ArrowRight className="ml-1 w-3 h-3 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
