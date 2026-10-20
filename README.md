# Atriveo Site

The public hub for everything Atishay Kasliwal is building.

Atria is listed as **Early access** on the homepage, in the Health project
directory, and at `/projects/atria/`, with its owner-confirmed Best Use of Tiger
Data win, links to the waitlist and synthetic demo, and real landing screenshots.
Its source is included in the public repository sync. The waitlist link points to the live public domain,
`https://atria.atriveo.com`. Atria runs in the Atriveo domain’s Cloudflare account
with a fresh waitlist, as requested by the owner.

The shared palette uses dark slate text, stronger secondary labels, and deeper
blue controls on intentional light surfaces. Project initials use darker accent
fills so their white lettering stays readable. Browser checks covered the hub,
directory, Atria detail, and open-source pages at 1440px and 390px under light
and dark system preferences. Automated contrast checks reported no violations;
gradient surfaces were also reviewed visually because automated checks mark
some of those text/background pairs as incomplete.

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
