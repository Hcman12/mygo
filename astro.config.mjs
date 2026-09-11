import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  security: {
    checkOrigin: false,
  },
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [tailwind({
    applyBaseStyles: false,
  })],
  site: 'https://mygotravel.eu',
});
