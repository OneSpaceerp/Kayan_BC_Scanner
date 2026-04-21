import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "icons/*",
        "traineddata/eng.traineddata",
        "traineddata/ara.traineddata",
      ],
      manifest: {
        name: "BC Scanner",
        short_name: "BC Scanner",
        description: "Business card capture for ERPNext",
        start_url: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#000000",
        theme_color: "#B10302",
        icons: [
          { src: "/icons/192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icons/maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        maximumFileSizeToCacheInBytes: 50 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /\/traineddata\/.*\.traineddata$/,
            handler: "CacheFirst",
            options: {
              cacheName: "tesseract-lang",
              expiration: { maxEntries: 4 },
            },
          },
          {
            urlPattern: ({ url }) =>
              url.pathname.includes("/api/resource/Campaign"),
            handler: "StaleWhileRevalidate",
            options: { cacheName: "erp-campaigns" },
          },
        ],
      },
    }),
  ],
});
