/**
 * Single source of truth for the business's NAP (name / address / phone),
 * public profiles, geo, and opening hours.
 *
 * Consumed by the JSON-LD in app/layout.js, the <TrustBadges> component, the
 * Contact page, and the Footer. Keeping every surface fed from one object
 * means the NAP stays byte-for-byte consistent across the site — which is
 * itself a local-SEO ranking signal (Google cross-checks NAP consistency).
 */

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://evenergy.co.in/" || "https://solar-website-plum.vercel.app";

export const BUSINESS = {
  name: "SolarOwl Energy Solutions Pvt. Ltd.",
  legalName: "SolarOwl Energy Solutions Private Limited",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  image: `${SITE_URL}/installation-2.webp`,
  description:
    "End-to-end rooftop solar installation for homes and businesses across India, with PM Surya Ghar government subsidy support.",

  // E.164 for tel: links and schema; *Display for on-screen text.
  phone: "+919422980148",
  phoneDisplay: "+91 94229 80148",
  phoneAlt: "+917020660967",
  phoneAltDisplay: "+91 70206 60967",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919422980148",
  email: "solarowlcare@gmail.com",
  priceRange: "₹₹",

  address: {
    street:
      "Kalsekar Incubation Center, AIKTC Campus, Plot 2 & 3, Sector 16, Khandagaon, New Panvel",
    locality: "Panvel",
    region: "Maharashtra",
    postalCode: "410206",
    country: "IN",
    full:
      "Kalsekar Incubation Center, Anjuman-I-Islam's Kalsekar Technical Campus, Plot 2 & 3, Sector 16, Khandagaon, Near Thana Naka, New Panvel, Panvel, Maharashtra, India - 410206",
  },

  // Coordinates taken from the office pin in the Contact-page map embed.
  geo: { lat: 19.0002258, lng: 73.1046218 },

  // Visual badge only — NOT emitted as schema aggregateRating (Google
  // penalises self-reported ratings that aren't backed by on-page reviews).
  rating: { value: "5.0" },

  areasServed: ["Panvel", "Navi Mumbai", "Mumbai", "Raigad", "Pune", "Maharashtra", "India"],

  // Fill the empty ones in when the profiles exist — they auto-flow into the
  // schema `sameAs` array below (and are safe to leave blank until then).
  profiles: {
    google: "https://share.google/8DkMc0M4AmGNsniVS",
    justdial: "https://jsdl.in/DT-431TZRI3PD1",
    linkedin: "",
    facebook: "",
    instagram: "",
    youtube: "",
    twitter: "",
  },
};

/** Google Maps "get directions" deep link to the office. */
export const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${BUSINESS.geo.lat},${BUSINESS.geo.lng}`;

/** Only profiles that actually have a URL — used for schema `sameAs`. */
export const sameAs = Object.values(BUSINESS.profiles).filter(Boolean);
