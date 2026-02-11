import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  envDir: "./",
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          framer: ["framer-motion"],
          lottie: ["lottie-react"],
          lucide: ["lucide-react"],
          router: ["react-router-dom"],
        },
      },
    },
    target: "esnext",
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false,
  },
  optimizeDeps: {
    include: [
      "framer-motion",
      "react",
      "react-dom",
      "react-router-dom",
      "lucide-react",
    ],
  },
});
