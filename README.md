# Atriveo Site

The public home of the Atriveo product ecosystem.

## Commands

```bash
npm install
npm run dev
npm run check
npm run build
npm run deploy
```

The project catalog is curated in `src/data/projects.ts`. `npm run sync:github` enriches the site with public repository metadata and public GitHub activity; it never requests or publishes private repository data.

The Cloudflare Worker serves the static Astro build on `atriveo.com` and preserves legacy tracker routes by redirecting them to `tracker.atriveo.com`. `www.atriveo.com` remains on the tracker during the extension compatibility window.
