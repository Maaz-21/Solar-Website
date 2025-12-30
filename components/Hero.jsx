"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Calculator, CheckCircle2, Zap, ShieldCheck } from "lucide-react";

const slides = [
  {
    image: "/installation-2.webp",
    title: "Your Roof. Your Solar. Our Responsibility.",
    subtitle: "End-to-end solar installation with zero middlemen.",
  },
  {
    image: "/installation-1.jpg",
    title: "Power Your Home with Clean Energy",
    subtitle: "Reliable solar solutions for modern homes.",
  },
  {
    image: "/installation-3.jpg",
    title: "Solar That Pays for Itself",
    subtitle: "Lower bills. Higher savings. Sustainable future.",
  },
];

const metrics = [
  { icon: Zap, label: "500+ Homes", sub: "Solarized" },
  { icon: ShieldCheck, label: "25 Years", sub: "Warranty" },
  { icon: CheckCircle2, label: "0%", sub: "Leakage Guarantee" },
];

export default function Hero() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero-section">
      {/* Pattern Overlay */}
     <div className="hero-pattern" />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Text Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="hero-badge">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              #1 Solar Installer in Your Region
            </div>

            <h1 className="hero-heading"> {slides[active].title} </h1>
            <p className="hero-subtitle"> {slides[active].subtitle} </p>

            <div className="flex flex-wrap items-center gap-4 mb-10">
              <motion.button 
                whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(30, 127, 76, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary px-8 py-4 rounded-lg flex items-center gap-2 font-semibold"
              >
               <Link href="/contact">Get free quote </Link> <ArrowRight className="w-4 h-4" />
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.03, backgroundColor: "#f9fafb" }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 rounded-lg font-semibold text-dark border border-gray-200 bg-white shadow-sm transition-all flex items-center gap-2 outline-none"
              >
                <Calculator className="w-4 h-4 text-gray-500" /> <Link href="/calculator">Savings calculator</Link>
              </motion.button>
            </div>

            {/* Metric Chips */}
            <div className="grid grid-cols-3 gap-4">
              {metrics.map((m, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  className="metric-card"
                >
                  <m.icon className="w-6 h-6 text-primary mb-2" />
                  <div className="font-bold text-dark text-lg">{m.label}</div>
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">{m.sub}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Image Panel */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 10, scale: 1.1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="hero-image-wrapper"
          >
             <Image
                src={slides[active].image} alt="Solar installation"
                fill priority
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              
              {/* Carousel Dots */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActive(index)}
                    className={`carousel-dot ${active === index && "carousel-dot-active"}`}
                  />
                ))}
              </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
