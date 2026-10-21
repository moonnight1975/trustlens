import { fuzzyTrust } from "@/lib/scoring/fuzzy";
import { scoreAnalysis } from "@/lib/scoring/score";
import { tcsAnalysis } from "@/lib/scoring/tcs";
import { alignmentOf, extractNumbers, numbersClose, overlapRatio } from "@/lib/text";
import type {
  AnalysisRecord,
  Claim,
  ClaimStatus,
  DraftClaim,
  EvidenceItem,
  LogicalIssue,
} from "@/lib/types";
import { isTimeSensitive, judgeClaim, monthsOld } from "@/lib/verify/judge";

export type ModelJudgment = {
  id: string;
  status: ClaimStatus;
  evidenceIds: string[];
  rationale: string;
};

const VALID_STATUS = new Set<ClaimStatus>([
  "SUPPORTED",
  "PARTIALLY_SUPPORTED",
  "CONTRADICTED",
  "UNVERIFIED",
  "NOT_APPLICABLE",
]);

function allowedEvidence(ids: string[], evidence: EvidenceItem[]) {
  const known = new Set(evidence.filter((e) => e.snippet.trim().length > 0).map((e) => e.id));
  return ids.filter((id) => known.has(id));
}

export function assembleVerification(input: {
  id: string;
  now?: Date;
  question: string;
  answer: string;
  answerSource: AnalysisRecord["answerSource"];
  generatorModel: string | null;
  drafts: DraftClaim[];
  evidence: EvidenceItem[];
  evidenceMode: "external" | "unavailable";
  evidenceNote: string | null;
  extraction: "model" | "heuristic";
  modelJudgments?: ModelJudgment[];
  modelIssues?: { claimIds: string[]; text: string }[];
  pipelineLog: string[];
}): AnalysisRecord {
  const now = input.now ?? new Date();
  const modelById = new Map((input.modelJudgments ?? []).map((j) => [j.id, j]));
  const evidenceById = new Map(input.evidence.map((e) => [e.id, e]));

  const claims: Claim[] = input.drafts.map((draft) => {
    if (draft.verifiability === "none" || draft.category === "opinion" || draft.category === "subjective") {
      return {
        ...draft,
        status: "NOT_APPLICABLE",
        confidence: 1,
        evidenceIds: [],
        rationale: "Opinion or subjective statement; not scored as a factual claim.",
        auditor: "lexical",
        temporalNote: null,
      };
    }
    if (input.evidenceMode === "unavailable") {
      return {
        ...draft,
        status: "UNVERIFIED",
        confidence: 0.3,
        evidenceIds: [],
        rationale: "External evidence verification unavailable.",
        auditor: "lexical",
        temporalNote: null,
      };
    }
    const lexical = judgeClaim(
      draft.text,
      input.evidence.map((e) => ({
        id: e.id,
        text: e.snippetKind === "citation-only" ? "" : e.snippet,
        quality: e.quality,
        pageUpdatedAt: e.pageUpdatedAt,
      })),
    );
    let status = lexical.status;
    let evidenceIds = lexical.evidenceIds;
    let rationale = lexical.rationale;
    let auditor: Claim["auditor"] = "lexical";
    let confidence = lexical.confidence;
    const model = modelById.get(draft.id);
    if (model && VALID_STATUS.has(model.status)) {
      const ids = allowedEvidence(model.evidenceIds, input.evidence);
      const modelNeedsEvidence =
        model.status === "SUPPORTED" || model.status === "PARTIALLY_SUPPORTED" || model.status === "CONTRADICTED";
      const lexicalHardConflict = lexical.rule === "number-conflict" || lexical.rule === "relation";
      if (modelNeedsEvidence && ids.length === 0) {
        rationale = `${rationale} The model status was ignored because it did not cite retrieved evidence.`;
      } else if (lexicalHardConflict && model.status === "SUPPORTED") {
        rationale = `${lexical.rationale} A numeric or relational conflict in the retrieved text overrides a model status of SUPPORTED.`;
      } else if (model.status === "NOT_APPLICABLE") {
        status = "NOT_APPLICABLE";
        evidenceIds = [];
        rationale = model.rationale.slice(0, 500);
        auditor = "model";
        confidence = 1;
      } else {
        status = model.status;
        evidenceIds = ids;
        rationale = model.rationale.slice(0, 500);
        auditor = "model";
        confidence = model.status === "SUPPORTED" ? 0.7 : model.status === "CONTRADICTED" ? 0.66 : 0.45;
      }
    }

    let temporalNote: string | null = null;
    if (isTimeSensitive(draft.text, draft.category) && status === "SUPPORTED") {
      const dates = evidenceIds
        .map((id) => evidenceById.get(id))
        .map((e) => e?.publishedAt || e?.pageUpdatedAt || null)
        .filter((d): d is string => Boolean(d));
      const ages = dates.map((d) => monthsOld(d, now)).filter((m): m is number => m != null);
      if (ages.length === 0) {
        temporalNote = "This claim looks time-sensitive and the retrieved sources have no date.";
        status = "PARTIALLY_SUPPORTED";
        rationale = `${rationale} ${temporalNote}`;
      } else if (Math.min(...ages) > 18) {
        temporalNote = `The newest linked source date is over 18 months old (${dates[0]}).`;
        status = "PARTIALLY_SUPPORTED";
        rationale = `${rationale} ${temporalNote} Supported was downgraded to partially supported.`;
      }
    }

    return {
      ...draft,
      status,
      confidence,
      evidenceIds,
      rationale,
      auditor,
      temporalNote,
    };
  });

  const issues: LogicalIssue[] = [];
  for (let i = 0; i < claims.length; i++) {
    for (let j = i + 1; j < claims.length; j++) {
      const a = claims[i];
      const b = claims[j];
      if (a.status === "NOT_APPLICABLE" || b.status === "NOT_APPLICABLE") continue;
      if (overlapRatio(a.text, b.text) < 0.5) continue;
      const na = extractNumbers(a.text).filter((n) => Math.abs(n) >= 3);
      const nb = extractNumbers(b.text).filter((n) => Math.abs(n) >= 3);
      if (na.length > 0 && nb.length > 0 && na.every((n) => !nb.some((m) => numbersClose(n, m)))) {
        issues.push({
          claimIds: [a.id, b.id],
          text: "These claims cover similar ground but use numbers that do not agree.",
          source: "heuristic",
        });
      }
    }
  }
  const knownIds = new Set(claims.map((c) => c.id));
  for (const issue of input.modelIssues ?? []) {
    const ids = issue.claimIds.filter((id) => knownIds.has(id));
    if (ids.length === 0 || !issue.text.trim()) continue;
    const key = [...ids].sort().join(",");
    if (issues.some((existing) => [...existing.claimIds].sort().join(",") === key)) continue;
    issues.push({ claimIds: ids, text: issue.text.slice(0, 400), source: "model" });
    if (issues.length >= 4) break;
  }

  const claimIds = new Map<string, string[]>();
  for (const claim of claims) {
    for (const id of claim.evidenceIds) {
      const list = claimIds.get(id) ?? [];
      list.push(claim.id);
      claimIds.set(id, list);
    }
  }
  const evidence = input.evidence.map((item) => ({
    ...item,
    claimIds: claimIds.get(item.id) ?? item.claimIds,
  }));

  const alignment = alignmentOf(input.question, input.answer);
  const scores = scoreAnalysis({
    claims,
    evidence,
    logicalIssueCount: Math.min(4, issues.length),
    alignment: alignment.score,
    evidenceAvailable: input.evidenceMode === "external",
  });

  const verifiable = claims.filter((c) => c.status !== "NOT_APPLICABLE");
  const weight = verifiable.reduce((s, c) => s + c.importance, 0) || 1;
  const contradiction =
    verifiable.length === 0
      ? 0
      : (100 * verifiable.filter((c) => c.status === "CONTRADICTED").reduce((s, c) => s + c.importance, 0)) / weight;
  const fuzzy = fuzzyTrust({
    support: scores.factuality ?? 0,
    contradiction,
    coverage: scores.evidenceCoverage ?? 0,
  });
  const tcs = tcsAnalysis({ fuzzyTrust: fuzzy.score, claims, evidence, now });

  return {
    id: input.id,
    createdAt: now.toISOString(),
    question: input.question,
    answer: input.answer,
    answerSource: input.answerSource,
    generatorModel: input.generatorModel,
    evidenceMode: input.evidenceMode,
    evidenceNote: input.evidenceNote,
    extraction: input.extraction,
    claims,
    evidence,
    logicalIssues: issues.slice(0, 4),
    scores: {
      ...scores,
      notes: [...scores.notes, `Alignment: ${alignment.reason}`],
    },
    fuzzy,
    tcs,
    pipelineLog: input.pipelineLog,
    improvement: null,
    improvedChildId: null,
  };
}
