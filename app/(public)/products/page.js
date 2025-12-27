"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Check, Zap, Shield, Info, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ProductsPage() {
  return (
    <>
      <Navbar />
      <main>
        <ProductsHero />
        <PricingPackages />
        <ComparisonSection />
        <ProductsCTA />
      </main>
      <Footer />
    </>
  );
}

function ProductsHero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 bg-gradient-to-b from-blue-50/50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" /> Transparent Pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-dark mb-6 leading-tight">
            Simple, transparent <span className="text-blue-600">solar plans.</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Choose the right system size for your energy needs. All our packages include premium components, professional installation, and comprehensive warranties.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function PricingPackages() {
  const packages = [
    {
      size: "3kW",
      idealFor: "2-3 BHK Home",
      generation: "~12-15 units/day",
      price: "₹1.8L - ₹2.2L",
      subsidy: "Eligible for Govt Subsidy",
      features: [
        "High-efficiency Mono PERC Panels",
        "On-Grid Inverter (5-year warranty)",
        "Galvanized Structure (Wind resistant)",
        "Net Metering Assistance",
      ],
      popular: false,
    },
    {
      size: "5kW",
      idealFor: "Large Home / Villa",
      generation: "~20-25 units/day",
      price: "₹2.8L - ₹3.2L",
      subsidy: "Eligible for Govt Subsidy",
      features: [
        "High-efficiency Mono PERC Panels",
        "On-Grid Inverter (WiFi enabled)",
        "Elevated Structure options",
        "Priority Installation Support",
      ],
      popular: true,
    },
    {
      size: "8kW",
      idealFor: "Large Villa / Office",
      generation: "~32-40 units/day",
      price: "₹4.2L - ₹4.8L",
      subsidy: "Partial Subsidy Eligibility",
      features: [
        "Premium Bifacial Panels",
        "Advanced String Inverter",
        "Remote Monitoring App",
        "3 Free Maintenance Visits",
      ],
      popular: false,
    },
    {
      size: "10kW",
      idealFor: "Commercial / Joint Family",
      generation: "~40-50 units/day",
      price: "₹5.0L - ₹5.8L",
      subsidy: "Commercial Depreciation Benefit",
      features: [
        "Premium Bifacial Panels",
        "Three-Phase Inverter",
        "Heavy-duty Structure",
        "Dedicated Project Manager",
      ],
      popular: false,
    },
  ];

  return (
    <section className="section bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {packages.map((pkg, index) => (
            <PackageCard key={pkg.size} pkg={pkg} index={index} />
          ))}
        </div>
        <p className="text-center text-sm text-gray-500 mt-12">
          * Prices are indicative and may vary based on roof type, structure height, and component brands. Subsidy rules subject to government policy.
        </p>
      </div>
    </section>
  );
}

function PackageCard({ pkg, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className={`relative flex flex-col p-6 rounded-2xl border ${
        pkg.popular ? "border-blue-500 shadow-xl shadow-blue-100 scale-105 z-10 bg-white" : "border-gray-200 bg-gray-50/50"
      }`}
    >
      {pkg.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
          Most Popular
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-dark mb-1">{pkg.size} System</h3>
        <p className="text-sm text-gray-500 font-medium">{pkg.idealFor}</p>
      </div>

      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="text-3xl font-bold text-dark mb-1">{pkg.price}</div>
        <p className="text-xs text-green-600 font-medium flex items-center gap-1">
          <Check className="w-3 h-3" /> {pkg.subsidy}
        </p>
      </div>

      <div className="space-y-4 mb-8 flex-grow">
        <div className="flex items-center gap-3 text-sm text-gray-700">
          <Zap className="w-4 h-4 text-yellow-500 shrink-0" />
          <span>Generates <strong>{pkg.generation}</strong></span>
        </div>
        {pkg.features.map((feature, i) => (
          <div key={i} className="flex items-start gap-3 text-sm text-gray-600">
            <Check className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <Link 
        href="/contact" 
        className={`w-full py-3 rounded-xl font-semibold text-center transition-all ${
          pkg.popular 
            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200" 
            : "bg-white border border-gray-200 text-dark hover:border-blue-500 hover:text-blue-600"
        }`}
      >
        Get Quote
      </Link>
    </motion.div>
  );
}

function ComparisonSection() {
  return (
    <section className="section bg-gray-50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-dark mb-4">What's included in every plan?</h2>
          <p className="text-gray-600">We don't cut corners. Every installation comes with our quality promise.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6 text-green-600">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-dark mb-3">25-Year Warranty</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Performance warranty on solar panels ensuring they generate at least 80% power even after 25 years.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-dark mb-3">Top-Tier Inverters</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              We use only rated inverters (Growatt, Solis, Enphase) with 98%+ efficiency and smart monitoring capabilities.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6 text-orange-600">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-dark mb-3">Lifetime Support</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Our relationship doesn't end at installation. We provide cleaning guides, maintenance checks, and support.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductsCTA() {
  return (
    <section className="py-20 bg-dark text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Custom requirements?</h2>
        <p className="text-gray-300 mb-8 text-lg max-w-2xl mx-auto">
          Need a larger commercial setup or a specific off-grid solution? We design custom solar plants tailored to your consumption patterns.
        </p>
        <Link 
          href="/contact" 
          className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-green-600 transition-all duration-300"
        >
          Request Custom Proposal <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
