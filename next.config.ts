import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  typedRoutes: false,
  turbopack: {
    resolveAlias: {
      "@": path.resolve(__dirname),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
};

export default nextConfig;
