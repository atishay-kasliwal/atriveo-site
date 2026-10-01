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

export type ProjectImage = {
  src: string;
  /** Smaller variant for the srcset; its width is the second number. */
  small: [string, number];
  width: number;
  height: number;
  alt: string;
  caption: string;
};

export type ProjectMedia = {
  images: ProjectImage[];
  /** A short silent screen recording, played on request. */
  video?: { src: string; poster: string; width: number; height: number; label: string };
  /** 1200×630 crop of a real screenshot, used for link previews. */
  socialImage: string;
  note?: string;
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
  media?: ProjectMedia;
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
      {
        label: "View pipeline source",
        href: "https://github.com/atishay-kasliwal/job-pipeline",
        kind: "related",
      },
    ],
    media: {
      images: [
        {
          src: "/projects/applications/live-site.webp",
          small: ["/projects/applications/live-site-720.webp", 720],
          width: 1080,
          height: 664,
          alt: "Atriveo Applications pipeline drawn as a blueprint: scrape, score, review, tailor, compile, apply",
          caption: "The pipeline, scrape to apply",
        },
        {
          src: "/projects/applications/features.webp",
          small: ["/projects/applications/features-720.webp", 720],
          width: 1440,
          height: 885,
          alt: "Atriveo Applications features: multi-source job scraper, ranked live feed, LLM résumé tailoring, truth-first bullet bank, recon and pipeline tracking",
          caption: "Features",
        },
        {
          src: "/projects/applications/pipeline.webp",
          small: ["/projects/applications/pipeline-720.webp", 720],
          width: 1440,
          height: 885,
          alt: "From job posting to PDF résumé: four steps beside a terminal showing the pipeline status and scraper output",
          caption: "From posting to PDF résumé",
        },
        {
          src: "/projects/applications/deploy.webp",
          small: ["/projects/applications/deploy-720.webp", 720],
          width: 1440,
          height: 885,
          alt: "Three ways to run Atriveo Applications: Cloudflare Pages, Docker Compose, or OpenShift and Kubernetes",
          caption: "Ways to run it",
        },
      ],
      video: {
        src: "/projects/applications/recording.mp4",
        poster: "/projects/applications/recording-poster.webp",
        width: 1080,
        height: 664,
        label: "Scroll through the live site",
      },
      socialImage: "/projects/applications/og.jpg",
    },
  },
  {
    slug: "dock",
    name: "Atriveo Dock",
    shortName: "Dock",
    eyebrow: "Native macOS job sidebar",
    shortDescription:
      "A desktop sidebar with a ranked live job feed, one-click tailored resumes, and an hourly scrape.",
    longDescription:
      "Atriveo Dock pins the job search to the edge of the screen. It shows a scored feed of fresh postings, builds a one-page resume for each one from your own accomplishment bank, tracks what you applied to, and refreshes itself every hour. It runs in demo mode right after install.",
    category: "Career",
    stage: "Open source",
    featured: false,
    accent: "blue",
    monogram: "DK",
    technologies: ["Tauri", "React", "TypeScript", "Rust"],
    highlights: [
      "Ranked feed of new postings, searchable with ⌘K",
      "One-click tailored resumes and cover letters",
      "Hourly auto-scrape with live progress",
    ],
    links: [
      {
        label: "View source",
        href: "https://github.com/atishay-kasliwal/atriveo-job-dock",
        kind: "source",
      },
      {
        label: "Download for macOS",
        href: "https://github.com/atishay-kasliwal/atriveo-job-dock/releases/latest",
        kind: "related",
      },
    ],
    media: {
      images: [
        {
          src: "/projects/dock/feed.webp",
          small: ["/projects/dock/feed-400.webp", 400],
          width: 800,
          height: 2148,
          alt: "Atriveo Dock ranked job feed with tailored resumes building",
          caption: "Ranked feed, resumes building",
        },
        {
          src: "/projects/dock/scrape.webp",
          small: ["/projects/dock/scrape-400.webp", 400],
          width: 800,
          height: 2148,
          alt: "Atriveo Dock hourly scrape in progress, phase by phase",
          caption: "Hourly scrape, phase by phase",
        },
        {
          src: "/projects/dock/new-jobs.webp",
          small: ["/projects/dock/new-jobs-400.webp", 400],
          width: 800,
          height: 2148,
          alt: "Atriveo Dock new jobs with tailored resumes ready to download",
          caption: "New jobs, resumes ready",
        },
        {
          src: "/projects/dock/search.webp",
          small: ["/projects/dock/search-400.webp", 400],
          width: 800,
          height: 2148,
          alt: "Searching the Atriveo Dock job feed",
          caption: "⌘K search",
        },
        {
          src: "/projects/dock/create.webp",
          small: ["/projects/dock/create-400.webp", 400],
          width: 800,
          height: 2148,
          alt: "Building a resume in Atriveo Dock from a pasted job description",
          caption: "Paste any job description",
        },
        {
          src: "/projects/dock/settings.webp",
          small: ["/projects/dock/settings-400.webp", 400],
          width: 800,
          height: 2148,
          alt: "Atriveo Dock settings with backend connection, demo mode and resume identity",
          caption: "Connection, demo mode, resume identity",
        },
      ],
      video: {
        src: "/projects/dock/recording.mp4",
        poster: "/projects/dock/recording-poster.webp",
        width: 800,
        height: 2148,
        label: "Demo: searching, building resumes, scraping",
      },
      socialImage: "/projects/dock/og.jpg",
    },
  },
  {
    slug: "playatriveo",
    name: "Playatriveo",
    shortName: "Playatriveo",
    eyebrow: "Local application engine",
    shortDescription:
      "Fills employer application forms from your own profile and stops for review before anything is submitted.",
    longDescription:
      "Playatriveo takes a job with a finished tailored resume, opens the employer's application form, and fills it from your profile and answer bank. It never invents an answer, never bypasses CAPTCHA or MFA, and submits automatically only for form patterns you have already approved.",
    category: "Career",
    stage: "In development",
    featured: false,
    accent: "violet",
    monogram: "PA",
    technologies: ["Playwright", "TypeScript", "MongoDB"],
    highlights: [
      "Adapters for Greenhouse, Lever, Ashby, and Workday",
      "Review mode by default, with trust earned per form",
      "Kill switch and one application per posting",
    ],
    links: [],
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
    media: {
      images: [
        {
          src: "/projects/cortex/overview.webp",
          small: ["/projects/cortex/overview-720.webp", 720],
          width: 1080,
          height: 664,
          alt: "Atriveo Cortex's “Your work, remembered.” screen at the front of a ribbon of past screens",
          caption: "Overview",
        },
        {
          src: "/projects/cortex/sign-in.webp",
          small: ["/projects/cortex/sign-in-720.webp", 720],
          width: 1440,
          height: 885,
          alt: "Atriveo Cortex sign-in page: “The memory layer for your work. Your work, remembered.”",
          caption: "Sign-in",
        },
      ],
      video: {
        src: "/projects/cortex/recording.mp4",
        poster: "/projects/cortex/recording-poster.webp",
        width: 1280,
        height: 786,
        label: "Overview animation",
      },
      socialImage: "/projects/cortex/og.jpg",
      note: "The dashboard shows private activity, so it is not pictured.",
    },
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
    media: {
      images: [
        {
          src: "/projects/bio/live-site.webp",
          small: ["/projects/bio/live-site-720.webp", 720],
          width: 1080,
          height: 664,
          alt: "Atriveo Bio's landing page split into floating layers: navigation, “Know when you'll perform at your best”, and the readiness card",
          caption: "Live site",
        },
        {
          src: "/projects/bio/features.webp",
          small: ["/projects/bio/features-720.webp", 720],
          width: 1440,
          height: 885,
          alt: "Atriveo Bio features: cognitive readiness, deep work forecasting, chronotype analysis, recovery, performance analytics and a developer API",
          caption: "Features",
        },
        {
          src: "/projects/bio/pipeline.webp",
          small: ["/projects/bio/pipeline-720.webp", 720],
          width: 1440,
          height: 885,
          alt: "Atriveo Bio pipeline: connect wearables, generate biometrics, predict performance, optimize work",
          caption: "Pipeline",
        },
        {
          src: "/projects/bio/api-docs.webp",
          small: ["/projects/bio/api-docs-720.webp", 720],
          width: 1440,
          height: 885,
          alt: "Atriveo Bio API reference, v1 public beta, with authentication and a readiness request example",
          caption: "API docs",
        },
      ],
      video: {
        src: "/projects/bio/recording.mp4",
        poster: "/projects/bio/recording-poster.webp",
        width: 1080,
        height: 664,
        label: "Scroll through the live site",
      },
      socialImage: "/projects/bio/og.jpg",
    },
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
    slug: "dance",
    name: "Atriveo Dance",
    shortName: "Dance",
    eyebrow: "Choreography workspace",
    shortDescription:
      "Plan formations on a stage grid, time them to an edited music mix, and export the piece as video.",
    longDescription:
      "Atriveo Dance is a workspace for choreographers. Place dancers on a stage, build and reuse formations, time them to a multi-song mix with crossfades and trims, and export the result as a WAV or a video. Projects sync across devices with an account.",
    category: "Creative",
    stage: "Live",
    featured: false,
    accent: "rose",
    monogram: "DA",
    technologies: ["React", "TypeScript", "Cloudflare Workers", "Web Audio"],
    highlights: [
      "Drag-and-drop formations with presets and undo",
      "Multi-song music editor synced to the timeline",
      "Video and audio export in the browser",
    ],
    links: [{ label: "Open Dance", href: "https://dance.atriveo.com", kind: "live" }],
  },
  {
    slug: "maps",
    name: "Atriveo Maps",
    shortName: "Maps",
    eyebrow: "Map poster generator",
    shortDescription:
      "Turn an address into a set of themed map posters with the exact spot marked.",
    longDescription:
      "Atriveo Maps geocodes an address, renders it at a chosen radius in 17 colour themes, and places an emoji marker on the centre point. It wraps the open-source maptoposter renderer with geocoding and marker compositing.",
    category: "Creative",
    stage: "In development",
    featured: false,
    accent: "green",
    monogram: "MP",
    technologies: ["Python", "OpenStreetMap", "Matplotlib"],
    highlights: [
      "Address in, 17 themed posters out",
      "True-distance radius around the point",
      "Theme-coloured emoji marker",
    ],
    links: [],
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
    media: {
      images: [
        {
          src: "/projects/reel/overview.webp",
          small: ["/projects/reel/overview-720.webp", 720],
          width: 1280,
          height: 786,
          alt: "Atriveo Reel: two source clips, a caption band between them, and a 1080×1920 rendered reel",
          caption: "Two clips, one vertical reel",
        },
      ],
      video: {
        src: "/projects/reel/recording.mp4",
        poster: "/projects/reel/recording-poster.webp",
        width: 1280,
        height: 786,
        label: "Overview animation",
      },
      socialImage: "/projects/reel/og.jpg",
    },
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
