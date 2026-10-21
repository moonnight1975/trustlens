import { parseJsonObject } from "@/lib/ai/grok.server";
import { getActiveServerSettings } from "@/lib/ai/settings.server";
import { classifySource } from "@/lib/search/quality";
import { fetchPublicExcerpt } from "@/lib/search/fetchPage.server";
import { wikiSearch, type WikiHit } from "@/lib/search/wikipedia.server";
import { safeHttpUrl } from "@/lib/urlSafety";
import type { EvidenceItem, SnippetKind, SourceQuality } from "@/lib/types";

export type RawHit = {
  title: string;
  url: string;
  snippet: string;
  snippetKind: SnippetKind;
  domain: string;
  publishedAt: string | null;
  pageUpdatedAt: string | null;
  provider: string;
  quality: SourceQuality;
  sourceType: string;
};

async function braveSearch(query: string): Promise<RawHit[]> {
  const key = process.env.BRAVE_SEARCH_API_KEY;
  if (!key) return [];
  const url = new URL("https://api.search.brave.com/res/v1/web/search");
  url.searchParams.set("q", query.slice(0, 180));
  url.searchParams.set("count", "3");
  const response = await fetch(url, {
    headers: { Accept: "application/json", "X-Subscription-Token": key },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return [];
  const payload = (await response.json()) as {
    web?: { results?: { title?: string; url?: string; description?: string; age?: string }[] };
  };
  const hits: RawHit[] = [];
  for (const row of payload.web?.results ?? []) {
    const safe = safeHttpUrl(row.url ?? "");
    if (!safe || !row.title || !row.description) continue;
    const classified = classifySource(safe);
    if (!classified) continue;
    hits.push({
      title: row.title.slice(0, 200),
      url: safe,
      snippet: row.description.slice(0, 500),
      snippetKind: "search-snippet",
      domain: classified.domain,
      publishedAt: null,
      pageUpdatedAt: null,
      provider: "brave",
      quality: classified.quality,
      sourceType: classified.sourceType,
    });
  }
  return hits;
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function htmlText(value: string) {
  return decodeHtml(value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
}

async function duckDuckGoSearch(query: string): Promise<RawHit[]> {
  const url = new URL("https://html.duckduckgo.com/html/");
  url.searchParams.set("q", query.slice(0, 180));
  const response = await fetch(url, {
    headers: { Accept: "text/html", "User-Agent": "Mozilla/5.0 (compatible; TrustLens/1.0; evidence search)" },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return [];
  const html = await response.text();
  const hits: RawHit[] = [];
  const matches = [...html.matchAll(/<a\b(?=[^>]*\bclass=["'][^"']*result__a)[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  for (const [index, match] of matches.entries()) {
    let candidate = decodeHtml(match[1]);
    try {
      const redirect = new URL(candidate, "https://html.duckduckgo.com");
      candidate = redirect.searchParams.get("uddg") || candidate;
    } catch {
      continue;
    }
    const safe = safeHttpUrl(candidate);
    const title = htmlText(match[2]);
    if (!safe || !title || new URL(safe).hostname.endsWith("duckduckgo.com")) continue;
    const classified = classifySource(safe);
    if (!classified) continue;
    const block = html.slice(match.index ?? 0, matches[index + 1]?.index ?? html.length);
    const excerptMatch = block.match(/<(?:a|div)\b[^>]*\bclass=["'][^"']*result__snippet[^"']*["'][^>]*>([\s\S]*?)<\/(?:a|div)>/i);
    const snippet = excerptMatch ? htmlText(excerptMatch[1]).slice(0, 500) : "";
    hits.push({
      title: title.slice(0, 200),
      url: safe,
      snippet,
      snippetKind: snippet ? "search-snippet" : "citation-only",
      domain: classified.domain,
      publishedAt: null,
      pageUpdatedAt: null,
      provider: "duckduckgo",
      quality: classified.quality,
      sourceType: classified.sourceType,
    });
    if (hits.length >= 4) break;
  }
  return hits;
}

async function xaiCitations(query: string): Promise<RawHit[]> {
  const settings = getActiveServerSettings();
  const apiKey = (settings.provider === "xai" ? settings.apiKey : "") || process.env.XAI_API_KEY;
  if (!apiKey) return [];
  const response = await fetch("https://api.x.ai/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(25_000),
    body: JSON.stringify({
      model: "grok-4.5",
      input: [
        {
          role: "user",
          content: `Search for sources about: ${query.slice(0, 240)}. Do not answer from memory if search returns nothing.`,
        },
      ],
      tools: [{ type: "web_search" }],
      max_output_tokens: 400,
    }),
  });
  if (!response.ok) return [];
  const payload = (await response.json()) as { citations?: unknown; output_text?: string };
  let urls: string[] = [];
  if (Array.isArray(payload.citations)) {
    urls = payload.citations.filter((item): item is string => typeof item === "string");
  } else if (payload.output_text) {
    try {
      const parsed = parseJsonObject(payload.output_text) as { citations?: string[] };
      if (Array.isArray(parsed.citations)) urls = parsed.citations;
    } catch {
      urls = [];
    }
  }
  const hits: RawHit[] = [];
  for (const candidate of urls.slice(0, 3)) {
    const safe = safeHttpUrl(candidate);
    if (!safe) continue;
    const classified = classifySource(safe);
    if (!classified) continue;
    let snippet = "";
    let snippetKind: SnippetKind = "citation-only";
    if (!classified.domain.endsWith("wikipedia.org")) {
      const excerpt = await fetchPublicExcerpt(safe, query).catch(() => null);
      if (excerpt) {
        snippet = excerpt;
        snippetKind = "page-excerpt";
      }
    }
    hits.push({
      title: classified.domain,
      url: safe,
      snippet,
      snippetKind,
      domain: classified.domain,
      publishedAt: null,
      pageUpdatedAt: null,
      provider: "xai-web",
      quality: classified.quality,
      sourceType: classified.sourceType,
    });
  }
  return hits;
}

function fromWiki(hit: WikiHit): RawHit {
  return { ...hit };
}

export async function searchEvidence(queries: string[]): Promise<{ hits: RawHit[]; note: string | null; mode: "external" | "unavailable" }> {
  const unique = [...new Set(queries.map((q) => q.trim()).filter((q) => q.length > 2))].slice(0, 5);
  const collected: RawHit[] = [];
  const errors: string[] = [];
  await Promise.all(
    unique.map(async (query) => {
      try {
        const wiki = await wikiSearch(query, 2);
        collected.push(...wiki.map(fromWiki));
      } catch (error) {
        errors.push(error instanceof Error ? error.message : "Wikipedia search failed");
      }
      try {
        const braveHits = await braveSearch(query);
        collected.push(...braveHits);
        if (braveHits.length === 0) collected.push(...(await duckDuckGoSearch(query)));
      } catch {
        try {
          collected.push(...(await duckDuckGoSearch(query)));
        } catch {
          errors.push("Web search failed");
        }
      }
    }),
  );
  if (collected.length < 2 && unique[0]) {
    try {
      collected.push(...(await xaiCitations(unique[0])));
    } catch {
      errors.push("Web search provider failed");
    }
  }
  const seen = new Set<string>();
  const hits = collected.filter((hit) => {
    if (seen.has(hit.url)) return false;
    seen.add(hit.url);
    return true;
  }).slice(0, 8);
  if (hits.length === 0) {
    return {
      hits: [],
      note: errors[0] ? `External evidence verification unavailable. ${errors[0]}` : "External evidence verification unavailable. No sources were retrieved.",
      mode: "unavailable",
    };
  }
  const note = hits.every((hit) => hit.provider === "wikipedia")
    ? "Sources are Wikipedia extracts (a reference, not a primary document). Page update time is not the date of the event."
    : null;
  return { hits, note, mode: "external" };
}

export function toEvidence(hits: RawHit[], retrievedAt: string): EvidenceItem[] {
  return hits.map((hit, index) => ({
    id: `e${index + 1}`,
    title: hit.title,
    url: hit.url,
    domain: hit.domain,
    snippet: hit.snippet,
    snippetKind: hit.snippetKind,
    publishedAt: hit.publishedAt,
    pageUpdatedAt: hit.pageUpdatedAt,
    eventDate: null,
    retrievedAt,
    quality: hit.quality,
    sourceType: hit.sourceType,
    provider: hit.provider,
    claimIds: [],
  }));
}
