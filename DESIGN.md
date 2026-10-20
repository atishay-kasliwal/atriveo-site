# Atriveo hub refresh

## Scope and evidence
The live atriveo.com is a public hub for 14 projects across Career, Intelligence, Health, Research and Creative. The source of truth is src/data/projects.ts in atishay-kasliwal/atriveo-site. Tracker is a separate repository and is not the umbrella product. The earlier Tracker edits were fully reverted.

Keep the existing Atriveo blue #2e6afd, actual names, descriptions, statuses, URLs, catalog, project details and media. Astro remains the stack. No invented testimonials, product claims or numbers. No deployment in scope.

## Concepts
- Living project shelf: a blue opening board exposes six different projects, real product imagery in selected work, and a filterable complete index. Originality 4, fit 5, feasibility 5, portability 2. Selected: shows the actual breadth immediately.
- Orbit map: retain the existing central hub and orbit nodes, refine connections. 3/4/5/4. Rejected: abstracts away what projects do.
- Release journal: timeline-first view. 4/3/4/3. Rejected: discovery matters more than repository chronology.

## Concept card
Idea: Many useful builds, one Atriveo home.
Metaphor: A shelf of distinct working projects with a common maker.
Signature: A saturated Atriveo-blue project board pairs with a complete, category-filterable index.
Emotion: Curiosity, clarity, momentum.
Motion verb: Lift and open. Arrow travel, short lifts and a restrained GSAP introduction; no motion under reduced motion.
Screenshot: Large existing headline left, six named project tiles on a blue field right.

## Art direction
Canvas #f8faff, paper #fff, ink #0d1424, muted #58677d, line #dbe1ea, accent #2e6afd. Existing project colors remain secondary identifiers. Existing Inter/system typography stays; no external font requests. Headline 48–88px, -0.065em, leading 1.0. Body 16–18px. UI 12–14px. Desktop 12-column alignment within 1240px, mobile 20px gutters. Controls 8px radius, panels 16px. Ease power2.out, 180ms controls and 600ms entrance. Still at rest intentionally: project content should stay readable.

Hero: [6 columns headline, copy, actual counts] [6 columns blue 2×3 project board]
Selected work: [heading + index link] [2×2 real project media cards]
Complete catalog: [heading + actual counts] [category controls] [2-column list of all 14 projects]
Activity: [introduction] [live public event rows]
Principles: [statement] [three principles]
Closing: [blue statement + project index link]
Footer: [wordmark and real navigation]

Genericness correction: replace repeated monogram orbit art with existing real product screenshots where available; replace the automatic carousel with a readable selected-work grid and explicit category filtering. Preserve distinct project identities under Atriveo blue.

## Verification
- `npm run check`: 0 errors, warnings or hints across 24 Astro files.
- `npm run build`: passes; existing technical metadata gate 100/100 across all 20 indexable pages. No runtime dependencies added.
- Production browser pass: home, project index, Cortex detail, About, Open source and 404 at 1440px desktop, 390px mobile and reduced motion. Zero axe WCAG A/AA violations, document overflow or page exceptions in all 18 combinations.
- Interactions verified: home Health filter shows 2 projects; All restores 14; directory category + Medscan search shows one result; unmatched search shows the existing empty state.
- Real project images verified after scrolling to trigger their native lazy loading. No generated images or placeholder screenshots.
- Independent final visual critic: design 8.2, usability 8.1, creativity 7.5, content 8.0; weighted overall 8.0/10. Remaining tradeoff: long complete directory on mobile. Fixed the repeated shipping-log grammar after review.
- No deployments, account changes, private data or modifications to product repositories. Original Tracker source restored clean.

Local production preview: http://127.0.0.1:4411/
Run this checkout with `npm install`, `npm run build`, `npm run preview`. Deployment stays on the existing repository workflow and has not been performed.
