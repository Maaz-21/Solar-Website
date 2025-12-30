"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Home, Building2, Battery, CheckCircle2, ArrowRight, Zap, Sun } from "lucide-react";
import Link from "next/link";

export default function SolutionsPage() {
  return (
    <>
      <Navbar />
      <main>
        <SolutionsHero />
        <SolutionsList />
        <SolutionsCTA />
      </main>
      <Footer />
    </>
  );
}

function SolutionsHero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 overflow-hidden bg-gradient-to-b from-green-50/50 to-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="hero-badge">
            <Sun className="w-4 h-4" /> Tailored Energy Solutions
          </div>
          <h1 className="hero-heading">
            Solar solutions for every <span className="text-primary">need.</span>
          </h1>
          <p className="hero-subtitle">
            Whether you want to power your home, run your business efficiently, or ensure 24/7 backup, we have the right solar system for you.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function SolutionsList() {
  const solutions = [
    {
      id: "residential",
      title: "Residential Rooftop Solar",
      desc: "Turn your home's roof into a power plant. Save up to 90% on electricity bills and protect your family from rising energy costs.",
      icon: Home,
      benefits: [
        "Drastic reduction in monthly electricity bills",
        "Earn from excess power generation (Net Metering)",
        "Increase property value",
        "25-year performance warranty",
      ],
      color: "bg-blue-50 text-blue-600",
    },
    {
      id: "commercial",
      title: "Commercial & Industrial Solar",
      desc: "Maximize profitability by cutting operational costs. Ideal for factories, offices, schools, and hospitals with high daytime consumption.",
      icon: Building2,
      benefits: [
        "Accelerated depreciation benefits (Tax savings)",
        "ROI typically within 3-4 years",
        "Reduce carbon footprint & meet ESG goals",
        "Scalable systems for growing businesses",
      ],
      color: "bg-orange-50 text-orange-600",
    },
    {
      id: "hybrid",
      title: "Hybrid & Battery Storage",
      desc: "Energy independence with 24/7 power. Store excess solar energy to use during night or power outages.",
      icon: Battery,
      benefits: [
        "Power backup during grid outages",
        "Use solar power even at night",
        "Reduce reliance on diesel generators",
        "Smart energy management",
      ],
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <section className="section bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-24">
          {solutions.map((solution, index) => (
            <SolutionCard key={solution.id} solution={solution} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SolutionCard({ solution, index }) {
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${!isEven ? "lg:grid-flow-dense" : ""}`}
    >
      {/* Content Side */}
      <div className={!isEven ? "lg:col-start-2" : ""}>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${solution.color}`}>
          <solution.icon className="w-7 h-7" />
        </div>
        
        <h2 className="text-3xl font-bold text-dark mb-4">{solution.title}</h2>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          {solution.desc}
        </p>

        <div className="card bg-light p-6 mb-8">
          <h3 className="font-semibold text-dark mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> Key Benefits
          </h3>
          <ul className="space-y-3">
            {solution.benefits.map((benefit, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm md:text-base">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <Link 
          href="/contact" 
          className="link-arrow group"
        >
          Get a quote for {solution.title} 
          <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Visual Side (Placeholder for now, can be replaced with specific images) */}
      <div className={!isEven ? "lg:col-start-1" : ""}>
        <div className={`relative h-[400px] rounded-3xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center group`}>
           {/* In a real app, use <Image /> here with specific images for each solution */}
           <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-200 opacity-50" />
           <solution.icon className="w-32 h-32 text-gray-300 group-hover:scale-110 transition-transform duration-500" />
           <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-sm border-t border-white/50">
             <p className="text-sm font-medium text-center text-gray-500">
               Visual representation of {solution.title}
             </p>
           </div>
        </div>
      </div>
    </motion.div>
  );
}

function SolutionsCTA() {
  return (
    <section className="py-20 bg-primary text-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-6">Not sure which solution is right for you?</h2>
        <p className="text-green-50 mb-8 text-lg max-w-2xl mx-auto">
          Our experts can analyze your electricity bill and roof space to recommend the perfect system.
        </p>
        <Link 
          href="/contact" 
          className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-full font-bold shadow-xl hover:bg-gray-50 hover:scale-105 transition-all duration-300"
        >
          Talk to an Expert <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
