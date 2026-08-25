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
const pages = await Promise.all(
  files.map(async (file) => createAuditInput(file, await readFile(file, "utf8"))),
);
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
  for (const rule of warningRules) console.log(`    WARN ${rule.title} — ${rule.description}`);
}

if (errors.length > 0 || score < SCORE_THRESHOLD) {
  for (const { url, rule } of errors) console.error(`  ERROR ${url}: ${rule.title} — ${rule.description}`);
  throw new Error(
    `SEO audit failed: score ${score}/100 (minimum ${SCORE_THRESHOLD}) with ${errors.length} critical errors.`,
  );
}
