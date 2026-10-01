interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
}

const TRACKER_ORIGIN = "https://tracker.atriveo.com";
const BRAND_ORIGIN = "https://atriveo.com";
const TRACKER_PATH_PREFIXES = ["/dashboard", "/app", "/extension-install", "/header-test"];

function shouldRedirectToTracker(url: URL): boolean {
  if (url.pathname === "/" && url.searchParams.has("token")) return true;
  return TRACKER_PATH_PREFIXES.some(
    (prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`),
  );
}

function withSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("Strict-Transport-Security", "max-age=31536000");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (shouldRedirectToTracker(url)) {
      return Response.redirect(`${TRACKER_ORIGIN}${url.pathname}${url.search}`, 308);
    }

    // Crawlers often probe /sitemap.xml; the generated index lives at /sitemap-index.xml.
    if (url.pathname === "/sitemap.xml") {
      return Response.redirect(`${BRAND_ORIGIN}/sitemap-index.xml`, 301);
    }

    if (url.hostname === "www.atriveo.com") {
      return Response.redirect(`${BRAND_ORIGIN}${url.pathname}${url.search}`, 308);
    }

    return withSecurityHeaders(await env.ASSETS.fetch(request));
  },
};
