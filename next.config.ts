import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  turbopack: {
    resolveAlias: {
      "@": path.resolve(__dirname),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
};

export default nextConfig;
