"use client";

import { motion } from "framer-motion";
import { Wallet, ShieldCheck, CloudSun, Wrench, ArrowRight } from "lucide-react";

export default function WhySolar() {
  return (
    <section className="section bg-white">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-14"
        >
          <h2 className="section-heading">
            Why homeowners choose us for rooftop solar
          </h2>
          <p className="text-gray-700">
            Every system is engineered for long-term performance, safety,
            and savings — not quick installations.
          </p>
        </motion.div>

        {/* Benefits grid */}
        <div className="grid lg:grid-cols-2 gap-10">

          {/* Left column */}
          <div className="space-y-8">
            <BenefitCard
              icon={Wallet}
              title="Financing that fits your budget"
              desc="Flexible EMI options and subsidy guidance make switching to solar simple and affordable, without upfront stress."
              delay={0.1}
            />

            <BenefitCard
              icon={ShieldCheck}
              title="Zero water-leakage guarantee"
              desc="Non-invasive mounting and chemical anchoring techniques protect your roof integrity for decades."
              delay={0.2}
            />
          </div>

          {/* Right column (offset for visual rhythm) */}
          <div className="space-y-8 lg:pt-12">
            <BenefitCard
              icon={CloudSun}
              title="Designed for extreme weather"
              desc="Structures engineered to withstand high winds, heavy rain, and harsh Indian climate conditions."
              delay={0.3}
            />

            <BenefitCard
              icon={Wrench}
              title="Professional maintenance included"
              desc="Regular cleaning, system health checks, and performance monitoring — so your system always delivers."
              delay={0.4}
            />
          </div>

        </div>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16"
        >
          <a
            href="/projects"
            className="link-arrow group"
          >
            See our installations <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </motion.div>

      </div>
    </section>
  );
}

function BenefitCard({ title, desc, icon: Icon, delay }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
      className="card card-hover-lift p-6 flex gap-5 items-start bg-light"
    >
      <div className="shrink-0 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
        <Icon className="w-[26px] h-[26px] text-primary" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-dark mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          {desc}
        </p>
      </div>
    </motion.div>
  );
}
