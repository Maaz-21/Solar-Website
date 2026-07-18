"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Calculator, CheckCircle2, Zap, ShieldCheck, Sparkles } from "lucide-react";

const slides = [
  {
    image: "/installation-2.webp",
    title: "Your Roof. Your Solar. Our Responsibility.",
    subtitle: "End-to-end solar installation with zero middlemen.",
  },
  {
    image: "/installation-1.webp",
    title: "Power Your Home with Clean Energy",
    subtitle: "Reliable solar solutions for modern homes.",
  },
  {
    image: "/installation-3.webp",
    title: "Solar That Pays for Itself",
    subtitle: "Lower bills. Higher savings. Sustainable future.",
  },
];

const metrics = [
  { icon: Zap, label: "2MW+", sub: "Installations" },
  { icon: ShieldCheck, label: "Startup India", sub: "DIPP113232 Certified" },
  { icon: CheckCircle2, label: "Govt Subsidy", sub: "PM Surya Ghar Support" },
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
      {/* Ambient backdrop — the page-wide SunlightFlow effect provides the
          light source in the top-right; here only soft orbs + dot pattern. */}
      <div className="hero-orb hero-orb--green" aria-hidden="true" />
      <div className="hero-orb hero-orb--gold" aria-hidden="true" />
      <div className="hero-pattern" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left Text Content — entrance runs via CSS (transform-only) so the
              LCP heading is visible in the server HTML before hydration. */}
          <div className="max-w-2xl hero-enter-text">
            <div className="hero-badge">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              #1 Solar Installer in Your Region
            </div>

            {/* initial={false}: the first slide renders visible in server HTML;
                only the 7s slide *changes* animate. */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45 }}
              >
                <h1 className="hero-heading">{slides[active].title}</h1>
                <p className="hero-subtitle">{slides[active].subtitle}</p>
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Link href="/solar-design" className="btn-hero-primary">
                <Sparkles className="w-5 h-5" />
                Design Your Solar in 3D
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link href="/contact" className="btn-hero-secondary">
                Get free quote
              </Link>
            </div>

            <Link href="/calculator" className="link-arrow mb-10 inline-flex">
              <Calculator className="w-4 h-4 mr-1.5" /> Or try the quick savings calculator
            </Link>

            {/* Metric Chips */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              {metrics.map((m, i) => (
                <motion.div key={i} whileHover={{ y: -5 }} className="metric-card">
                  <m.icon className="w-6 h-6 text-primary mb-2" />
                  <div className="font-bold text-dark text-lg">{m.label}</div>
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">{m.sub}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Image Panel — stacked slides crossfade instead of hard swap.
              CSS entrance (scale only) keeps the LCP image paintable pre-hydration. */}
          <div className="hero-image-wrapper hero-enter-image">
            {slides.map((slide, index) => (
              <Image
                key={slide.image}
                src={slide.image}
                alt={slide.title}
                fill
                priority={index === 0}
                quality={60}
                sizes="(max-width: 1023px) 100vw, 50vw"
                className={`object-cover transition-opacity duration-1000 ${
                  active === index ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

            {/* Floating proof chip */}
            <div className="hero-float-chip" aria-hidden="true">
              <Zap className="w-4 h-4" />
              <span>₹0 electricity bill — Panvel installation</span>
            </div>

            {/* Carousel Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActive(index)}
                  aria-label={`Show slide ${index + 1}`}
                  className={`carousel-dot ${active === index ? "carousel-dot-active" : ""}`}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
