import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://catinder.vercel.app";
  const now = new Date();
  return [
    { url: base,                    lastModified: now, changeFrequency: "daily",   priority: 1   },
    { url: `${base}/about`,         lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/articles`,      lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${base}/events`,        lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${base}/community`,     lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${base}/knowledge`,     lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${base}/faq`,           lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`,       lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/pricing`,       lastModified: now, changeFrequency: "monthly", priority: 0.9 },
  ];
}
