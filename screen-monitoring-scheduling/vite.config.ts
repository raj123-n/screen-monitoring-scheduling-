import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: process.env.VITE_DEV_SERVER_HOST || "::",
    port: parseInt(process.env.VITE_DEV_SERVER_PORT || "8080"),
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      }
    }
  },
  
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    nodePolyfills({
      exclude: [],
      protocolImports: true,
    }),

  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./src"),
    },
  },
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 1500
  },
}));
