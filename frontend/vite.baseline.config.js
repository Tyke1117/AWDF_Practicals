import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Baseline build configuration: Monolithic single-bundle setup (before code splitting)
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-baseline',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      input: 'index.baseline.html',
      output: {
        // Enforce a single monolithic JS bundle for the baseline comparison
        manualChunks: () => 'main.bundle',
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js'
      }
    }
  },
  server: {
    port: 5173
  }
});
