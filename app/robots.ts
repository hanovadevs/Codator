import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://codator.org"; // Replace with your production domain name if needed

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/portal/", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
