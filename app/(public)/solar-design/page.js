"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";

// Mapbox GL must be loaded client-side only (no SSR)
const SolarDesignPage = dynamic(
  () => import("@/components/solar-design/SolarDesignPage"),
  { ssr: false }
);

export default function SolarDesignRoute() {
  return (
    <>
      <Navbar />
      <SolarDesignPage />
      <Footer />
    </>
  );
}
