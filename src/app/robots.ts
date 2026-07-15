import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/discover",
        "/cats",
        "/chat",
        "/health",
        "/breeding",
        "/settings",
        "/admin",
      ],
    },
    sitemap: "https://catinder.vercel.app/sitemap.xml",
  };
}
