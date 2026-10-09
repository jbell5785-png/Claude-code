import { defineConfig } from 'vite';

// Front-end build config.
//  - `npm run build`        → dist/ (relocatable, `base: './'`, lazy chunks for optional modules)
//  - `npm run build:single` → dist-single/index.html, one self-contained offline file (fonts, JS, CSS inlined)
export default defineConfig(async ({ mode }) => {
  const single = mode === 'single';
  const plugins = [];
  if (single) {
    const { viteSingleFile } = await import('vite-plugin-singlefile');
    plugins.push(viteSingleFile({ removeViteModuleLoader: true }));
  }
  return {
    base: './',
    plugins,
    server: { host: true },
    preview: { host: true, port: 4173 },
    worker: { format: 'es' },
    build: {
      target: 'es2022',
      outDir: single ? 'dist-single' : 'dist',
      chunkSizeWarningLimit: 2500,
      sourcemap: false,
      assetsInlineLimit: single ? 100000000 : 4096,
    },
  };
});
