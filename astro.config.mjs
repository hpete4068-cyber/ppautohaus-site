import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Static output; deploy dist/ to Cloudflare Pages (build: npm run build, output: dist).
export default defineConfig({
  site: 'https://ppautohaus.com.au',
  output: 'static',
  integrations: [sitemap()],
});
