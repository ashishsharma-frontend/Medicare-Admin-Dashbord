import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    
    // VitePWA({
    //   manifest: {
    //    "name": "Medicare - Admin",
    // "short_name": "Medicare",
    // "description": "A fast and modern Vite React app.",
    // "start_url": "/admin",
    // "display": "standalone",
    // "background_color": "#ffffff",
    // "theme_color": "#317EFB",
    // "orientation": "portrait",
    // "icons": [
    //   {
    //     "src": "/admin/192x192.png",
    //     "sizes": "192x192",
    //     "type": "image/png"
    //   },
    //   {
    //     "src": "/admin/512.png",
    //     "sizes": "512x512",
    //     "type": "image/png"
    //   },
    //   {
    //     "src": "/admin/512x512.png",
    //     "sizes": "512x512",
    //     "type": "image/png",
    //     "purpose": "maskable"
    //   }
    // ]
    //   },
    //   registerType: "autoUpdate",
    //   includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
    // }),
  ],
  define: {
    'process.env': process.env, // Ensure this is included
  },
  base: "/admin/",
  resolve: {
    alias: {
      // eslint-disable-next-line no-undef
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000, // Increase limit to 1MB (default is 500KB)
  },
});
