"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Menu, X, Globe, Sparkles } from "lucide-react";
import Image from "next/image";

const navLinks = [
  { href: "/solutions", label: "Solutions" },
  { href: "/products", label: "Products" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

// The Design Studio is the site's flagship lead-gen tool — it lives as the
// primary CTA, not buried in this dropdown.
const dropdownItems = [
  { href: "/calculator", label: "Solar Calculator" },
  { href: "/faq", label: "FAQs" },
  { href: "/contact", label: "Contact Us" },
];

function DropdownMenu({ items }) {
  return (
    <div className="nav-dropdown">
      <button className="nav-dropdown-trigger">
        More <ChevronDown className="w-4 h-4 cursor-pointer" />
      </button>
      <div className="nav-dropdown-menu">
        {items.map(({ href, label }) => (
          <DropdownItem key={href} href={href}>{label}</DropdownItem>
        ))}
      </div>
    </div>
  );
}

function LanguageSelector({ currentLang, onChange }) {
  return (
    <div className="nav-dropdown">
      <button className="nav-dropdown-trigger cursor-pointer">
        <Globe className="w-4 h-4" />
        {currentLang === "en" ? "English" : "Hindi"}
        <ChevronDown className="w-4 h-4" />
      </button>
      <div className="nav-dropdown-menu">
        <button onClick={() => onChange("en")} className="dropdown-item-btn">English</button>
        <button onClick={() => onChange("hi")} className="dropdown-item-btn">Hindi</button>
      </div>
    </div>
  );
}

function MobileMenu({ links, currentLang, onLanguageChange, onNavigate }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mobile-menu"
    >
      <div className="mobile-menu-list">
        <Link href="/solar-design" className="navbar-studio-cta w-full justify-center" onClick={onNavigate}>
          <Sparkles className="w-4 h-4" /> Design Your Solar — Free
        </Link>
        {links.map(({ href, label }) => (
          <Link key={href} href={href} className="mobile-link" onClick={onNavigate}>{label}</Link>
        ))}
        <Link href="/calculator" className="mobile-link" onClick={onNavigate}>Solar Calculator</Link>
        <Link href="/faq" className="mobile-link" onClick={onNavigate}>FAQs</Link>
        <LanguageSelector currentLang={currentLang} onChange={onLanguageChange} />
        <Link href="/contact" className="mobile-cta" onClick={onNavigate}>Contact Us</Link>
      </div>
    </motion.div>
  );
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");

  const changeLanguage = (lang) => {
    setCurrentLang(lang);
    const select = document.querySelector(".goog-te-combo");
    if (select) {
      select.value = lang;
      select.dispatchEvent(new Event("change"));
    }
  };

  return (
    <header className="navbar">
      <nav className="nav-container" aria-label="Main navigation">
        {/* Logo */}
        <Link href="/" className="logo-link">
          <span>
            <Image
              src="/logo.png"
              alt="SolarOwl logo"
              width={70}
              height={20}
              priority
            />
          </span>
          <div className="flex flex-col">
            <span className="font-bold text-xl leading-none text-gray-900">
              SolarOwl
            </span>
            <span className="text-xs text-gray-500 mt-1">
              Energy Solutions Pvt. Ltd.
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="desktop-nav">
          {navLinks.map(({ href, label }) => (
            <NavLink key={href} href={href}>{label}</NavLink>
          ))}
          <DropdownMenu items={dropdownItems} />
        </div>

        {/* Desktop CTAs + Language */}
        <div className="desktop-nav !gap-4">
          <LanguageSelector currentLang={currentLang} onChange={changeLanguage} />
          <Link href="/contact" className="nav-link">Contact</Link>
          <Link href="/solar-design" className="navbar-studio-cta">
            <Sparkles className="w-4 h-4" /> Design Your Solar
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <MobileMenu
            links={navLinks}
            currentLang={currentLang}
            onLanguageChange={changeLanguage}
            onNavigate={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </header>
  );
}

function NavLink({ href, children }) {
  return (
    <Link href={href} className="nav-link">
      {children}
    </Link>
  );
}

function DropdownItem({ href, children }) {
  return <Link href={href} className="dropdown-item">{children}</Link>;
}
