"use client";

import Link from "next/link";
import { useState} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Menu, X, Globe } from "lucide-react";

const navLinks = [
  { href: "/solutions", label: "Solutions" },
  { href: "/products", label: "Products" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

const dropdownItems = [
  { href: "/calculator", label: "Solar Calculator" },
  { href: "/solar-design", label: "Solar Design Studio" },
  { href: "/faq", label: "FAQs" },
];

function DropdownMenu({ items }) {
  return (
    <div className="nav-dropdown">
      <button className="nav-dropdown-trigger">
        More <ChevronDown className="w-4 h-4" />
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
      <button className="nav-dropdown-trigger">
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

function MobileMenu({ links, currentLang, onLanguageChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mobile-menu"
    >
      <div className="mobile-menu-list">
        {links.map(({ href, label }) => (
          <Link key={href} href={href} className="mobile-link">{label}</Link>
        ))}
        <DropdownMenu items={dropdownItems} />
        <LanguageSelector currentLang={currentLang} onChange={onLanguageChange} />
        <Link href="/contact" className="mobile-cta">Contact Us</Link>
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
      <nav className="nav-container">
          {/* Logo */}
          <Link href="/" className="logo-link">
            <span className="logo-icon">T</span>
            Solar Owl
          </Link>

          {/* Desktop Nav */}
          <div className="desktop-nav">
              {navLinks.map(({ href, label }) => (
                <NavLink key={href} href={href}>{label}</NavLink>
              ))}
              <DropdownMenu items={dropdownItems} />
          </div>

          {/* Desktop CTA + Language */}
          <div className="desktop-nav">
              <LanguageSelector 
                currentLang={currentLang} 
                onChange={changeLanguage} 
              />
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary navbar-cta"
              >
                <Link href="/contact">Contact</Link>
              </motion.button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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