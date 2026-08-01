import { defineConfig } from 'vite';

// Exclude maplibre-gl from the dependency optimizer to avoid
// missing worker files like maplibre-gl-worker.mjs during dev.
export default defineConfig({
  optimizeDeps: {
    exclude: ['maplibre-gl']
  }
});
