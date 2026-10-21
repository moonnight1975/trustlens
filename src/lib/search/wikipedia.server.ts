import { classifySource } from "@/lib/search/quality";
import { stripTags } from "@/lib/text";
import { safeHttpUrl } from "@/lib/urlSafety";

export type WikiHit = {
  title: string;
  url: string;
  snippet: string;
  snippetKind: "extract" | "search-snippet";
  domain: string;
  publishedAt: null;
  pageUpdatedAt: string | null;
  provider: "wikipedia";
  quality: "SECONDARY_REPUTABLE";
  sourceType: string;
};

const UA = "TrustLens/1.0 (evidence verification; educational)";
const cache = new Map<string, { at: number; hits: WikiHit[] }>();

type SearchRow = { title?: string; snippet?: string; pageid?: number; timestamp?: string };
type ExtractPage = {
  title?: string;
  extract?: string;
  revisions?: { timestamp?: string }[];
};

async function wikiGet(url: URL) {
  const response = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Wikipedia returned ${response.status}`);
  return response.json() as Promise<unknown>;
}

export async function wikiSearch(query: string, limit = 2): Promise<WikiHit[]> {
  const key = `${query.trim().toLowerCase()}|${limit}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < 10 * 60 * 1000) return cached.hits;

  const searchUrl = new URL("https://en.wikipedia.org/w/api.php");
  searchUrl.searchParams.set("action", "query");
  searchUrl.searchParams.set("list", "search");
  searchUrl.searchParams.set("srsearch", query.slice(0, 180));
  searchUrl.searchParams.set("srlimit", String(limit));
  searchUrl.searchParams.set("format", "json");
  searchUrl.searchParams.set("utf8", "1");
  const searched = (await wikiGet(searchUrl)) as { query?: { search?: SearchRow[] } };
  const rows = searched.query?.search ?? [];
  const ids = rows.map((row) => row.pageid).filter((id): id is number => typeof id === "number");
  const extracts = new Map<number, ExtractPage>();
  if (ids.length > 0) {
    const extractUrl = new URL("https://en.wikipedia.org/w/api.php");
    extractUrl.searchParams.set("action", "query");
    extractUrl.searchParams.set("prop", "extracts|revisions");
    extractUrl.searchParams.set("rvprop", "timestamp");
    extractUrl.searchParams.set("exintro", "1");
    extractUrl.searchParams.set("explaintext", "1");
    extractUrl.searchParams.set("exchars", "1100");
    extractUrl.searchParams.set("pageids", ids.join("|"));
    extractUrl.searchParams.set("format", "json");
    extractUrl.searchParams.set("redirects", "1");
    const extracted = (await wikiGet(extractUrl)) as { query?: { pages?: Record<string, ExtractPage> } };
    for (const [id, page] of Object.entries(extracted.query?.pages ?? {})) {
      extracts.set(Number(id), page);
    }
  }

  const hits: WikiHit[] = [];
  for (const row of rows) {
    const title = row.title?.trim();
    if (!title || row.pageid == null) continue;
    const url = safeHttpUrl(`https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`);
    if (!url) continue;
    const classified = classifySource(url);
    if (!classified) continue;
    const page = extracts.get(row.pageid);
    const extract = page?.extract?.trim() ?? "";
    const snippet = extract || stripTags(row.snippet ?? "");
    if (!snippet) continue;
    hits.push({
      title: page?.title || title,
      url,
      snippet: snippet.slice(0, 1100),
      snippetKind: extract ? "extract" : "search-snippet",
      domain: classified.domain,
      publishedAt: null,
      pageUpdatedAt: page?.revisions?.[0]?.timestamp || row.timestamp || null,
      provider: "wikipedia",
      quality: "SECONDARY_REPUTABLE",
      sourceType: classified.sourceType,
    });
  }
  cache.set(key, { at: Date.now(), hits });
  if (cache.size > 60) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].at - b[1].at)[0];
    if (oldest) cache.delete(oldest[0]);
  }
  return hits;
}
