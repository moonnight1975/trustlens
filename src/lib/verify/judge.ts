import type { SourceQuality } from "@/lib/types";
import {
  contentWords,
  extractNumbers,
  numbersClose,
  overlapRatio,
  phraseConflict,
  relationValue,
  sentencesOf,
} from "@/lib/text";

export type EvidenceSnippet = {
  id: string;
  text: string;
  quality: SourceQuality;
  pageUpdatedAt?: string | null;
};

export type Judgment = {
  status: "SUPPORTED" | "PARTIALLY_SUPPORTED" | "CONTRADICTED" | "UNVERIFIED" | "NOT_APPLICABLE";
  confidence: number;
  evidenceIds: string[];
  rationale: string;
  rule: "opinion" | "relation" | "phrase" | "number-conflict" | "number-agree" | "overlap" | "partial" | "none" | "disagree";
};

const OPINION = new RegExp("\\b(i think|i believe|in my opinion|in my view|my favorite|my favourite)\\b", "i");

export function looksLikeOpinion(text: string) {
  return OPINION.test(text);
}

function salient(nums: number[]) {
  return nums.filter((n) => Math.abs(n) >= 3);
}

function bestSentence(claim: string, blob: string) {
  let best = { sentence: blob.slice(0, 500), overlap: overlapRatio(claim, blob) };
  for (const sentence of sentencesOf(blob)) {
    const overlap = overlapRatio(claim, sentence);
    if (overlap > best.overlap) best = { sentence, overlap };
  }
  return best;
}

function judgeOne(claim: string, evidence: EvidenceSnippet): Judgment & { overlap: number } {
  const { sentence, overlap } = bestSentence(claim, evidence.text);
  const claimRel = relationValue(claim);
  const evRel = relationValue(sentence) || relationValue(evidence.text);
  if (claimRel && evRel && claimRel.rel === evRel.rel && claimRel.value !== evRel.value) {
    return {
      status: "CONTRADICTED",
      confidence: 0.72,
      evidenceIds: [evidence.id],
      rationale: `Retrieved text names a different ${claimRel.rel} (${evRel.value}) than the claim (${claimRel.value}).`,
      rule: "relation",
      overlap,
    };
  }
  if (phraseConflict(claim, sentence) && overlap >= 0.3) {
    return {
      status: "CONTRADICTED",
      confidence: 0.66,
      evidenceIds: [evidence.id],
      rationale: "Retrieved text overlaps this claim but names a conflicting place or body.",
      rule: "phrase",
      overlap,
    };
  }
  const claimNums = salient(extractNumbers(claim));
  const evNums = salient(extractNumbers(sentence));
  const conflict =
    claimNums.length > 0 &&
    evNums.length > 0 &&
    overlap >= 0.4 &&
    claimNums.every((n) => !evNums.some((e) => numbersClose(n, e)));
  if (conflict) {
    return {
      status: "CONTRADICTED",
      confidence: 0.74,
      evidenceIds: [evidence.id],
      rationale: "A retrieved sentence overlaps this claim and contains a different number.",
      rule: "number-conflict",
      overlap,
    };
  }
  const agree =
    claimNums.length > 0 && claimNums.every((n) => evNums.some((e) => numbersClose(n, e))) && overlap >= 0.35;
  if (agree) {
    return {
      status: "SUPPORTED",
      confidence: 0.78,
      evidenceIds: [evidence.id],
      rationale: "The distinctive numbers in the claim appear in the retrieved text, along with overlapping wording.",
      rule: "number-agree",
      overlap,
    };
  }
  if (overlap >= 0.62 && claimNums.every((n) => evNums.some((e) => numbersClose(n, e)) || evNums.length === 0)) {
    if (claimNums.length > 0 && evNums.length === 0) {
      return {
        status: "PARTIALLY_SUPPORTED",
        confidence: 0.48,
        evidenceIds: [evidence.id],
        rationale: "Retrieved text overlaps the claim, but it does not contain the claim's number.",
        rule: "partial",
        overlap,
      };
    }
    return {
      status: "SUPPORTED",
      confidence: 0.64,
      evidenceIds: [evidence.id],
      rationale: "Most of the claim's distinctive words appear in the retrieved text. This is overlap, not proof.",
      rule: "overlap",
      overlap,
    };
  }
  if (overlap >= 0.38) {
    return {
      status: "PARTIALLY_SUPPORTED",
      confidence: 0.46,
      evidenceIds: [evidence.id],
      rationale: "Retrieved text overlaps this claim but does not confirm every detail.",
      rule: "partial",
      overlap,
    };
  }
  return {
    status: "UNVERIFIED",
    confidence: 0.3,
    evidenceIds: [],
    rationale: "No retrieved extract overlapped this claim enough to verify it.",
    rule: "none",
    overlap,
  };
}

export function judgeClaim(claim: string, evidence: EvidenceSnippet[]): Judgment {
  if (looksLikeOpinion(claim)) {
    return {
      status: "NOT_APPLICABLE",
      confidence: 1,
      evidenceIds: [],
      rationale: "Opinion or subjective statement; not scored as a factual claim.",
      rule: "opinion",
    };
  }
  const usable = evidence.filter((e) => e.text.trim().length > 0);
  if (usable.length === 0) {
    return {
      status: "UNVERIFIED",
      confidence: 0.3,
      evidenceIds: [],
      rationale: "No retrieved text was available for this claim.",
      rule: "none",
    };
  }
  const judged = usable.map((item) => ({ item, judgment: judgeOne(claim, item) }));
  const contradicted = judged.filter((j) => j.judgment.status === "CONTRADICTED");
  const supported = judged.filter((j) => j.judgment.status === "SUPPORTED");
  if (contradicted.length > 0 && supported.length > 0) {
    return {
      status: "PARTIALLY_SUPPORTED",
      confidence: 0.44,
      evidenceIds: [...supported, ...contradicted].map((j) => j.item.id),
      rationale: "Retrieved sources disagree: at least one overlaps in support and another conflicts.",
      rule: "disagree",
    };
  }
  if (contradicted.length > 0) {
    const best = contradicted.sort((a, b) => b.judgment.overlap - a.judgment.overlap)[0];
    return best.judgment;
  }
  if (supported.length > 0) {
    return supported.sort((a, b) => b.judgment.overlap - a.judgment.overlap)[0].judgment;
  }
  const partial = judged.filter((j) => j.judgment.status === "PARTIALLY_SUPPORTED");
  if (partial.length > 0) return partial.sort((a, b) => b.judgment.overlap - a.judgment.overlap)[0].judgment;
  return {
    status: "UNVERIFIED",
    confidence: 0.3,
    evidenceIds: [],
    rationale: "No retrieved extract overlapped this claim enough to verify it.",
    rule: "none",
  };
}

export function searchQueryFor(text: string) {
  const words = contentWords(text).slice(0, 8);
  const query = words.join(" ");
  return query.length >= 3 ? query : text.replace(new RegExp("\\s+", "g"), " ").trim().slice(0, 120);
}

const TIME_SENSITIVE = new RegExp(
  "\\b(current|currently|today|this year|as of|price|president|prime minister|ceo|law)\\b",
  "i",
);

export function isTimeSensitive(text: string, category: string) {
  return category === "financial" || category === "statistical" || category === "temporal" || TIME_SENSITIVE.test(text);
}

export function monthsOld(iso: string | null, now: Date) {
  if (!iso) return null;
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return null;
  return (now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
}
