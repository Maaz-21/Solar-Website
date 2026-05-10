"use client";

import { motion } from "framer-motion";
import { CheckCircle2, MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-gray-300 pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 grid md:grid-cols-4 gap-12 mb-12">
        
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-4 text-white font-bold text-xl">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">T</div>
            Solar Owl
          </div>
          <p className="text-sm text-gray-400 leading-relaxed mb-6">
            Powering a sustainable future with reliable solar solutions for homes and businesses across India.
          </p>
          <div className="flex gap-4">
            <SocialIcon icon={Facebook} />
            <SocialIcon icon={Twitter} />
            <SocialIcon icon={Instagram} />
            <SocialIcon icon={Linkedin} />
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-5">Quick Links</h4>
          <ul className="space-y-3 text-sm">
            <FooterLink>About Us</FooterLink>
            <FooterLink>Solutions</FooterLink>
            <FooterLink>Projects</FooterLink>
            <FooterLink>Blog</FooterLink>
            <FooterLink>Careers</FooterLink>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-5">Services</h4>
          <ul className="space-y-3 text-sm">
            <FooterLink>Residential Solar</FooterLink>
            <FooterLink>Commercial Solar</FooterLink>
            <FooterLink>Solar Maintenance</FooterLink>
            <FooterLink>Financing</FooterLink>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-5">Contact</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary shrink-0" />
              <span>123 Solar Street, Green Tech Park, Pune, Maharashtra 411057</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary shrink-0" />
              <span>+91 98765 43210</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary shrink-0" />
              <span>info@tirangasolar.com</span>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
        <div>
          © {new Date().getFullYear()} Tiranga Green Energy Solutions. All rights reserved.
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ children }) {
  return (
    <li>
      <a href="#" className="hover:text-primary transition-colors flex items-center gap-2 group">
        <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-primary transition-colors"></span>
        {children}
      </a>
    </li>
  );
}

function SocialIcon({ icon: Icon }) {
  return (
    <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300">
      <Icon className="w-4 h-4" />
    </a>
  );
}
