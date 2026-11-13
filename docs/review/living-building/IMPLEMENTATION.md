# Atriveo living-building integration

Local review implementation. Nothing deployed or provisioned.

## Preview and source

Preview: http://127.0.0.1:4455/ . This is the full Astro homepage served through the native local Cloudflare Worker, including `/building/state`.

The implementation was assembled and tested in `/tmp/atriveo-building-integration` from the existing dirty `/Users/atishaykasliwal/atriveo-site` checkout. Only integration files are copied back. Pre-existing project-card, project-index, open-source, layout, homepage, design notes and hub-refresh work is retained. The lower homepage content and category filtering remain intact. Existing inner-page header presentation is unchanged.

```sh
npm install
npx astro build
npm run dev:building
```

Use Astro's build directly for an offline/local review; the existing `npm run build` intentionally also refreshes GitHub data and runs the site's existing metadata gate. `npm run preview` serves static assets only and cannot supply the authority; it is useful for the deliberate poster fallback. `npm run dev:building` uses local Wrangler, not a remote deployment. Do not run the deploy script for this review.

## Components and presentation

- `src/components/LivingBuilding.astro`: reusable hero with scoped styles and optional tagline, statement and CTA-label props. Real HTML contains the heading, brand statement and `/projects/` link. No text or controls are baked into WebGL/textures/posters.
- `src/building/hero-client.mjs`: lifecycle, same-origin state source, deferred enhancement, GSAP entrance/ticker, sparse ambient light cues, visibility/intersection handling and cleanup.
- `src/building/presentation.mjs`: adapted Phase 7 shaders and merged geometry, without mini views, readback targets, inspection UI or room-detail controls.
- `src/building/presentation-layout.mjs`: presentation-only exclusions. Atlas indices remain tied to all eighty original manifest identities.
- `src/styles/living-building-home.css`: homepage-only full-width 60px header, wordmark left and plain navigation right. A layout prop enables it only on home. No centered navigation capsule.

Columns are counted from the left and rows from the top. Slots in the source manifest count floors from the bottom. The excluded IDs are:

`room_041`, `room_042`, `room_049`, `room_050`, `room_065`, `room_066`, `room_067`, `room_068`.

They are skipped before mesh traversal, generated panes and geometry merging. The brand reserve is now columns 1–2, rows 2–3; the statement reserve is columns 9–10, rows 7–8. The rebuilt static poster and renderer geometry contain the remaining 72 identities. Authority snapshots still contain all 80. The mobile presentation prepares a fifteen-room subset and crops the middle floors into a shorter 10:7 view; branding and the invitation sit outside the crop as readable HTML. The shorter crop brings the primary action into the first 390 × 844 viewport.

The desktop facade spans the viewport below the 60px header. Mid-size screens preserve a landscape facade. Real typography overlays sit in the normalized grid cells. The attribution caption and visible motion control were removed; reduced-motion behavior remains internal.

The 1.35-second entrance briefly lifts the facade's exposure and settles the wordmark/statement by 6–8px. A cosmetic, single-window light cue follows at irregular spatial locations about every 1.5 seconds; it does not modify shared household state or history. Enhancement starts after the entrance rather than competing with it. Primary links have visible focus and hover/press feedback.

Matching WebP posters render immediately with reserved dimensions. Desktop and mobile posters come from the same filtered geometry and original initial appearance, not from a different building. A static poster is intentionally illustrative, not a claim to show the current authoritative instant. Reduced motion uses the poster and HTML without downloading the renderer or creating WebGL. Read-only state can still synchronize. JavaScript, WebGL, state and asset failures leave navigation, branding and CTA usable.

## Authority and history

The Phase 7 manifest, authority algorithm, protocol, named object `atriveo-building-001`, class `LivingBuilding`, fifteen-second read-only polling and compatibility hash are retained. A test reconstructs the original Phase 7 hash while accounting for import-path relocation. It does not regenerate a world fingerprint or reseed the manifest.

`worker.ts` routes `/building/state` through the same security-header wrapper as static responses. Existing tracker, token, sitemap and www redirects remain unchanged. Both existing Wrangler configurations declare the class and binding. The browser imports only public state utilities and the compatibility value; private checkpoints, entropy, pending decisions and cooldowns stay server-side.

Existing prototype source and any runtime directories are untouched. The active preview uses isolated local development storage. It is not a copy or migration of a deployed world's checkpoint. **A named object string alone does not preserve history across different Cloudflare namespaces.** Before release, identify the canonical deployed Worker/namespace, if one exists. Reuse its binding or plan an explicit checkpoint/namespace migration. Never deploy a new empty authority over an existing world and call it continuity. A mismatched checkpoint must fail closed, not be deleted to make a test pass.

## Verification and evidence

