import type { SourceQuality } from "@/lib/types";
import { domainOf } from "@/lib/urlSafety";

const REPUTABLE = [
  "wikipedia.org",
  "wikidata.org",
  "reuters.com",
  "apnews.com",
  "bbc.com",
  "bbc.co.uk",
  "nature.com",
  "science.org",
  "nih.gov",
  "cdc.gov",
  "nasa.gov",
  "noaa.gov",
  "sec.gov",
  "worldbank.org",
  "imf.org",
  "oecd.org",
  "un.org",
  "europa.eu",
];

const LOW = ["reddit.com", "quora.com", "facebook.com", "tiktok.com", "pinterest.com", "blogspot.com", "medium.com"];

function hostEnds(domain: string, root: string) {
  return domain === root || domain.endsWith(`.${root}`);
}

export function classifySource(url: string): { quality: SourceQuality; sourceType: string; domain: string } | null {
  const domain = domainOf(url);
  if (!domain) return null;
  if (domain.endsWith(".gov") || domain.endsWith(".gov.in") || domain.endsWith(".gov.uk") || domain.endsWith(".mil") || hostEnds(domain, "who.int")) {
    return { quality: "PRIMARY_OFFICIAL", sourceType: "official", domain };
  }
  if (REPUTABLE.some((root) => hostEnds(domain, root)) || domain.endsWith(".edu") || domain.endsWith(".ac.uk")) {
    return { quality: "SECONDARY_REPUTABLE", sourceType: hostEnds(domain, "wikipedia.org") ? "reference" : "reputable", domain };
  }
  if (LOW.some((root) => hostEnds(domain, root))) {
    return { quality: "LOW_CONFIDENCE", sourceType: "low-confidence", domain };
  }
  return { quality: "GENERAL", sourceType: "web", domain };
}
