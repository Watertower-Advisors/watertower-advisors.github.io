import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://watertoweradvisors.com',
  build: {
    format: 'file',
  },
  integrations: [sitemap({
    serialize(item) {
      if (!item.url.endsWith('/') && !item.url.endsWith('.html')) item.url += '.html';
      return item;
    },
  })],
});
