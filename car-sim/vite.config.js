import { defineConfig } from 'vite';

// Front-end build config. `base: './'` keeps the built app relocatable (file server / GitHub pages).
export default defineConfig({
  base: './',
  server: { host: true },
  preview: { host: true, port: 4173 },
  build: { target: 'es2022', chunkSizeWarningLimit: 2500, sourcemap: false },
});
