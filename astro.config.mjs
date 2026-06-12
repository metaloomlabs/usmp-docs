import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { monoTheme } from './src/config/shikiTheme.mjs';
import { unified } from '@astrojs/markdown-remark';

// Custom rehype plugin to auto-prefix absolute links inside markdown files
function rehypeBasePrefix() {
  const base = '/usmp-docs';
  return (tree) => {
    function visit(node) {
      if (node.type === 'element') {
        if (node.tagName === 'a' && node.properties && typeof node.properties.href === 'string') {
          const href = node.properties.href;
          if (href.startsWith('/') && !href.startsWith('//') && !href.startsWith(base)) {
            node.properties.href = base + href;
          }
        }
        if (node.tagName === 'img' && node.properties && typeof node.properties.src === 'string') {
          const src = node.properties.src;
          if (src.startsWith('/') && !src.startsWith('//') && !src.startsWith(base)) {
            node.properties.src = base + src;
          }
        }
      }
      if (node.children) {
        node.children.forEach(visit);
      }
    }
    visit(tree);
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://metaloomlabs.github.io',
  base: '/usmp-docs',
  markdown: {
    shikiConfig: {
      theme: monoTheme,
    },
    processor: unified({
      rehypePlugins: [rehypeBasePrefix],
    }),
  },
  vite: {
    plugins: [tailwindcss()],
  },
});

