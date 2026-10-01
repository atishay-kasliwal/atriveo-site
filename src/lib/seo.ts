import { createHeadTags } from "@power-seo/meta";
import {
  breadcrumbList,
  itemList,
  organization,
  schemaGraph,
  softwareApp,
  toJsonLdString,
  webSite,
  type SchemaObject,
} from "@power-seo/schema";
import type { Project } from "../data/projects";

export const SITE_URL = "https://atriveo.com";
export const SOCIAL_IMAGE_URL = `${SITE_URL}/social-card.png`;

const atriveoOrganization = organization({
  "@id": `${SITE_URL}/#organization`,
  name: "Atriveo",
  legalName: "Atriveo",
  description:
    "The public hub for products, open-source experiments, and everything Atishay Kasliwal is building.",
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/favicon.svg`,
  sameAs: ["https://github.com/atishay-kasliwal"],
  foundingLocation: "New York, United States",
  knowsAbout: [
    "Career software",
    "Local-first artificial intelligence",
    "Open-source software",
    "Research tools",
  ],
});

const atriveoWebsite = webSite({
  "@id": `${SITE_URL}/#website`,
  name: "Atriveo",
  alternateName: "Atriveo Builder Hub",
  description:
    "A public index of live products, open-source experiments, public activity, and ongoing engineering work.",
  url: `${SITE_URL}/`,
  publisher: atriveoOrganization,
  inLanguage: "en-US",
});

type SeoHeadOptions = {
  title: string;
  description: string;
  canonical: string;
  noindex?: boolean;
  /** Absolute URL of a 1200×630 preview image; defaults to the brand card. */
  socialImage?: string;
  socialImageAlt?: string;
};

const DEFAULT_SOCIAL_IMAGE_ALT = "Atriveo, useful software systems built in public";

export function createAtriveoHead({
  title,
  description,
  canonical,
  noindex = false,
  socialImage = SOCIAL_IMAGE_URL,
  socialImageAlt = DEFAULT_SOCIAL_IMAGE_ALT,
}: SeoHeadOptions) {
  const imageType = socialImage.endsWith(".jpg") ? "image/jpeg" : "image/png";
  return createHeadTags({
    title,
    description,
    // A noindex page (the 404) should not name a canonical URL.
    canonical: noindex ? undefined : canonical,
    robots: {
      index: !noindex,
      follow: !noindex,
      maxSnippet: -1,
      maxImagePreview: "large",
      maxVideoPreview: -1,
    },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      siteName: "Atriveo",
      locale: "en_US",
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: socialImageAlt,
          type: imageType,
        },
      ],
    },
    twitter: {
      cardType: "summary_large_image",
      title,
      description,
      image: socialImage,
      imageAlt: socialImageAlt,
    },
    additionalMetaTags: [{ name: "theme-color", content: "#f5f7fb" }],
  });
}

export function createAtriveoJsonLd(pageSchemas: SchemaObject[] = []) {
  return toJsonLdString(schemaGraph([atriveoOrganization, atriveoWebsite, ...pageSchemas]));
}

export function createProjectCatalogSchema(projects: Project[]) {
  return itemList({
    numberOfItems: projects.length,
    itemListOrder: "https://schema.org/ItemListUnordered",
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: project.name,
      url: `${SITE_URL}/projects/${project.slug}/`,
    })),
  });
}

const projectTitles: Record<string, string> = {
  applications: "Atriveo Applications | Evidence-Based Job Discovery",
  cortex: "Atriveo Cortex | Private Local-First Working Memory",
  bio: "Atriveo Bio | Open Cognitive Readiness Intelligence",
  "grant-scout": "Grant Scout | Public Funding Opportunity Research | Atriveo",
  "h1b-tracker": "H-1B Sponsor Tracker | Career Research Tools | Atriveo",
  patent: "Atriveo Patent | Grounded Patent Document Intelligence",
  knowledge: "Atriveo Knowledge | Durable Working Memory Systems",
  reel: "Atriveo Reel | Creative Video Automation Tools | Atriveo",
  audiobook: "Atriveo Audiobook | Open Audio Production Workflow",
  dock: "Atriveo Dock | macOS Job Search Sidebar and Resume Builder",
  playatriveo: "Playatriveo | Local Job Application Engine | Atriveo",
  dance: "Atriveo Dance | Choreography and Formation Workspace",
  maps: "Atriveo Maps | Address-Centred Map Poster Generator",
};

export function getProjectSeoTitle(project: Project) {
  return projectTitles[project.slug] || `${project.name} | ${project.eyebrow} | Atriveo`;
}

export function getProjectSeoDescription(project: Project) {
  if (project.longDescription.length <= 160) return project.longDescription;
  const shortened = project.longDescription.slice(0, 157).replace(/\s+\S*$/, "");
  return `${shortened}...`;
}

export function createProjectSchemas(project: Project): SchemaObject[] {
  const detailUrl = `${SITE_URL}/projects/${project.slug}/`;
  const liveUrl = project.links.find((link) => link.kind === "live")?.href;
  const externalUrls = project.links.map((link) => link.href);
  const screenshots = project.media?.images.map((image) => `${SITE_URL}${image.src}`);

  return [
    softwareApp({
      "@id": `${detailUrl}#software`,
      type: liveUrl ? "WebApplication" : "SoftwareApplication",
      name: project.name,
      description: project.longDescription,
      applicationCategory: `${project.category}Application`,
      operatingSystem: liveUrl ? "Any web browser" : undefined,
      url: detailUrl,
      sameAs: externalUrls,
      ...(screenshots?.length ? { image: screenshots[0], screenshot: screenshots } : {}),
    }),
    breadcrumbList([
      { name: "Atriveo", url: `${SITE_URL}/` },
      { name: "Projects", url: `${SITE_URL}/projects/` },
      { name: project.name, url: detailUrl },
    ]),
  ];
}

export type { SchemaObject };
