import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow the placeholder images used in seed data. Add your real CDN here later.
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  // Allow loading dev resources when opening the app via the LAN IP (not just localhost).
  allowedDevOrigins: ["192.168.18.47"],
  experimental: {
    serverActions: {
      // Default 1MB is too small for banner image uploads.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
