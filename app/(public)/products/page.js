"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import {
  Sun,
  Battery,
  Zap,
  Cpu,
  ShieldCheck,
  Wifi,
  Car,
  Building2,
  Factory,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ProductsPage() {
  return (
    <>
      <Navbar />

      <main>
        <ProductsHero />
        <SolarProducts />
        <EVChargers />
        <EVFeatures />
        <BESSSection />
        <ApplicationsSection />
        <ProductsCTA />
      </main>

      <Footer />
    </>
  );
}

function ProductsHero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 bg-gradient-to-b from-green-50/40 to-white overflow-hidden">

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 text-center">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >

          <div className="hero-badge">
            <Zap className="w-4 h-4" />
            Integrated Clean Energy Products
          </div>

          <h1 className="hero-heading">
            Solar, EV & Battery
            <span className="text-primary"> energy solutions.</span>
          </h1>

          <p className="hero-subtitle max-w-3xl mx-auto">
            Explore advanced solar PV systems, EV charging infrastructure,
            and Battery Energy Storage Systems engineered for homes,
            businesses, industries, and public infrastructure.
          </p>

        </motion.div>
      </div>
    </section>
  );
}

function SolarProducts() {
  const products = [
    {
      icon: Sun,
      title: "Solar Panels",
      desc: "High-efficiency Mono PERC & Bifacial solar panels for residential and commercial applications.",
    },
    {
      icon: Cpu,
      title: "Solar Inverters",
      desc: "Smart on-grid, hybrid, and industrial inverters with remote monitoring support.",
    },
    {
      icon: Battery,
      title: "Solar Batteries",
      desc: "Reliable lithium and tubular battery systems for backup and energy optimization.",
    },
    {
      icon: Zap,
      title: "Solar PV Systems",
      desc: "Complete rooftop and ground-mounted solar power systems from kilowatts to megawatts.",
    },
  ];

  return (
    <section className="section bg-white">

      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-16">
          <h2 className="section-heading">
            Solar Energy Products
          </h2>

          <p className="section-subtitle max-w-2xl mx-auto">
            Reliable, scalable, and future-ready solar infrastructure solutions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {products.map((product, index) => (
            <motion.div
              key={product.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card p-8 text-center"
            >

              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-6 text-primary">
                <product.icon className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-bold text-dark mb-3">
                {product.title}
              </h3>

              <p className="text-gray-600 text-sm leading-relaxed">
                {product.desc}
              </p>

            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EVChargers() {

  const chargers = [
    {
      title: "AC Type-2 Chargers",
      power: "Up to 42kW",
    },
    {
      title: "Bharat AC001",
      power: "Up to 10kW",
    },
    {
      title: "CCS2 Fast Chargers",
      power: "Up to 240kW",
    },
    {
      title: "3-in-1 Chargers",
      power: "CCS2 + CHAdeMO + AC",
    },
  ];

  return (
    <section className="section bg-gray-50">

      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-16">
          <h2 className="section-heading">
            EV Charging Infrastructure
          </h2>

          <p className="section-subtitle max-w-2xl mx-auto">
            Smart EV charging systems for homes, fleets, highways,
            commercial buildings, and public infrastructure.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {chargers.map((charger, index) => (
            <motion.div
              key={charger.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card p-8"
            >

              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 text-blue-600">
                <Car className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-bold text-dark mb-3">
                {charger.title}
              </h3>

              <p className="text-primary font-semibold mb-4">
                {charger.power}
              </p>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Smart Charging Support
              </div>

            </motion.div>
          ))}

        </div>
      </div>
    </section>
  );
}

function EVFeatures() {

  const features = [
    "OCPP 1.6J Support",
    "RFID Authentication",
    "Smart Charging",
    "IP54 Weather Protection",
    "Mobile Connectivity",
    "Remote Monitoring",
  ];

  return (
    <section className="section bg-white">

      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-16">
          <h2 className="section-heading">
            Smart EV Features
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {features.map((feature, index) => (
            <div
              key={feature}
              className="card p-6 flex items-center gap-4"
            >

              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-primary">
                <Wifi className="w-5 h-5" />
              </div>

              <span className="font-medium text-dark">
                {feature}
              </span>

            </div>
          ))}

        </div>
      </div>
    </section>
  );
}

function BESSSection() {
  return (
    <section className="section bg-gray-50">

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

        <div>

          <div className="hero-badge mb-6">
            <Battery className="w-4 h-4" />
            Battery Energy Storage Systems
          </div>

          <h2 className="section-heading">
            Intelligent energy storage for modern infrastructure.
          </h2>

          <p className="section-subtitle">
            Store excess solar energy, reduce grid dependency,
            enable backup power, and optimize energy utilization
            with advanced Battery Energy Storage Systems (BESS).
          </p>

          <div className="space-y-4">

            {[
              "24/7 Backup Power",
              "Peak Load Management",
              "Diesel Generator Reduction",
              "Smart Energy Optimization",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>{item}</span>
              </div>
            ))}

          </div>
        </div>

        <div className="relative h-[420px] rounded-3xl overflow-hidden">
          <Image
            src="/battery.avif"
            alt="Battery Energy Storage Systems"
            fill
            className="object-cover"
          />
        </div>

      </div>
    </section>
  );
}

function ApplicationsSection() {

  const applications = [
    {
      icon: Building2,
      title: "Residential",
    },
    {
      icon: Factory,
      title: "Industrial",
    },
    {
      icon: Car,
      title: "Fleet Charging",
    },
    {
      icon: Zap,
      title: "Highway Charging",
    },
  ];

  return (
    <section className="section bg-white">

      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-16">
          <h2 className="section-heading">
            Applications
          </h2>

          <p className="section-subtitle">
            Clean energy solutions across multiple sectors.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {applications.map((app) => (
            <div
              key={app.title}
              className="card p-8 text-center"
            >

              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-6 text-primary">
                <app.icon className="w-7 h-7" />
              </div>

              <h3 className="text-lg font-bold">
                {app.title}
              </h3>

            </div>
          ))}

        </div>
      </div>
    </section>
  );
}

function ProductsCTA() {
  return (
    <section className="py-20 bg-primary text-white">

      <div className="max-w-4xl mx-auto px-6 text-center">

        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Need a custom clean energy solution?
        </h2>

        <p className="text-green-50 mb-8 text-lg max-w-2xl mx-auto">
          Our engineers can design solar, EV charging,
          and energy storage infrastructure tailored to your needs.
        </p>

        <Link
          href="/contact"
          className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all duration-300"
        >
          Request Custom Proposal
          <ArrowRight className="w-4 h-4" />
        </Link>

      </div>
    </section>
  );
}