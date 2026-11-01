import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset paths so the build also works from the GitHub Pages sub-path (/adventure-lev/)
  base: './',
  server: {
    port: 3000,
    open: true
  },
  build: {
    target: 'esnext'
  }
});
