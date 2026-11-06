import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        // Keep three.js core in its own chunk so it stays cached across app deployments
        manualChunks: (id) => (id.includes('node_modules/three/build/') ? 'three' : undefined),
      },
    },
  },
});
