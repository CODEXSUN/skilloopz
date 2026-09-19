import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "next/link": path.resolve(__dirname, "src/vite/compat/link.tsx"),
      "next/image": path.resolve(__dirname, "src/vite/compat/image.tsx"),
      "next/navigation": path.resolve(__dirname, "src/vite/compat/navigation.ts"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3002",
    },
  },
});
