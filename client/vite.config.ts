import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({ fastRefresh: true })],
  envDir: "../",
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          framer: ["framer-motion"],
          lottie: ["lottie-react"],
          lucide: ["lucide-react"],
        },
      },
    },
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false,
  },
  optimizeDeps: {
    include: ["framer-motion", "react", "react-dom", "react-router-dom"],
  },
});
