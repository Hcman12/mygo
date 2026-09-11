import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  security: {
    checkOrigin: false,
  },
  adapter: vercel(),
  integrations: [tailwind({
    applyBaseStyles: false,
  })],
  site: 'https://mygotravel.eu',
});
