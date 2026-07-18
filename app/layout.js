import "./globals.css";
import { GoogleTagManager } from "@next/third-parties/google";
import Toaster from "@/components/Toaster";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://solar-website-plum.vercel.app";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SolarOwl — Rooftop Solar Installation & Design in India",
    template: "%s | SolarOwl",
  },
  description:
    "SolarOwl Energy Solutions installs rooftop solar for homes and businesses across India. Design your own system in 3D, calculate savings, and claim PM Surya Ghar subsidy — end-to-end installation with zero middlemen.",
  keywords: [
    "solar installation India", "rooftop solar", "solar panels Maharashtra",
    "PM Surya Ghar subsidy", "solar design online", "solar savings calculator",
    "residential solar", "commercial solar", "SolarOwl",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "SolarOwl Energy Solutions",
    title: "SolarOwl — Rooftop Solar Installation & Design in India",
    description:
      "Design your rooftop solar system in 3D, see your savings instantly, and get it installed end-to-end. Government subsidy support included.",
    images: [{ url: "/installation-2.webp", width: 1200, height: 630, alt: "SolarOwl rooftop solar installation" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SolarOwl — Rooftop Solar Installation & Design in India",
    description: "Design your rooftop solar system in 3D and see your savings instantly.",
    images: ["/installation-2.webp"],
  },
  robots: { index: true, follow: true },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "SolarOwl Energy Solutions Pvt. Ltd.",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  image: `${SITE_URL}/installation-2.webp`,
  description:
    "End-to-end rooftop solar installation for homes and businesses across India with government subsidy support.",
  telephone: "+91 94229 80148",
  email: "solarowlcare@gmail.com",
  address: {
    "@type": "PostalAddress",
    streetAddress:
      "Kalsekar Incubation Center, AIKTC Campus, Plot 2 & 3, Sector 16, Khandagaon, New Panvel",
    addressLocality: "Panvel",
    addressRegion: "Maharashtra",
    postalCode: "410206",
    addressCountry: "IN",
  },
  areaServed: "India",
  priceRange: "₹₹",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        {/* Load GTM */}
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
        )}
      </body>
    </html>
  );
}
