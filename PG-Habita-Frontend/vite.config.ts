import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/",
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Configuración específica para evitar el error de Rollup
  optimizeDeps: {
    exclude: ['@rollup/rollup-linux-x64-gnu']
  },
  define: {
    global: 'globalThis'
  },
  build: {
    outDir: 'dist',
    sourcemap: mode === 'development',
  },
  preview: {
    port: parseInt(process.env.PORT) || 3000,
    host: "0.0.0.0",
  }
}));