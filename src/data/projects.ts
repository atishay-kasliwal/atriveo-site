export type ProjectCategory =
  | "Career"
  | "Intelligence"
  | "Research"
  | "Creative"
  | "Health";

export type ProjectStage = "Live" | "Open source" | "In development";

export type ProjectLink = {
  label: string;
  href: string;
  kind: "live" | "source" | "related";
};

export type Project = {
  slug: string;
  name: string;
  shortName: string;
  eyebrow: string;
  shortDescription: string;
  longDescription: string;
  category: ProjectCategory;
  stage: ProjectStage;
  featured: boolean;
  accent: "blue" | "violet" | "cyan" | "green" | "amber" | "rose";
  monogram: string;
  technologies: string[];
  highlights: string[];
  links: ProjectLink[];
};

export const projects: Project[] = [
  {
    slug: "applications",
    name: "Atriveo Applications",
    shortName: "Applications",
    eyebrow: "Job discovery + evidence compiler",
    shortDescription:
      "A self-hosted intelligence pipeline that discovers roles, scores fit, and compiles evidence-backed resumes.",
    longDescription:
      "Atriveo Applications connects a hosted control plane to a local-first job discovery and resume compilation runtime. It treats each resume as compiled evidence rather than free-form generated text, keeping the workflow inspectable and grounded.",
    category: "Career",
    stage: "Live",
    featured: false,
    accent: "violet",
    monogram: "AP",
    technologies: ["React", "Node.js", "Python", "MongoDB", "LaTeX", "Local LLM"],
    highlights: [
      "Ranked job feed with fit scoring and market signals",
      "Evidence-backed, ATS-safe resume compilation",
      "Hosted UI with a self-hosted data and model runtime",
    ],
    links: [
      { label: "Open applications", href: "https://application.atriveo.com", kind: "live" },
      {
        label: "View platform source",
        href: "https://github.com/atishay-kasliwal/Atriveo-JD-Extractor",
        kind: "source",
      },
      {
        label: "View compiler source",
        href: "https://github.com/atishay-kasliwal/atriveo-app",
        kind: "related",
      },
    ],
  },
  {
    slug: "cortex",
    name: "Atriveo Cortex",
    shortName: "Cortex",
    eyebrow: "Local-first working memory",
    shortDescription:
      "A private intelligence layer that turns screen activity into projects, commitments, and ideas.",
    longDescription:
      "Cortex builds a useful memory layer from activity already happening on your computer. It extracts durable projects, decisions, commitments, and ideas while keeping the primary workflow local-first.",
    category: "Intelligence",
    stage: "Live",
    featured: true,
    accent: "cyan",
    monogram: "CX",
    technologies: ["TypeScript", "React", "ScreenPipe", "Local AI"],
    highlights: [
      "Automatic extraction of projects and commitments",
      "Local-first capture and review workflow",
      "Searchable context designed for ongoing work",
    ],
    links: [
      { label: "Open Cortex", href: "https://cortex.atriveo.com", kind: "live" },
      {
        label: "View source",
        href: "https://github.com/atishay-kasliwal/atriveo-cortex",
        kind: "source",
      },
    ],
  },
  {
    slug: "bio",
    name: "Atriveo Bio",
    shortName: "Bio",
    eyebrow: "Readiness intelligence",
    shortDescription:
      "An open platform for understanding cognitive readiness, performance rhythms, and recovery.",
    longDescription:
      "Atriveo Bio explores how wearable signals can become understandable readiness and performance guidance. The project focuses on transparent interpretation instead of opaque scores.",
    category: "Health",
    stage: "Live",
    featured: false,
    accent: "green",
    monogram: "BI",
    technologies: ["TypeScript", "Wearables", "Data visualization", "Forecasting"],
    highlights: [
      "Cognitive-readiness and recovery views",
      "Performance forecasting from wearable signals",
      "Open architecture for personal experimentation",
    ],
    links: [
      { label: "Open Bio", href: "https://bio.atriveo.com", kind: "live" },
      { label: "View source", href: "https://github.com/atishay-kasliwal/cortex-bio", kind: "source" },
    ],
  },
  {
    slug: "grant-scout",
    name: "Grant Scout",
    shortName: "Grant Scout",
    eyebrow: "Opportunity research",
    shortDescription:
      "A focused interface for finding and evaluating public grant opportunities without drowning in listings.",
    longDescription:
      "Grant Scout organizes government funding opportunities into a faster research workflow, pairing search and filtering with concise project-fit signals.",
    category: "Research",
    stage: "Live",
    featured: true,
    accent: "amber",
    monogram: "GS",
    technologies: ["TypeScript", "Cloudflare", "Public data", "Search"],
    highlights: [
      "Focused discovery across public grant data",
      "Faster triage and opportunity comparison",
      "Live, lightweight research interface",
    ],
    links: [
      { label: "Open Grant Scout", href: "https://grant.atriveo.com", kind: "live" },
      {
        label: "View source",
        href: "https://github.com/atishay-kasliwal/grants-gov-ai-finder",
        kind: "source",
      },
    ],
  },
  {
    slug: "h1b-tracker",
    name: "H-1B Sponsor Tracker",
    shortName: "H-1B Tracker",
    eyebrow: "Career research",
    shortDescription:
      "A searchable view of sponsor signals for a more informed, less wasteful job search.",
    longDescription:
      "The H-1B Sponsor Tracker helps candidates concentrate their search on employers with relevant sponsorship history and active technical roles.",
    category: "Career",
    stage: "Live",
    featured: false,
    accent: "rose",
    monogram: "H1",
    technologies: ["Web data", "Search", "Automation", "Cloudflare"],
    highlights: [
      "Sponsor-focused company discovery",
      "Search and filtering for technical roles",
      "Built to reduce low-signal applications",
    ],
    links: [
      { label: "Open H-1B Tracker", href: "https://atriveo-h1b.pages.dev", kind: "live" },
    ],
  },
  {
    slug: "patent",
    name: "Atriveo Patent",
    shortName: "Patent",
    eyebrow: "Grounded document intelligence",
    shortDescription:
      "Turn dense patent PDFs into grounded summaries and presentation-ready explanations.",
    longDescription:
      "Atriveo Patent creates navigable, source-grounded explanations from patent documents. It is designed for analysis that stays connected to the underlying claims and figures.",
    category: "Research",
    stage: "Open source",
    featured: false,
    accent: "violet",
    monogram: "PT",
    technologies: ["TypeScript", "PDF", "Retrieval", "Presentations"],
    highlights: [
      "Grounded patent summaries",
      "Claim and evidence navigation",
      "Presentation-deck generation workflow",
    ],
    links: [
      {
        label: "View source",
        href: "https://github.com/atishay-kasliwal/atriveo-patent",
        kind: "source",
      },
    ],
  },
  {
    slug: "knowledge",
    name: "Atriveo Knowledge",
    shortName: "Knowledge",
    eyebrow: "Knowledge infrastructure",
    shortDescription:
      "Experiments in turning accumulated context into useful, retrievable working knowledge.",
    longDescription:
      "Atriveo Knowledge is the open research surface for organizing, retrieving, and reusing durable context across projects.",
    category: "Intelligence",
    stage: "Open source",
    featured: false,
    accent: "blue",
    monogram: "KN",
    technologies: ["TypeScript", "Retrieval", "Knowledge systems", "AI"],
    highlights: [
      "Reusable knowledge primitives",
      "Retrieval-oriented project structure",
      "Open experiments for durable context",
    ],
    links: [
      {
        label: "View source",
        href: "https://github.com/atishay-kasliwal/atriveo-knowledge",
        kind: "source",
      },
    ],
  },
  {
    slug: "reel",
    name: "Atriveo Reel",
    shortName: "Reel",
    eyebrow: "Creative video utility",
    shortDescription:
      "Pick two moments from two videos and turn them into a clean vertical comparison reel.",
    longDescription:
      "Atriveo Reel is a deliberately small media tool: supply two videos, choose the moments that matter, and export a vertical comparison without a heavyweight editing workflow.",
    category: "Creative",
    stage: "Open source",
    featured: true,
    accent: "rose",
    monogram: "RL",
    technologies: ["TypeScript", "Video", "FFmpeg", "Self-hosted"],
    highlights: [
      "Two-source moment selection",
      "Vertical comparison composition",
      "Self-hosted media processing",
    ],
    links: [
      { label: "View source", href: "https://github.com/atishay-kasliwal/atriveo-reel", kind: "source" },
    ],
  },
  {
    slug: "audiobook",
    name: "Audiobook Atriveo",
    shortName: "Audiobook",
    eyebrow: "Accessible media tooling",
    shortDescription:
      "An open Python project exploring repeatable audiobook creation and processing workflows.",
    longDescription:
      "Audiobook Atriveo collects the tools and automation needed to turn long-form text into a consistent listening artifact.",
    category: "Creative",
    stage: "Open source",
    featured: false,
    accent: "amber",
    monogram: "AU",
    technologies: ["Python", "Audio", "Automation", "Text processing"],
    highlights: [
      "Repeatable long-form audio workflow",
      "Python-based processing pipeline",
      "Open implementation for adaptation",
    ],
    links: [
      {
        label: "View source",
        href: "https://github.com/atishay-kasliwal/audiobook-atriveo",
        kind: "source",
      },
    ],
  },
];

export const featuredProjects = projects.filter((project) => project.featured);
export const categories = [...new Set(projects.map((project) => project.category))];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getSourceRepository(project: Project): string | undefined {
  return project.links.find((link) => link.kind === "source")?.href;
}
