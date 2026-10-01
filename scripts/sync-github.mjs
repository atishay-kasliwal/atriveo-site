import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = resolve(root, "src/data/github.generated.json");
const owner = "atishay-kasliwal";
const repositories = [
  "Atriveo-JD-Extractor",
  "atriveo-app",
  "job-pipeline",
  "atriveo-job-dock",
  "atriveo-cortex",
  "cortex-bio",
  "grants-gov-ai-finder",
  "atriveo-patent",
  "atriveo-knowledge",
  "atriveo-reel",
  "audiobook-atriveo",
];
const repositoryAllowlist = new Set(repositories.map((name) => `${owner}/${name}`.toLowerCase()));

const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "atriveo-site-build",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

async function getJson(url) {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  return response.json();
}

function cleanPublicText(value) {
  if (typeof value !== "string") return value;
  return value.replace(/\s*\u2014\s*/g, ": ");
}

function summarizeEvent(event) {
  const repo = event.repo?.name || "";
  const base = {
    id: event.id,
    type: event.type,
    repo,
    createdAt: event.created_at,
    url: repo ? `https://github.com/${repo}` : `https://github.com/${owner}`,
    label: "Updated public work",
  };

  if (event.type === "PushEvent") {
    return { ...base, label: `Pushed ${event.payload?.size || 1} change${event.payload?.size === 1 ? "" : "s"}` };
  }
  if (event.type === "PullRequestEvent") {
    const action = event.payload?.action || "updated";
    return { ...base, label: `${action[0]?.toUpperCase() || "U"}${action.slice(1)} a pull request` };
  }
  if (event.type === "ReleaseEvent") return { ...base, label: "Published a release" };
  if (event.type === "CreateEvent") return { ...base, label: `Created ${event.payload?.ref_type || "work"}` };
  return null;
}

async function main() {
  try {
    let existingData = null;
    try {
      existingData = JSON.parse(await readFile(outputPath, "utf8"));
    } catch {
      existingData = null;
    }

    const [repoResults, eventResults] = await Promise.all([
      Promise.all(
        repositories.map(async (name) => {
          const repo = await getJson(`https://api.github.com/repos/${owner}/${name}`);
          return {
            name: repo.name,
            fullName: repo.full_name,
            description: cleanPublicText(repo.description),
            url: repo.html_url,
            homepage: repo.homepage,
            language: repo.language,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            pushedAt: repo.pushed_at,
          };
        }),
      ),
      getJson(`https://api.github.com/users/${owner}/events/public?per_page=30`),
    ]);

    const events = eventResults
      .filter((event) => repositoryAllowlist.has(String(event.repo?.name || "").toLowerCase()))
      .map(summarizeEvent)
      .filter(Boolean)
      .slice(0, 8);
    const sortedRepositories = repoResults.sort((a, b) => Date.parse(b.pushedAt) - Date.parse(a.pushedAt));
    const publicSnapshot = { repositories: sortedRepositories, events };
    const existingSnapshot = existingData
      ? { repositories: existingData.repositories, events: existingData.events }
      : null;
    const snapshotChanged = JSON.stringify(publicSnapshot) !== JSON.stringify(existingSnapshot);
    const data = {
      generatedAt: snapshotChanged || !existingData?.generatedAt ? new Date().toISOString() : existingData.generatedAt,
      ...publicSnapshot,
    };

    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    console.log(`Synced ${data.repositories.length} public repositories and ${events.length} activity events.`);
  } catch (error) {
    try {
      await readFile(outputPath, "utf8");
      console.warn(`GitHub sync unavailable; keeping the committed snapshot. ${error.message}`);
    } catch {
      throw error;
    }
  }
}

await main();
