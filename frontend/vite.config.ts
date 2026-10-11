import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Standard, portable Vite config.
// `base: './'` makes the built bundle work from any path — including
// GitHub Pages project subpaths (/repo/) as well as root deploys on
// Vercel / Netlify / Cloudflare Pages — with no code changes.
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    // Allow the app to be served through any preview host during development.
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  },
});
