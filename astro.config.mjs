import { defineConfig } from 'astro/config';

// The public address of the site, used for canonical links and share images.
// Set SITE_URL in the hosting settings once the real domain is known.
const site = process.env.SITE_URL ?? 'https://niyara.example';

export default defineConfig({
  site,
  compressHTML: true,
});
