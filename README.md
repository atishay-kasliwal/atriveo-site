# Atriveo Site

The public home of the Atriveo product ecosystem.

## Commands

```bash
npm install
npm run dev
npm run check
npm run audit:seo
npm run build
npm run deploy
```

The project catalog is curated in `src/data/projects.ts`. `npm run sync:github` enriches the site with public repository metadata and public GitHub activity; it never requests or publishes private repository data.

SEO metadata and structured data are generated with [`@power-seo/meta`](https://github.com/CyberCraftBD/power-seo) and [`@power-seo/schema`](https://github.com/CyberCraftBD/power-seo). Every production build runs a technical SEO gate with `@power-seo/audit` across all indexable pages.

The Cloudflare Worker serves the static Astro build on `atriveo.com` and preserves legacy tracker routes by redirecting them to `tracker.atriveo.com`. `www.atriveo.com` remains on the tracker during the extension compatibility window.
