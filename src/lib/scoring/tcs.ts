import type { Claim, EvidenceItem, TcsResult } from "@/lib/types";

const TIME_SENSITIVE = new RegExp(
  "\\b(current|currently|today|this year|as of|price|president|prime minister|ceo|law|rate|inflation)\\b",
  "i",
);

function monthsBetween(iso: string, now: Date) {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return null;
  return (now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
}

/** Trust–confidence–stability. Confidence is an interval, not a second trust score. */
export function tcsAnalysis(input: {
  fuzzyTrust: number;
  claims: Claim[];
  evidence: EvidenceItem[];
  now?: Date;
}): TcsResult {
  const now = input.now ?? new Date();
  const narrative: string[] = [];
  const trust = Math.round(Math.min(100, Math.max(0, input.fuzzyTrust)));

  const factual = input.claims.filter((c) => c.status !== "NOT_APPLICABLE");
  const meanConf =
    factual.length === 0 ? 40 : (factual.reduce((s, c) => s + c.confidence, 0) / factual.length) * 100;
  let confidence = meanConf;
  if (input.evidence.length > 0) confidence += Math.min(15, input.evidence.length * 3);
  const lowSources = input.evidence.filter((e) => e.quality === "LOW_CONFIDENCE").length;
  if (input.evidence.length > 0 && lowSources / input.evidence.length >= 0.5) {
    confidence -= 12;
    narrative.push("At least half of the retrieved sources are low-confidence, so the confidence interval is wider.");
  }
  confidence = Math.round(Math.min(100, Math.max(0, confidence)));
  const half = Math.round(Math.max(6, (100 - confidence) * 0.35));
  const confidenceLow = Math.max(0, confidence - half);
  const confidenceHigh = Math.min(100, confidence + half);

  const sensitive = input.claims.filter(
    (c) =>
      c.category === "financial" ||
      c.category === "statistical" ||
      c.category === "temporal" ||
      TIME_SENSITIVE.test(c.text),
  );
  let stability = sensitive.length === 0 ? 85 : 70;
  if (sensitive.length === 0) {
    narrative.push("No time-sensitive claims were flagged, so stability stays high.");
  } else {
    narrative.push(`${sensitive.length} claim(s) look time-sensitive (prices, office-holders, rates, or dated facts).`);
    const dated = input.evidence.filter((e) => e.pageUpdatedAt || e.publishedAt);
    if (dated.length === 0) {
      stability -= 20;
      narrative.push("Those claims have no publication or page-update date on the retrieved sources.");
    } else {
      const old = dated.filter((e) => {
        const iso = e.publishedAt || e.pageUpdatedAt;
        if (!iso) return false;
        const months = monthsBetween(iso, now);
        return months != null && months > 18;
      });
      if (old.length > 0) {
        stability -= 15;
        narrative.push("Some retrieved pages were last updated more than 18 months ago. That is a page date, not proof the fact changed.");
      }
    }
  }
  stability = Math.round(Math.min(100, Math.max(0, stability)));
  const composite = Math.round(0.5 * trust + 0.3 * confidence + 0.2 * stability);
  narrative.unshift(
    `TCS composite ${composite} = 50% fuzzy trust (${trust}) + 30% confidence (${confidence}, interval ${confidenceLow}–${confidenceHigh}) + 20% stability (${stability}).`,
  );
  narrative.push("User feedback and this index are not ground truth, and this module does not train a model.");
  return { trust, confidence, confidenceLow, confidenceHigh, stability, composite, narrative };
}