- `npm run test:building`: ten tests, including inherited convergence, skewed clocks, replay gaps, long-downtime recovery, stale responses, duplicate alarms, zero-viewer logical advance, transactional rollback, HTTP read-only behavior, abort handling, plus exact exclusions and unchanged compatibility fingerprint.
- `npx astro check`: no errors or warnings; inherited unused-variable hints in copied simulation/tests are recorded in `astro-check.log`. The simulation is not edited just to remove a hint and change its fingerprint.
- `npx astro build`: succeeds. The build warns about the intentionally separate Three.js renderer chunk being over 500 kB uncompressed; the payload concern is not hidden.
- Both Wrangler configs bundle in local `--dry-run` mode. `building-verify-worker.mjs` checks old redirects, security headers and named-object routing against the bundled Worker.
- Native local workerd starts and serves the real Durable Object through `/building/state`; HTTP responses include 80 households, mutation requests return 405 and malformed cursors return 400.
- `building-review.mjs` runs the production homepage against that native endpoint, two independently clocked contexts, merged-geometry/glass inspection, keyboard CTA/pause, pause/resume, offscreen stopping, visibility-handler dispatch, navigation disposal/context loss, phone/tablet layouts, and five fallback cases. Full results: `validation.json`.
- `building-design-review.mjs` covers 390, 768, 1024, 1440 and 1920 widths, reduced motion, focus and hover frames, menu/Escape, axe WCAG A/AA and representative unchanged project/about/open-source/404 routes. Results: `design/report.json`. Native mobile devices are not represented by emulated viewports.
- The visibility test explicitly dispatches the event and overrides the test document's hidden flag. It is not proof of OS tab freezing, battery behavior or background-process scheduling.
- Independent evidence-only design critiques are recorded separately. The first pass found CTA placement and active-menu contrast problems, fixed in the second pass. Keeping lower-page content intact intentionally limits visual continuity beyond the hero.

Useful screenshots: `desktop.png`, `desktop-full.png`, `mobile.png`, `tablet.png`, `reduced-motion.png`, `no-js.png`, `no-webgl.png`, `state-outage.png`, `asset-failure.png`, plus focus/hover/menu frames in `design/`.

## Loading impact and release limits

`validation.json` records baseline and enhanced Resource Timing entries, FCP/LCP, layout shift, long tasks and the first authoritative render. Asset byte sizes and gzip estimates are included. These are local observations from a development machine using software WebGL, not field percentiles, CDN capacity figures or a claim of improved production LCP. The baseline and Worker use different local serving paths; compression and scheduling can differ. No-JavaScript cannot run the measurement observer, so its LCP field is not a valid zero-millisecond result.

The major regression is the **roughly 16 MB enhanced download**, dominated by the approximately 9.17 MB `new-homes.glb` and 4.54 MB combined PNG atlases. The initial mobile poster is much smaller. The renderer is a deferred chunk, and no-JS/reduced-motion paths avoid its model/atlas payload. The static poster/HTML remain usable before that enhancement arrives. Cold loading, image decode and shader compilation are distinct from when text first becomes readable.

`throttled-mobile.json` records an additional Chrome CDP cold-cache 4× CPU, 150ms RTT, 200 kB/s observation. It is an emulation and a limited observation window, not physical-device acceptance or a completed download benchmark. Review its actual values; do not infer a 2.5-second mobile performance pass. Pre-fix measurements exposed a scheduler regression: removing and re-adding the renderer listener inside a GSAP tick could revisit it in that same tick. The corrected renderer leaves one listener registered throughout a transition and removes it only at rest. The final measurement is recorded in the JSON, and an explicit 60-second transition fixture checks event-loop responsiveness. The enhanced payload does not meet the skill's 3 MB target, so no award-readiness or performance score of 8 is claimed.

The source Phase 7 report's native-runtime limitation is partly improved: local native runtime startup and real HTTP/DO requests now work. **Real deployed alarms, persisted recovery after platform restart, zero-viewer cloud operation, geographical latency, billing and deployed load capacity remain unverified.** Inherited in-process observer tests are not deployed load tests. No cloud service or resource has been created by this integration.

## Remaining release steps

1. Review the local full-width composition, shorter mobile crop, minimal header and subtle entrance. Approve public copy if different phrasing is preferred.
2. Establish the canonical world/namespace and history-preservation plan. Check class/migration tags against actual deployed bindings before any deployment.
3. Optimize geometry and texture delivery using measured quality budgets. Evaluate compressed meshes and modern GPU texture formats, device-appropriate assets, transfer compression/cache headers and a low-bandwidth policy. Keep identity order and original authority fingerprint semantics intact.
4. Repeat cold-cache tests on physical phones and native GPUs, check initial paint and first WebGL render separately, and profile sustained memory/thermal/scroll behavior. Verify context loss and bfcache on the supported browser matrix.
5. Exercise real deployed alarm retries, durable restarts, long downtime and zero-viewer advancement in a separately approved staging environment. Measure actual request volume, latency, storage/CPU/billing and expected polling traffic.
6. Re-run build, tests, keyboard/reduced-motion/fallback checks, both Worker dry runs and the existing site's normal metadata gate against the chosen release tree.
7. Deploy only after explicit approval. No deploy/provision command without `--dry-run` was run here.

Final summaries: [measurements](MEASUREMENTS.md), [independent critique](critic-final.md). The final functional run passes, including a test-only sixty-second committed-transition envelope that checks browser responsiveness. The additional measured phone-paint delay remains unresolved; it is recorded as a release gate rather than dismissed as a proven tooling artifact.
