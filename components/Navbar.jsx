"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-3" : "bg-white py-5"
      }`}
    >
      <nav className="flex items-center justify-between px-6 md:px-12 lg:px-24">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-primary tracking-tight flex items-center gap-2">
          <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-lg">T</span>
          Tiranga Solar
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-dark">
          <NavLink href="/solutions">Solutions</NavLink>
          <NavLink href="/products">Products</NavLink>
          <NavLink href="/projects">Projects</NavLink>
          <NavLink href="/blog">Blog</NavLink>
          <NavLink href="/about">About</NavLink>
          
          <div className="nav-dropdown group relative">
            <button className="flex items-center gap-1 py-2 hover:text-primary transition-colors">
              More <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
            </button>
            <div className="nav-dropdown-menu absolute top-full left-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 ease-out">
              <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-2 min-w-[180px] overflow-hidden">
                <DropdownItem href="#">Solar Calculator</DropdownItem>
                <DropdownItem href="/faq">FAQs</DropdownItem>
                <DropdownItem href="#">Solar Pro</DropdownItem>
                <DropdownItem href="#">Careers</DropdownItem>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary text-sm px-5 py-2.5 rounded-full shadow-lg shadow-green-900/10"
          >
            <Link href="/contact" className="font-semibold transition-colors">
            Contact
            </Link>
          </motion.button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-dark"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4 text-base font-medium">
              <Link href="/solutions" className="py-2 border-b border-gray-50">Solutions</Link>
              <Link href="/products" className="py-2 border-b border-gray-50">Products</Link>
              <Link href="/projects" className="py-2 border-b border-gray-50">Projects</Link>
              <Link href="/blog" className="py-2 border-b border-gray-50">Blog</Link>
              <Link href="/about" className="py-2 border-b border-gray-50">About</Link>
              <Link href="/contact" className="py-2 text-primary font-semibold transition-colors">Contact Us</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavLink({ href, children }) {
  return (
    <Link href={href} className="relative group py-2 hover:text-primary transition-colors">
      {children}
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}

function DropdownItem({ href, children }) {
  return (
    <Link href={href} className="block px-4 py-2 text-sm text-gray-600 hover:bg-green-50 hover:text-primary rounded-lg transition-colors">
      {children}
    </Link>
  );
}
