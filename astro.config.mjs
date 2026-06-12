import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { monoTheme } from './src/config/shikiTheme.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://usmp.metaloom.in',
  base: '/',
  markdown: {
    shikiConfig: {
      theme: monoTheme,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});

