import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://codator.org"; // Replace with your production domain name if needed

  // Static routes
  const staticRoutes = [
    "",
    "/about",
    "/events",
    "/gallery",
    "/team",
    "/contact",
    "/join",
    "/login",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Phylum dynamic paths
  const phylumSlugs = [
    "tech-and-development",
    "tech-and-devolpment",
    "media-phylum",
  ];
  
  const phylumRoutes = phylumSlugs.map((slug) => ({
    url: `${baseUrl}/phylum/${slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...phylumRoutes];
}
