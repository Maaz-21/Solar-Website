"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShieldCheck, Users, Sun, Leaf, Award, Clock, ArrowRight, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        <AboutHero />
        <StatsSection />
        <MissionValues />
        <ProcessSection />
        <AboutCTA />
      </main>
      <Footer />
    </>
  );
}

function AboutHero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-gradient-to-b from-green-50/50 to-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="hero-badge">
              <Leaf className="w-4 h-4" /> Since 2018
            </div>
            <h1 className="hero-heading">
              Powering India’s future with <span className="text-primary">clean energy.</span>
            </h1>
            <p className="hero-subtitle">
              At Solar Owl, we believe that sustainable energy should be accessible, affordable, and hassle-free for every homeowner and business. We are not just installing panels; we are building a greener tomorrow.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[400px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl shadow-green-900/10"
          >
            <Image
              src="/installation-1.jpg" 
              alt="Team installing solar panels"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { label: "Years of Experience", value: "6+", icon: Clock },
    { label: "Happy Customers", value: "500+", icon: Users },
    { label: "Installations", value: "2MW+", icon: Sun },
    { label: "Service Guarantee", value: "25 Yrs", icon: Award },
  ];

  return (
    <section className="py-12 bg-primary text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex p-3 bg-white/10 rounded-full mb-4 backdrop-blur-sm">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm md:text-base text-green-100 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MissionValues() {
  return (
    <section className="section bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">Our Mission & Values</h2>
          <p className="text-gray-600">
            We are driven by a commitment to quality, transparency, and customer satisfaction.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <ValueCard 
            icon={ShieldCheck}
            title="Uncompromised Quality"
            desc="We use only Tier-1 solar panels and top-rated inverters to ensure your system performs efficiently for decades."
          />
          <ValueCard 
            icon={Users}
            title="Customer First"
            desc="From consultation to post-installation support, our team is dedicated to providing a seamless and transparent experience."
          />
          <ValueCard 
            icon={Leaf}
            title="Sustainability"
            desc="Every kilowatt of solar energy we install reduces carbon footprint and contributes to a cleaner, healthier planet."
          />
        </div>
      </div>
    </section>
  );
}

function ValueCard({ icon: Icon, title, desc }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="card card-hover-lift p-8 bg-light"
    >
      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-6 text-primary">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-dark mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function ProcessSection() {
  const steps = [
    { title: "Consultation", desc: "We analyze your energy needs and roof structure." },
    { title: "Design & Proposal", desc: "Custom engineering design with savings estimate." },
    { title: "Installation", desc: "Safe, quick, and non-invasive installation by experts." },
    { title: "Activation", desc: "Net metering setup and system handover." },
  ];

  return (
    <section className="section bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">How We Work</h2>
          <p className="text-gray-600">A simple, transparent process to get you solar-ready.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-md">
                  {i + 1}
                </div>
                <div className="h-0.5 flex-grow bg-gray-200 md:hidden"></div>
              </div>
              <h3 className="text-lg font-bold text-dark mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.desc}</p>
              
              {/* Connector line for desktop */}
              {i !== steps.length - 1 && (
                <div className="hidden md:block absolute top-5 left-12 right-0 h-0.5 bg-gray-200 -z-10" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutCTA() {
  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-dark mb-6">Ready to switch to solar?</h2>
        <p className="text-gray-600 mb-8 text-lg">
          Join hundreds of happy homeowners saving money and the planet.
        </p>
        <a 
          href="/contact" 
          className="inline-flex items-center gap-2 btn-primary px-8 py-4 rounded-full shadow-lg shadow-green-900/20 hover:scale-105 transition-transform"
        >
          Get a Free Quote <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}
