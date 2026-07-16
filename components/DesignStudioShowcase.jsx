"use client";

/**
 * Home-page showcase for the Solar Design Studio — the site's flagship
 * lead-gen tool. Left: value proposition. Right: an animated mock of the
 * studio (roof outline draws itself, panels pop in, live KPIs appear),
 * built with SVG + framer-motion, triggered on scroll.
 */

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles, ArrowRight, MousePointerClick, LayoutGrid, IndianRupee, Box,
} from "lucide-react";

const FEATURES = [
  {
    icon: MousePointerClick,
    title: "Draw your roof on live satellite imagery",
    sub: "Find your home and trace the roof — measurements appear as you draw.",
  },
  {
    icon: LayoutGrid,
    title: "Panels placed by a real engineering engine",
    sub: "Setbacks, spacing and obstacles handled automatically.",
  },
  {
    icon: IndianRupee,
    title: "Savings, subsidy & payback — instantly",
    sub: "PM Surya Ghar subsidy applied, ROI computed from live solar data.",
  },
  {
    icon: Box,
    title: "Review your system in interactive 3D",
    sub: "Orbit around your own roof with panels installed.",
  },
];

// Panel grid inside the mock roof (SVG coordinates).
const PANELS = [];
for (let row = 0; row < 3; row++) {
  for (let col = 0; col < 4; col++) {
    PANELS.push({ x: 108 + col * 50, y: 96 + row * 40, delay: 0.9 + (row * 4 + col) * 0.07 });
  }
}

export default function DesignStudioShowcase() {
  return (
    <section className="studio-showcase section" id="design-studio">
      <div className="studio-showcase-glow" aria-hidden="true" />

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center relative z-10">
        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-eyebrow">
            <Sparkles className="w-4 h-4" /> Solar Design Studio
          </div>
          <h2 className="section-heading">
            See solar on <span className="gradient-text">your actual roof</span> —
            before you spend a rupee
          </h2>
          <p className="section-subtitle">
            Most solar quotes are guesswork. Ours starts with your real roof:
            design your system yourself in about 3 minutes and get engineering-grade
            numbers, not sales estimates.
          </p>

          <ul className="studio-feature-list">
            {FEATURES.map((f, i) => (
              <motion.li
                key={f.title}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.45 }}
              >
                <span className="studio-feature-icon"><f.icon className="w-4.5 h-4.5" /></span>
                <div>
                  <div className="font-semibold text-dark">{f.title}</div>
                  <div className="text-sm text-gray-500">{f.sub}</div>
                </div>
              </motion.li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-4 mt-8">
            <Link href="/solar-design" className="btn-hero-primary">
              <Sparkles className="w-5 h-5" /> Launch the Design Studio
              <ArrowRight className="w-4 h-4" />
            </Link>
            <span className="text-sm text-gray-500">Free · No signup · ~3 minutes</span>
          </div>
        </motion.div>

        {/* Animated studio mock */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="studio-mock"
          aria-hidden="true"
        >
          <div className="studio-mock-bar">
            <span /><span /><span />
            <em>Solar Design Studio</em>
          </div>

          <div className="studio-mock-canvas">
            <svg viewBox="0 0 400 300" className="w-full h-full">
              {/* satellite-ish ground */}
              <defs>
                <linearGradient id="sm-ground" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#1d2b23" />
                  <stop offset="55%" stopColor="#24332a" />
                  <stop offset="100%" stopColor="#1a2620" />
                </linearGradient>
              </defs>
              <rect width="400" height="300" fill="url(#sm-ground)" />
              <g opacity="0.16" stroke="#9db8a8" strokeWidth="1">
                <path d="M0 250 L400 235" /><path d="M0 60 L400 45" />
                <path d="M330 0 L345 300" />
              </g>

              {/* roof outline draws itself */}
              <motion.path
                d="M88 78 L322 66 L334 238 L100 252 Z"
                fill="rgba(34,197,94,0.13)"
                stroke="#4ade80"
                strokeWidth="2.5"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, ease: "easeInOut" }}
              />

              {/* vertex handles */}
              {[[88, 78], [322, 66], [334, 238], [100, 252]].map(([x, y], i) => (
                <motion.circle
                  key={i}
                  cx={x} cy={y} r="4.5"
                  fill="#fff" stroke="#16a34a" strokeWidth="2"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.25 + i * 0.22 }}
                />
              ))}

              {/* panels pop in */}
              {PANELS.map((p, i) => (
                <motion.rect
                  key={i}
                  x={p.x} y={p.y} width="44" height="32" rx="2.5"
                  fill="#0ea5e9" stroke="#082f49" strokeWidth="1.4"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 0.92, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: p.delay, duration: 0.3, type: "spring", stiffness: 240 }}
                  style={{ transformOrigin: `${p.x + 22}px ${p.y + 16}px` }}
                />
              ))}

              {/* measurement label */}
              <motion.text
                x="205" y="160" textAnchor="middle"
                fill="#fbbf24" fontSize="15" fontWeight="700"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.9 }}
              >
                142 m²
              </motion.text>
            </svg>

            {/* Floating KPI chips */}
            {[
              { label: "6.6 kW system", top: "12%", right: "-7%", delay: 1.7 },
              { label: "₹58,400 saved / yr", top: "45%", right: "-10%", delay: 1.9 },
              { label: "Payback 3.8 yrs", top: "78%", right: "-6%", delay: 2.1 },
            ].map((chip) => (
              <motion.div
                key={chip.label}
                className="studio-mock-chip"
                style={{ top: chip.top, right: chip.right }}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: chip.delay, duration: 0.45 }}
              >
                {chip.label}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
