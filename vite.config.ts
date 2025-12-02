import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { metaImagesPlugin } from "./vite-plugin-meta-images";

// Use process.cwd() which is more reliable in Docker builds
// The config file is at the project root, so cwd should be /app
const projectRoot = process.cwd();
const clientRoot = path.resolve(projectRoot, "client");
const distRoot = path.resolve(projectRoot, "dist", "public");

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    metaImagesPlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(clientRoot, "src"),
      "@shared": path.resolve(projectRoot, "shared"),
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  root: clientRoot,
  build: {
    outDir: distRoot,
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
