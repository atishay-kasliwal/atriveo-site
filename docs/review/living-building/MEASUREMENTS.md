# Local loading measurements

Local production Astro assets + native local workerd/SQLite Durable Object; Chrome with SwiftShader. No cloud deployment, physical-device or capacity claim.

These performance captures predate the latest presentation adjustment that restored the outer third columns and removed the caption controls. Treat them as prior-build measurements, not fresh performance results for the current local page.

The baseline and native Worker use different local serving/compression paths. These samples are diagnostic, not production percentiles or an improvement claim. Blank paint values mean unavailable; JavaScript-disabled pages cannot run the observer.

| Sample | FCP ms | LCP ms | CLS | First authoritative frame ms | Completed resource body MB |
|---|---:|---:|---:|---:|---:|
| baseline desktop | 8184.0 | 8184.0 | 0.0000 | unavailable | 0.120 |
| integrated desktop | 568.0 | 568.0 | 0.0000 | 5320.3 | 15.942 |
| no-js | 428.0 | unavailable | 0.0000 | unavailable | 0.163 |
| reduced-motion | 400.0 | 480.0 | 0.0000 | unavailable | 0.206 |
| no-webgl | 608.0 | 608.0 | 0.0000 | unavailable | 0.194 |
| state-outage | 344.0 | 344.0 | 0.0000 | unavailable | 0.205 |
| asset-failure | 416.0 | 416.0 | 0.0000 | unavailable | 6.769 |

## Throttled phone

Local native Worker, Chrome CDP 4x CPU, 150ms latency, 200kB/s down, cold browser cache. Observed for ten seconds AFTER DOMContentLoaded; screenshot/compositor work can extend the sample. Not a physical-device result.

Observed FCP/LCP: **9956/9956 ms**. CLS: 0. Interactive building ready at sampling: False. The CTA bottom was at 683px in an 844px viewport.

**This does not pass the 2.5-second mobile LCP goal.** Initial render/compositor timing and the heavy enhancement must be profiled further on native devices. The poster arrived much earlier than the measured paint; no causal claim about that gap is established by Resource Timing alone.

## Rendering and payload

Prior desktop capture: 3 draw calls, 142,853 triangles, 68 unique room identities in geometry and glass; 80 authoritative states. The current presentation contains 72 visible identities; its triangle count has not been remeasured.
60-second active-transition regression fixture: browser timer yielded in 101.3 ms. This is a test-only intercepted envelope, not a world event or a cloud capacity test.

| Asset group | Raw MB | gzip estimate MB |
|---|---:|---:|
| Models | 11.053 | 4.029 |
| Atlases | 4.539 | 4.536 |
| Posters | 0.079 | 0.079 |
| Browser JS | 0.654 | 0.175 |

gzip estimates are offline byte estimates, not evidence that a deployed CDN will encode these MIME types. GLBs/PNGs remain the dominant transfer. Reduced motion avoids the renderer/models/atlases; static content remains the primary path while enhancement loads.

Full diagnostics and per-resource timings: [validation.json](validation.json), [throttled-mobile.json](throttled-mobile.json).
