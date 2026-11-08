import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    // The Exa search runs in a server-only process (see server.mjs); the browser
    // only ever talks to this same-origin /api path.
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
});
