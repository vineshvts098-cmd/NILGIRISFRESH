import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/', // Netlify deploys to root by default
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    outDir: 'dist', // Netlify expects build output in 'dist'
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
