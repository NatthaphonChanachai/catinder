import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Trim unused exports from heavy libraries -> smaller per-route JS
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "lucide-react",
      "firebase",
      "@firebase/app",
      "@firebase/auth",
      "@firebase/firestore",
    ],
  },
  poweredByHeader: false,
  compress: true,
  images: {
    // Serve modern formats for optimized (static) images
    formats: ["image/avif", "image/webp"],
    qualities: [75, 80, 85, 90, 100],
    minimumCacheTTL: 60 * 60 * 24 * 30, // cache optimized images 30 days
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "cataas.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default withNextIntl(nextConfig);
