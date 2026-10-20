# Atriveo Site

The public hub for everything Atishay Kasliwal is building.

## Commands

```bash
npm install
npm run dev
npm run check
npm run audit:seo
npm run build
npm run deploy
```

The project catalog is curated in `src/data/projects.ts`. A project's optional `media` holds real screenshots, a short screen recording and a 1200×630 link-preview crop, stored under `public/projects/<slug>/`; projects without media keep the monogram artwork. `npm run sync:github` enriches the site with public repository metadata and public GitHub activity; it never requests or publishes private repository data.

SEO metadata and structured data are generated with [`@power-seo/meta`](https://github.com/CyberCraftBD/power-seo) and [`@power-seo/schema`](https://github.com/CyberCraftBD/power-seo). Every production build runs a technical SEO gate with `@power-seo/audit` across all indexable pages.

The Cloudflare Worker serves the static Astro build on `atriveo.com`, redirects `www.atriveo.com` to the canonical apex, and preserves legacy tracker routes by forwarding them to the separate `tracker.atriveo.com` product.

`npm run build` fails when a page loses its metadata, an image loses its alt text or dimensions, a media file is missing, a project page is not linked from the homepage and `/projects/`, or the sitemap drifts from the indexable pages. Pull requests also run Lighthouse CI (`.lighthouserc.json`).

## Medscan landing page

`medscan/` is a separate static Astro site on `medscan.atriveo.com`, deployed as the
`atriveo-medscan` Cloudflare Worker. The main hub catalog links to it through the
Medscan entry in `src/data/projects.ts`. The existing hosted patient app remains separate.

```bash
npm run check:medscan
npm run build:medscan
npm run deploy:medscan
```

The landing page uses the supplied Medscan mark, self-hosted Inter, GSAP and Lenis.
Content is in `medscan/src/pages/` and shared public links in `medscan/src/data/site.ts`.
It contains no identity settings, patient records or client credentials. Source repository
links are omitted because the Medscan application repository is private.
