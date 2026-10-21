import type { ClaimCategory, DraftClaim } from "@/lib/types";
import { looksLikeOpinion, searchQueryFor } from "@/lib/verify/judge";
import { extractNumbers } from "@/lib/text";

function categoryFor(text: string): ClaimCategory {
  if (looksLikeOpinion(text)) return "opinion";
  if (/\b(i feel|seems|arguably|beautiful|ugly)\b/i.test(text)) return "subjective";
  if (/[$€£]|percent|%|\b(revenue|profit|stock|gdp|inflation|price)\b/i.test(text)) return "financial";
  if (/\b(percent|percentage|average|median|rate|statistics|survey)\b/i.test(text)) return "statistical";
  if (/\b(1[0-9]{3}|20[0-9]{2})\b/.test(text) && /\b(in|on|year|century|founded|born)\b/i.test(text)) return "historical";
  if (/\b(today|currently|as of|this year|since)\b/i.test(text)) return "temporal";
  if (/\b(city|country|capital|river|mountain|located|continent)\b/i.test(text)) return "geographical";
  if (/\b(atom|species|planet|chemical|physics|disease|vaccine|gene|light|energy)\b/i.test(text)) return "scientific";
  if (extractNumbers(text).some((n) => Math.abs(n) >= 3)) return "numerical";
  return "factual";
}

export function heuristicClaims(answer: string, limit = 5): DraftClaim[] {
  const sentences = answer
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 24 && !s.endsWith("?"));
  const drafts: DraftClaim[] = [];
  let n = 1;
  for (const text of sentences) {
    const category = categoryFor(text);
    const opinion = category === "opinion" || category === "subjective";
    const nums = extractNumbers(text).filter((x) => Math.abs(x) >= 3);
    const importance = opinion ? 1 : nums.length > 0 ? 5 : text.length > 90 ? 4 : 3;
    const verifiability = opinion ? "none" : nums.length > 0 || /[A-Z][a-z]/.test(text) ? "high" : "medium";
    drafts.push({
      id: `c${n++}`,
      text: text.slice(0, 500),
      category,
      importance,
      verifiability,
      searchQuery: searchQueryFor(text),
    });
  }
  drafts.sort((a, b) => b.importance - a.importance || b.text.length - a.text.length);
  const seen = new Set<string>();
  const unique: DraftClaim[] = [];
  for (const draft of drafts) {
    const key = draft.text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push({ ...draft, id: `c${unique.length + 1}` });
    if (unique.length >= limit) break;
  }
  return unique;
}
