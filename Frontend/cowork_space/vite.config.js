import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  build: {
    cssCodeSplit: false,
    chunkSizeWarningLimit: 2000,

    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});