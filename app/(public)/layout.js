"use client";

import Chatbot from "@/components/Chatbot";
import WhatsappFloat from "@/components/WhatsappFloat";
import ParticleField from "@/components/ParticleField";
import { MotionConfig } from "framer-motion";

export default function PublicLayout({ children }) {
  return (
    // reducedMotion="user" makes every framer-motion animation on the site
    // respect the OS-level prefers-reduced-motion setting automatically.
    <MotionConfig reducedMotion="user">
      <ParticleField />
      {children}
      <WhatsappFloat />
      <Chatbot />
      {/* Mount target for the Google Translate widget — the script itself is
          only injected on first use (lib/googleTranslate.js via the Navbar). */}
      <div id="google_translate_container" className="hidden"></div>
    </MotionConfig>
  );
}
