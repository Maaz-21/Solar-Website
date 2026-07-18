import "./globals.css";
import Script from "next/script";
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
        {/* GTM on lazyOnload: analytics loads after the page is fully
            interactive instead of competing with hydration (GTM + GA were
            ~287 KB of startup JS in the Lighthouse trace). Events pushed to
            dataLayer before it loads are queued and flushed by GTM itself. */}
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <Script id="gtm-loader" strategy="lazyOnload">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');`}
          </Script>
        )}
      </body>
    </html>
  );
}
