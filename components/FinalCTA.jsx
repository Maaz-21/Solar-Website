"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="section relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary to-green-800 z-0" />

      {/* Rotating sun rays + pattern */}
      <div className="cta-sun-rays" aria-hidden="true" />
      <div
        className="absolute inset-0 opacity-10 z-0"
        style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-6"
        >
          Ready to lower your electricity bill?
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mb-10 text-lg text-green-50/90 max-w-2xl mx-auto"
        >
          Design your own system on your real roof in 3 minutes, or talk to a
          solar expert for a free estimate. No hidden fees, no obligation.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/solar-design"
            className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-green-900/20 hover:bg-gray-50 hover:scale-105 transition-all duration-300"
          >
            <Sparkles className="w-5 h-5" /> Design your solar free
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 border-2 border-white/70 text-white px-8 py-3.5 rounded-full font-semibold text-lg hover:bg-white/10 hover:scale-105 transition-all duration-300"
          >
            Talk to an expert <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
