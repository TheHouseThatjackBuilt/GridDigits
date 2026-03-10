import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const srcPath = decodeURIComponent(new URL("./src", import.meta.url).pathname).replace(
  /^\/([A-Za-z]:)/,
  "$1",
);

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/GridDigits/" : "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": srcPath,
    },
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    hmr: {
      host: "127.0.0.1",
    },
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
}));