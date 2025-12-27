"use client";

import { useState, useEffect } from "react";
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
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-white via-green-50/30 to-blue-50/30 pt-24 pb-12 lg:pt-32 lg:pb-20">
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#1E7F4C 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100/50 text-primary text-sm font-medium mb-6 border border-green-200"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              #1 Solar Installer in Your Region
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-dark mb-6 leading-tight">
              {slides[active].title}
            </h1>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              {slides[active].subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-10">
              <motion.button 
                whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(30, 127, 76, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary px-8 py-4 rounded-lg font-semibold shadow-lg shadow-green-900/10 flex items-center gap-2 focus:ring-4 focus:ring-green-500/20 outline-none"
              >
                Get free quote <ArrowRight className="w-4 h-4" />
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.03, backgroundColor: "#f9fafb" }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 rounded-lg font-semibold text-dark border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all flex items-center gap-2 focus:ring-4 focus:ring-gray-200 outline-none"
              >
                <Calculator className="w-4 h-4 text-gray-500" /> Savings calculator
              </motion.button>
            </div>

            {/* Metric Chips */}
            <div className="grid grid-cols-3 gap-4">
              {metrics.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + (i * 0.1) }}
                  whileHover={{ y: -5 }}
                  className="bg-white/60 backdrop-blur-sm border border-white/50 p-4 rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                  <m.icon className="w-6 h-6 text-primary mb-2" />
                  <div className="font-bold text-dark text-lg">{m.label}</div>
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">{m.sub}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Image Panel */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl shadow-gray-200/50 border-4 border-white"
          >
             <Image
                src={slides[active].image}
                alt="Solar installation"
                fill
                priority
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              
              {/* Carousel Dots */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActive(index)}
                    className={`h-2 w-2 rounded-full transition-all duration-300 ${
                      active === index ? "w-6 bg-white" : "bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
