const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://evenergy.co.in/" || "https://solar-website-plum.vercel.app";

export default function sitemap() {
  const routes = [
    { path: "", priority: 1.0, changeFrequency: "weekly" },
    { path: "/solar-design", priority: 0.9, changeFrequency: "monthly" },
    { path: "/calculator", priority: 0.9, changeFrequency: "monthly" },
    { path: "/solutions", priority: 0.8, changeFrequency: "monthly" },
    { path: "/products", priority: 0.8, changeFrequency: "monthly" },
    { path: "/projects", priority: 0.7, changeFrequency: "weekly" },
    { path: "/blog", priority: 0.7, changeFrequency: "weekly" },
    { path: "/about", priority: 0.6, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.8, changeFrequency: "yearly" },
    { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
  ];

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
