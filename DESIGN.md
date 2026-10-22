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

## Living-building integration (October 21, 2026)
This addendum supersedes only the earlier hero and homepage header concepts. Preserve the existing project catalog, project content, inner pages and unrelated local changes. Existing Astro + Worker + GSAP stack; Three.js is justified by the supplied real 3D building. No deployment.

Three territories evaluated:
- **One shared evening (architecture/material):** the supplied eighty-home building becomes Atriveo's full-width public home. Screenshot: HTML wordmark and project invitation occupy twelve deliberately vacated cells. Anchor: the real Phase 6/7 building and existing “under one roof” product-hub copy. Signature: shared committed lighting changes, entered through a short exposure reveal. Emotion: curiosity and quiet human presence. Originality 5, fit 5, feasibility 4, portability 1. Selected.
- **Builder's working ledger (process):** release history drives a dated editorial opening. Anchor: existing shipping log. Signature: expand a release into its project. Emotion: tangible progress. O/F/Fe/P 4/4/4/3. Not selected: displaces the supplied building.
- **Project address directory (formal):** named builds form an architectural index. Anchor: fourteen real projects. Signature: navigation as a directory. Emotion: clarity. O/F/Fe/P 3/4/5/3. Not selected: risks turning permanent households into project cards and confusing their meaning.

Concept card: a public home for many useful builds, with a shared world rather than a visitor-specific show. Metaphor: one inhabited building. Motion verb: **illuminate and settle**. Screenshot: full-width facade, reserved-grid real HTML, a quiet edge-to-edge header. No Motrix artwork, type pairing, floating capsule navigation or screenshot-card composition.

Hero palette comes from the supplied architecture: ground #111715, ink #ece8db, muted #b6c0af, line #29312a, existing-brand accent #a5b9ff, action #e4e9d7. Existing sans family stays; no new font download. Navigation 12px, wordmark 21px in the header and 38–78px in the facade; mobile hero 52–72px. Ten columns × eight rows govern desktop alignment; columns 1–3/top rows 2–3 and columns 8–10/top rows 7–8 carry HTML. Mobile reads [brand] [intentional fifteen-home crop] [statement + CTA]. Full-width small 60px dark header, wordmark left and unboxed links right; no center nav capsule. Inner-page headers unchanged.

Page composition: [minimal full-width header] [building with brand upper left and invitation lower right] [existing areas strip] [existing selected-project grid] [existing filtered complete index] [existing shipping log] [existing principles] [existing closing/footer]. Only the first two compositions are redesigned in this task.

Motion: one 1.35-second entrance exposure reveal and a short 6–8px settling of HTML, driven by GSAP. The real building follows only the authority's clock. No fake lights, new random seeds or independent visitor decisions. At rest there can be quiet periods: inventing motion to satisfy an idle-animation check would violate the shared world. Rendering sleeps when no committed transition is active. No loader or scroll hijacking. Under reduced motion, use the matching poster, fully visible HTML and no WebGL/intro. Pause freezes the current presentation and ends the intro. Hidden/offscreen and navigation lifecycles stop work.

Genericness correction: remove centered navigation pills and separate decorative hero cards. Remove one accessory: the old boxed hero statistics. Keep one signature, the supplied building; the rest of the page remains a readable project hub.

## Full evening theme (October 22, 2026)
The current brief extends the approved nighttime building to the whole public hub. It supersedes earlier limits to homepage-only changes. Preserve the building, its shared state, real catalog, media, external links and existing metadata. Existing Astro + CSS + GSAP is retained; no dependencies or hosted deployments needed.

Three directions: (1) **Inside the building**, warm interior light becomes the discovery system: inhabited facade → selected builds → complete directory → invitation. Architecture territory; O/F/Fe/P 4/5/5/1. (2) **An evening work journal**, latest public commits lead every page. Process territory; 4/3/5/2. (3) **Atriveo addresses**, every project becomes a numbered door. Formal territory; 3/4/5/3. Choose Inside the building: it carries the actual homepage into the catalog without implying that the eighty simulated households correspond to projects.

Idea: Useful software shares a home, with the lights left on for other builders.
Metaphor: Walking from a nighttime facade into a quiet shared workspace.
Signature: Existing living building, followed by projects illuminating on focus/hover.
Emotion: Quiet curiosity and invitation.
Motion verb: Illuminate and settle. Existing GSAP building clock remains independent of navigational feedback.
Screenshot: The dark facade gives way to large cream type and warm, framed real product images.

System: ground #0b0f12, surface #13191d, ink #f1f0e8, secondary #b4b8b7, accent #d8b58a, line #30383c. Retain existing local system sans stack, avoiding downloads; display 44–104px, tracking -.065em, leading 1; body 16–18px, leading 1.6; UI 12–14px. 1240px max width, 48px desktop and 22px phone gutters. Project frames 4px radius, no capsule navigation. Amber is borrowed from the room lights, used in tiny window marks and interactions, not a full-field wash.

Home compositions:
[existing full-width facade]
[small page label | large statement] [short introduction + real catalog counts]
[two real project images, staggered on desktop, stacked on phone]
[complete category/search directory, rows with names, descriptions and state]
[large invitation | source/about links]
[large footer wordmark + useful navigation]

Project index: editorial heading + catalog filters/search + two-column actual project media. Case studies: breadcrumb + name/copy/actions paired with real hero media; screenshots and highlights; dark facts panel; next-build link. About: large human introduction, existing thesis and four principles. Open source: source-first intro, real metrics, repository index and public activity. Legal pages: quiet reading widths. 404: an unlit window and a direct route back.

Genericness correction: no colorful monogram orbit art, white hover panels, floating navigation capsule, indiscriminate fades or stock imagery. Existing real media provides color; the architecture remains the one visual signature. Inner pages are intentionally still at rest, with clear feedback and readable content. All content is visible before JS and under reduced motion. No placeholder claims or projects are added.

### Evening theme QA (October 22, 2026)
- Production build served through `wrangler dev`, crawled at 1440px, 390px (4x CPU, slow 4G) and reduced motion: home, projects, Cortex case study, About, Open source, Privacy, Terms, 404. Zero console errors, failed requests, overflow, small tap targets, hidden reduced-motion text or axe violations. Mobile LCP 0.48–1.1s, CLS 0.
- Fixes this pass: compact phone directory rows (status beside the name, about 110px per row instead of 195px); hide the stars metric when it is zero; sentence-case labels on cards without screenshots; wordmark period lights amber on hover/focus with a 44px target; back-link arrow travels on hover; visible focus on case-study video; descriptive poster alt for the SEO audit (the visual stays `aria-hidden`).
- Intentional: the current-page nav link and the selected "All" filter do not change on hover because they already show the active state.
- Known: scroll FPS on the homepage drops only while the WebGL building is on screen in headless software rendering. Below the facade the page holds 60fps on a throttled phone, and the building stops rendering offscreen. Worth a real-device check before release.
