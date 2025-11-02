import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  server: {
    port: 4321
  },
  integrations: [mdx()],
  output: 'static'
});
