"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Plus, Minus, HelpCircle } from "lucide-react";

const faqData = [
  {
    section: "General",
    items: [
      {
        q: "What is the lifespan of a rooftop solar system?",
        a: "Most rooftop solar systems last 25 years or more. Solar panels typically come with a 25-year performance warranty, while inverters may need replacement after 8–12 years."
      },
      {
        q: "Will solar work during power cuts?",
        a: "Standard grid-connected systems switch off during power cuts for safety. With battery backup or hybrid systems, limited power can be used during outages."
      },
    ],
  },
  {
    section: "Installation & Maintenance",
    items: [
      {
        q: "Can installing solar damage my roof?",
        a: "No. When installed correctly using non-invasive mounting and proper waterproofing techniques, solar panels do not damage the roof."
      },
      {
        q: "Does a solar system require regular maintenance?",
        a: "Maintenance is minimal. Occasional panel cleaning and basic system checks are sufficient to ensure optimal performance."
      },
      {
        q: "Is solar suitable for non-concrete roofs?",
        a: "Yes. Solar systems can be installed on metal sheets, tiled roofs, and other structures using customized mounting solutions."
      },
    ],
  },
  {
    section: "Cost, Savings & Subsidy",
    items: [
      {
        q: "How much can I save on my electricity bill?",
        a: "Savings depend on system size and usage, but many households reduce their electricity bills by 70–90% after switching to solar."
      },
      {
        q: "Are government subsidies available?",
        a: "Yes. Rooftop solar systems are eligible for MNRE subsidies, subject to capacity and location. We assist with the complete subsidy process."
      },
      {
        q: "How long does it take to recover the cost?",
        a: "Most rooftop solar systems recover their cost within 4–6 years through electricity bill savings."
      },
    ],
  },
];

export default function FAQs() {
  return (
    <section className="section bg-gray-50">
      <div className="max-w-5xl mx-auto">

        {/* Heading */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center md:text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-4">
            <HelpCircle className="w-4 h-4" /> FAQ
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-dark mb-3">
            Frequently asked questions
          </h2>
          <p className="text-gray-600 max-w-2xl">
            Clear answers to common questions about rooftop solar.
          </p>
        </motion.div>

        {/* FAQ Groups */}
        <div className="space-y-14">
          {faqData.map((group, groupIndex) => (
            <motion.div 
              key={group.section}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: groupIndex * 0.1 }}
            >
              <h3 className="text-xl font-semibold text-dark mb-6 flex items-center gap-3">
                <span className="w-8 h-1 bg-primary/20 rounded-full"></span>
                {group.section}
              </h3>

              <div className="space-y-4">
                {group.items.map((item, index) => (
                  <FAQItem key={index} q={item.q} a={item.a} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center md:text-left bg-gray-50 rounded-2xl p-8 border border-gray-100"
        >
          <p className="text-gray-700 mb-4 font-medium">
            Still have questions?
          </p>
          <a
            href="/contact"
            className="inline-flex items-center text-primary font-semibold hover:text-green-700 transition-colors"
          >
            Talk to a solar expert →
          </a>
        </motion.div>

      </div>
    </section>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`border rounded-xl transition-all duration-300 ${open ? "border-primary/30 bg-green-50/30 shadow-sm" : "border-gray-200 hover:border-gray-300"}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center text-left px-6 py-5 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-xl"
        aria-expanded={open}
      >
        <span className={`font-medium text-lg transition-colors ${open ? "text-primary" : "text-dark"}`}>{q}</span>
        <span className={`ml-4 shrink-0 p-1 rounded-full transition-all duration-300 ${open ? "bg-primary text-white rotate-180" : "bg-gray-100 text-gray-500"}`}>
          {open ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 text-gray-600 leading-relaxed">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
