"use client";

import dynamic from "next/dynamic";

// The Design Studio is a full-viewport app: no site navbar/footer/floats.
// Mapbox GL must be loaded client-side only (no SSR).
const SolarDesignPage = dynamic(
  () => import("@/components/solar-design/SolarDesignPage"),
  { ssr: false }
);

export default function SolarDesignRoute() {
  return <SolarDesignPage />;
}
