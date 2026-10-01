import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { auditPage } from "@power-seo/audit";

const DIST_DIR = new URL("../dist/", import.meta.url);
const SITE_URL = "https://atriveo.com";
const SCORE_THRESHOLD = 90;

async function findHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const target = path.join(directory, entry.name);
      return entry.isDirectory() ? findHtmlFiles(target) : target.endsWith(".html") ? [target] : [];
    }),
  );
  return nested.flat();
}

function decodeHtml(value = "") {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function attributes(source) {
  const parsed = {};
  const attributePattern = /([:\w-]+)\s*=\s*(["'])(.*?)\2/g;
  for (const match of source.matchAll(attributePattern)) parsed[match[1].toLowerCase()] = decodeHtml(match[3]);
  return parsed;
}

function tags(html, name) {
  const pattern = new RegExp(`<${name}\\b([^>]*)>`, "gi");
  return [...html.matchAll(pattern)].map((match) => attributes(match[1]));
}

function metaContent(html, attribute, value) {
  return tags(html, "meta").find((tag) => tag[attribute] === value)?.content;
}

function stripTags(value = "") {
  return decodeHtml(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function pageUrl(file) {
  const relative = path.relative(DIST_DIR.pathname, file).split(path.sep).join("/");
  if (relative === "index.html") return `${SITE_URL}/`;
  return `${SITE_URL}/${relative.replace(/index\.html$/, "")}`;
}

function extractSchemas(html) {
  const schemas = [];
  const scriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(scriptPattern)) {
    const attrs = attributes(match[1]);
    if (attrs.type !== "application/ld+json") continue;
    try {
      const parsed = JSON.parse(match[2]);
      if (Array.isArray(parsed?.["@graph"])) schemas.push(...parsed["@graph"]);
      else schemas.push(parsed);
    } catch {
      throw new Error("Invalid JSON-LD found in a generated page.");
    }
  }
  return schemas;
}

function createAuditInput(file, html) {
  const title = stripTags(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]);
  const canonical = tags(html, "link").find((tag) => tag.rel === "canonical")?.href;
  const headingPattern = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  const headings = [...html.matchAll(headingPattern)].map((match) => `h${match[1]}:${stripTags(match[2])}`);
  const images = tags(html, "img").map((image) => ({ src: image.src, alt: image.alt }));
  const links = tags(html, "a").map((link) => link.href).filter(Boolean);

  return {
    url: pageUrl(file),
    title,
    metaDescription: metaContent(html, "name", "description"),
    canonical,
    robots: metaContent(html, "name", "robots"),
    openGraph: {
      title: metaContent(html, "property", "og:title"),
      description: metaContent(html, "property", "og:description"),
      image: metaContent(html, "property", "og:image"),
    },
    schema: extractSchemas(html),
    images,
    internalLinks: links.filter((href) => href.startsWith("/") || href.startsWith(SITE_URL)),
    externalLinks: links.filter((href) => /^https?:\/\//.test(href) && !href.startsWith(SITE_URL)),
    headings,
    statusCode: 200,
    contentLength: Buffer.byteLength(html),
  };
}

const files = (await findHtmlFiles(DIST_DIR.pathname)).filter((file) => !file.endsWith("/404.html"));
const builtPages = await Promise.all(
  files.map(async (file) => ({ file, html: await readFile(file, "utf8") })),
);
const forbiddenEmDash = String.fromCodePoint(0x2014);
const emDashPages = builtPages.filter(({ html }) => html.includes(forbiddenEmDash));
const pages = builtPages.map(({ file, html }) => createAuditInput(file, html));
const pageResults = pages.map((page) => {
  const result = auditPage(page);
  const rules = result.rules.filter((rule) => rule.category !== "content");
  const scorable = rules.filter((rule) => rule.severity !== "info");
  const passed = scorable.filter((rule) => rule.severity === "pass").length;
  return { ...result, rules, score: Math.round((passed / Math.max(scorable.length, 1)) * 100) };
});
const score = Math.round(pageResults.reduce((total, page) => total + page.score, 0) / pageResults.length);
const errors = pageResults.flatMap((page) =>
  page.rules.filter((rule) => rule.severity === "error").map((rule) => ({ url: page.url, rule })),
);

console.log(`Power SEO technical audit: ${score}/100 across ${pageResults.length} pages`);
for (const page of pageResults) {
  const warningRules = page.rules.filter((rule) => rule.severity === "warning");
  const warnings = warningRules.length;
  const pageErrors = page.rules.filter((rule) => rule.severity === "error").length;
  console.log(`  ${page.score}/100  ${page.url}  (${pageErrors} errors, ${warnings} warnings)`);
  for (const rule of warningRules) console.log(`    WARN ${rule.title}: ${rule.description}`);
}

if (emDashPages.length > 0) {
  for (const { file } of emDashPages) console.error(`  ERROR ${pageUrl(file)}: em dash found in generated HTML`);
}

// Site-level checks the per-page audit does not cover.
const siteErrors = [];
const distPath = (url) => path.join(DIST_DIR.pathname, decodeURIComponent(new URL(url, SITE_URL).pathname));
const fileExists = async (url) => readFile(distPath(url)).then(() => true, () => false);
for (const { file, html } of builtPages) {
  const url = pageUrl(file);
  for (const image of tags(html, "img")) {
    if (image.alt === undefined) siteErrors.push(`${url}: image without alt text (${image.src})`);
    if (!image.width || !image.height) siteErrors.push(`${url}: image without width/height (${image.src})`);
    if (image.src?.startsWith("/") && !(await fileExists(image.src))) siteErrors.push(`${url}: missing image ${image.src}`);
  }
  for (const video of tags(html, "video")) {
    if (video.poster && !(await fileExists(video.poster))) siteErrors.push(`${url}: missing video poster ${video.poster}`);
  }
  for (const source of tags(html, "source")) {
    if (source.src?.startsWith("/") && !(await fileExists(source.src))) siteErrors.push(`${url}: missing video ${source.src}`);
  }
  const ogImage = metaContent(html, "property", "og:image");
  if (ogImage?.startsWith(SITE_URL) && !(await fileExists(ogImage))) siteErrors.push(`${url}: missing social image ${ogImage}`);
}
// Every project page must be one normal HTML link from the homepage and the catalog.
const linkTargets = (pageFile) =>
  new Set(
    tags(builtPages.find(({ file }) => file.endsWith(pageFile)).html, "a")
      .map((link) => link.href)
      .filter(Boolean)
      .map((href) => new URL(href, SITE_URL).pathname),
  );
const homeLinks = linkTargets(`${path.sep}dist${path.sep}index.html`);
const catalogLinks = linkTargets(`${path.sep}projects${path.sep}index.html`);
for (const { file } of builtPages) {
  const pathname = new URL(pageUrl(file)).pathname;
  if (!/^\/projects\/[^/]+\/$/.test(pathname)) continue;
  if (!homeLinks.has(pathname)) siteErrors.push(`Homepage has no HTML link to ${pathname}`);
  if (!catalogLinks.has(pathname)) siteErrors.push(`/projects/ has no HTML link to ${pathname}`);
}
// The sitemap lists exactly the indexable pages.
const sitemapXml = await readFile(new URL("sitemap-0.xml", DIST_DIR), "utf8");
const sitemapUrls = new Set([...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));
const indexableUrls = new Set(pages.filter((page) => !/noindex/i.test(page.robots || "")).map((page) => page.url));
for (const url of indexableUrls) if (!sitemapUrls.has(url)) siteErrors.push(`Sitemap is missing ${url}`);
for (const url of sitemapUrls) if (!indexableUrls.has(url)) siteErrors.push(`Sitemap lists a non-indexable or missing page ${url}`);
// The 404 page stays out of the index and names no canonical URL.
const notFound = await readFile(new URL("404.html", DIST_DIR), "utf8");
if (!/noindex/i.test(metaContent(notFound, "name", "robots") || "")) siteErrors.push("404 page must be noindex");
if (tags(notFound, "link").some((tag) => tag.rel === "canonical")) siteErrors.push("404 page must not declare a canonical URL");
for (const message of siteErrors) console.error(`  ERROR ${message}`);
console.log(`Site checks: ${siteErrors.length} problems, ${sitemapUrls.size} sitemap URLs, ${indexableUrls.size} indexable pages`);

if (errors.length > 0 || score < SCORE_THRESHOLD || emDashPages.length > 0 || siteErrors.length > 0) {
  for (const { url, rule } of errors) console.error(`  ERROR ${url}: ${rule.title}: ${rule.description}`);
  throw new Error(
    `SEO audit failed: score ${score}/100 (minimum ${SCORE_THRESHOLD}), ${errors.length} critical errors, ${emDashPages.length} pages with forbidden punctuation, and ${siteErrors.length} site-level problems.`,
  );
}
