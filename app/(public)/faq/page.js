"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Plus, Minus, HelpCircle, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";

const faqData = [
  {
    section: "Basics of Solar",
    items: [
      {
        q: "How does a rooftop solar system work?",
        a: "Solar panels convert sunlight into DC electricity. An inverter converts this into AC electricity, which powers your home appliances. Any excess power is sent back to the grid (in on-grid systems) or stored in batteries (in off-grid/hybrid systems)."
      },
      {
        q: "What is the difference between On-Grid and Off-Grid?",
        a: "On-Grid systems are connected to the government electricity grid and allow you to sell excess power (Net Metering). Off-Grid systems use batteries to store power and are not connected to the grid, making them ideal for areas with frequent power cuts."
      },
      {
        q: "Will solar work during power cuts?",
        a: "Standard on-grid systems shut down during power cuts for safety reasons (anti-islanding). If you need power during outages, you should opt for a Hybrid system with battery backup."
      },
    ],
  },
  {
    section: "Installation & Technical",
    items: [
      {
        q: "How much roof space do I need?",
        a: "Typically, 1kW of solar panels requires about 100 sq. ft. of shadow-free roof area. So, a 3kW system would need approximately 300 sq. ft."
      },
      {
        q: "Can installing solar damage my roof?",
        a: "No. We use non-invasive mounting structures that are elevated and properly waterproofed. In fact, panels can protect your roof from direct heat and rain."
      },
      {
        q: "What is the lifespan of a solar system?",
        a: "Solar panels come with a 25-year performance warranty. Inverters typically last 10-12 years and may need replacement once during the system's lifetime."
      },
      {
        q: "Does the system require heavy maintenance?",
        a: "No. Solar systems are very low maintenance. You only need to clean the panels with water every 2-3 weeks to remove dust and ensure maximum efficiency."
      },
    ],
  },
  {
    section: "Cost, Subsidy & ROI",
    items: [
      {
        q: "How much can I save on my electricity bill?",
        a: "Most households see a reduction of 80-90% in their electricity bills. If your monthly bill is ₹3,000, a 3kW system can bring it down to near zero (excluding fixed charges)."
      },
      {
        q: "Is there a government subsidy available?",
        a: "Yes! Under the PM Surya Ghar Muft Bijli Yojana, residential consumers can get subsidies up to ₹78,000 for systems up to 3kW. We handle all the paperwork for you."
      },
      {
        q: "What is the Return on Investment (ROI)?",
        a: "With current electricity rates and subsidies, most residential systems pay for themselves in 3 to 4 years. After that, you get free electricity for the next 20+ years."
      },
      {
        q: "Are financing options available?",
        a: "Yes, we have tie-ups with leading banks to provide solar loans at attractive interest rates with minimal documentation."
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <>
      <Navbar />
      <main className="bg-light min-h-screen">
        <FAQHero />
        <FAQContent />
        <FAQContact />
      </main>
      <Footer />
    </>
  );
}

function FAQHero() {
  return (
    <section className="pt-32 pb-12 bg-white border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-6">
            <HelpCircle className="w-4 h-4" /> Knowledge Base
          </div>
          <h1 className="section-heading">
            Frequently Asked Questions
          </h1>
          <p className="section-subtitle">
            Everything you need to know about switching to solar energy.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function FAQContent() {
  return (
    <section className="section">
      <div className="max-w-3xl mx-auto px-6 space-y-16">
        {faqData.map((group, index) => (
          <div key={group.section}>
            <h2 className="text-2xl font-bold text-dark mb-6 flex items-center gap-3">
              <span className="w-1.5 h-8 bg-primary rounded-full"></span>
              {group.section}
            </h2>
            <div className="space-y-4">
              {group.items.map((item, i) => (
                <FAQItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FAQItem({ q, a }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden transition-all duration-300 hover:border-primary/30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <span className={`font-semibold text-lg ${isOpen ? "text-primary" : "text-dark"}`}>
          {q}
        </span>
        <span className={`p-1 rounded-full transition-colors ${isOpen ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </span>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-5 pb-5 text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FAQContact() {
  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-2xl font-bold text-dark mb-4">Still have questions?</h2>
        <p className="text-gray-600 mb-8">
          Can't find the answer you're looking for? Our team is here to help.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/contact" 
            className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700 transition-colors"
          >
            <MessageCircle className="w-4 h-4" /> Contact Support
          </Link>
          <a 
            href="tel:+919876543210" 
            className="inline-flex items-center justify-center gap-2 border border-gray-200 text-dark px-6 py-3 rounded-full font-semibold hover:bg-gray-50 transition-colors"
          >
            <Phone className="w-4 h-4" /> +91 98765 43210
          </a>
        </div>
      </div>
    </section>
  );
}
