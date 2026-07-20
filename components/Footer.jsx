"use client";

import Link from "next/link";
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin, Sparkles } from "lucide-react";
import TrustBadges from "@/components/TrustBadges";
export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-gray-300 pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
        
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-4 text-white font-bold text-xl">
            <div className="flex items-center gap-2">
              <img
                src="/logo2.svg"
                alt="SolarOwl"
                className="w-12 h-12 object-contain"
              />

              {/* Not a heading — the page's h1 is the hero title. */}
              <span className="text-2xl font-bold text-white">
                SolarOwl
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed mb-6">
            Powering a sustainable future with reliable solar solutions for homes and businesses across India.
          </p>
          <div className="flex gap-4">
            <SocialIcon icon={Facebook} label="SolarOwl on Facebook" />
            <SocialIcon icon={Twitter} label="SolarOwl on Twitter" />
            <SocialIcon icon={Instagram} label="SolarOwl on Instagram" />
            <SocialIcon icon={Linkedin} label="SolarOwl on LinkedIn" />
          </div>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-5">Quick Links</h3>
          <ul className="space-y-3 text-sm">
            <FooterLink href="/about">About Us</FooterLink>
            <FooterLink href="/solutions">Solutions</FooterLink>
            <FooterLink href="/projects">Projects</FooterLink>
            <FooterLink href="/blog">Blog</FooterLink>
            <FooterLink href="/faq">FAQs</FooterLink>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-5">Tools & Services</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/solar-design" className="inline-flex items-center gap-2 text-secondary font-semibold hover:text-yellow-300 transition-colors">
                <Sparkles className="w-3.5 h-3.5" /> Solar Design Studio
              </Link>
            </li>
            <FooterLink href="/calculator">Savings Calculator</FooterLink>
            <FooterLink href="/solutions">Residential Solar</FooterLink>
            <FooterLink href="/solutions">Commercial Solar</FooterLink>
            <FooterLink href="/contact">Get a Quote</FooterLink>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-white font-semibold mb-5">Contact</h3>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-primary shrink-0 mt-1" />
              <span className="flex-1">
                SolarOwl Energy Solutions Private Limited,
                Kalsekar Incubation Center, Anjuman-I-Islam&apos;s
                Kalsekar Technical Campus, Address - Plot 2 & 3,
                Sector 16, Khandagaon, Near Thana Naka,
                New Panvel, Panvel, Maharashtra, India - 410206
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary shrink-0" />
              <span>+91 94229 80148‬/ 7020660967</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary shrink-0" />
              <span>solarowlcare@gmail.com</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Reputation & verification — links out to Google Business Profile
          and Justdial (see components/TrustBadges.jsx). */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 mb-8 flex flex-col sm:flex-row sm:items-center gap-3 border-t border-gray-800 pt-8">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Rated &amp; Verified
        </span>
        <TrustBadges variant="compact" />
      </div>

      {/* gray-400, not gray-500 — 500 fails WCAG AA contrast on this navy. */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
        <div>
          © {new Date().getFullYear()} SOLAROWL ENERGY SOLUTIONS PRIVATE LIMITED. All rights reserved.
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href = "#", children }) {
  return (
    <li>
      <Link href={href} className="hover:text-primary transition-colors flex items-center gap-2 group">
        <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-primary transition-colors"></span>
        {children}
      </Link>
    </li>
  );
}

function SocialIcon({ icon: Icon, label }) {
  return (
    <a href="#" aria-label={label} className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300">
      <Icon className="w-4 h-4" />
    </a>
  );
}
