import { z } from "zod";

import { grokChat, parseJsonObject, takeRateToken } from "@/lib/ai/grok.server";
import { MULTI_MODELS, PRIMARY_MODEL } from "@/lib/ai/models";
import { getActiveServerSettings } from "@/lib/ai/settings.server";
import { searchEvidence, toEvidence } from "@/lib/search/webSearch.server";
import type { ClaimCategory, DraftClaim, EvidenceItem } from "@/lib/types";
import { CLAIM_CATEGORIES, CLAIM_STATUSES } from "@/lib/types";
import { assembleVerification, type ModelJudgment } from "@/lib/verify/assemble";
import { heuristicClaims } from "@/lib/verify/extract";
import { safeHttpUrl, sameUrl } from "@/lib/urlSafety";

const limit = 5;

const AnalyzeInput = z.object({
  question: z.string().trim().min(3).max(4000),
  answer: z.string().trim().min(1).max(16000),
  answerSource: z.enum(["user", "generated", "improved"]).optional(),
  generatorModel: z.string().max(80).nullable().optional(),
});

const VerifyClaimInput = z.object({ claim: z.string().trim().min(3).max(4000) });

const GenerateInput = z.object({
  question: z.string().trim().min(3).max(4000),
});

const MultiInput = z.object({
  question: z.string().trim().min(3).max(4000),
  models: z.array(z.string()).min(1).max(3),
});

const EvidenceInput = z.object({
  id: z.string().max(40),
  title: z.string().max(300),
  url: z.string().max(500),
  snippet: z.string().max(1500),
  snippetKind: z.enum(["extract", "search-snippet", "page-excerpt", "citation-only"]),
  pageUpdatedAt: z.string().max(40).nullable(),
  publishedAt: z.string().max(40).nullable(),
  quality: z.enum(["PRIMARY_OFFICIAL", "SECONDARY_REPUTABLE", "GENERAL", "LOW_CONFIDENCE"]),
});

const ImproveInput = z.object({
  question: z.string().trim().min(3).max(4000),
  answer: z.string().trim().min(1).max(16000),
  trustScore: z.number().min(0).max(100),
  riskLevel: z.string().max(20),
  claims: z
    .array(
      z.object({
        text: z.string().max(500),
        status: z.enum(CLAIM_STATUSES),
        rationale: z.string().max(500),
      }),
    )
    .max(8),
  evidence: z.array(EvidenceInput).max(12),
  auditNotes: z.array(z.string().max(400)).max(8),
});

const ExtractSchema = z.object({
  claims: z
    .array(
      z.object({
        text: z.string().min(8).max(500),
        category: z.enum(CLAIM_CATEGORIES),
        importance: z.number().min(1).max(5),
        verifiability: z.enum(["high", "medium", "low", "none"]),
        searchQuery: z.string().min(2).max(180),
      }),
    )
    .max(8),
});

const AuditSchema = z.object({
  claims: z
    .array(
      z.object({
        id: z.string(),
        status: z.enum(CLAIM_STATUSES),
        evidenceIds: z.array(z.string()).max(6),
        rationale: z.string().max(500),
      }),
    )
    .max(8),
  logicalIssues: z
    .array(z.object({ claimIds: z.array(z.string()).max(4), text: z.string().max(400) }))
    .max(6)
    .optional(),
});

const ImproveSchema = z.object({
  improvedAnswer: z.string().min(20).max(8000),
  corrections: z
    .array(
      z.object({
        originalClaim: z.string().max(500),
        correction: z.string().max(500),
        reason: z.string().max(500),
      }),
    )
    .max(12),
  sourcesUsed: z.array(z.object({ title: z.string().max(300), url: z.string().max(500) })).max(12),
  uncertainties: z.array(z.string().max(400)).max(8),
});

function fail(error: string) {
  return { ok: false as const, error };
}

function allowedUrls(evidence: { url: string }[]) {
  const set = new Set<string>();
  for (const item of evidence) {
    const safe = safeHttpUrl(item.url);
    if (safe) set.add(safe.replace(/\/$/, ""));
  }
  return set;
}

function stripUnknownUrls(text: string, allowed: Set<string>) {
  let removed = 0;
  const next = text.replace(/https?:\/\/[^\s)]+/g, (url) => {
    const safe = safeHttpUrl(url.replace(/[.,;]+$/, ""));
    if (safe && allowed.has(safe.replace(/\/$/, ""))) return url;
    removed += 1;
    return "";
  });
  return { text: next.replace(/\s{2,}/g, " ").trim(), removed };
}

async function extractClaims(question: string, answer: string, log: string[]) {
  const model = await grokChat({
    system:
      "Extract externally checkable claims from an AI answer. Return JSON only with key claims. Do not score. Do not invent claims that are not in the answer. Prefer 3 to 5 factual claims. Mark opinions with category opinion and verifiability none. searchQuery is a short query with no assumed result.",
    user: JSON.stringify({ question, answer: answer.slice(0, 8000) }),
    maxTokens: 900,
    json: true,
  });
  if (!model.ok) {
    log.push(`Claim extraction used the heuristic splitter because the model was unavailable. ${model.error}`);
    return { drafts: heuristicClaims(answer, limit), extraction: "heuristic" as const };
  }
  try {
    const parsed = ExtractSchema.parse(parseJsonObject(model.text));
    const drafts: DraftClaim[] = parsed.claims.slice(0, limit).map((claim, index) => ({
      id: `c${index + 1}`,
      text: claim.text,
      category: claim.category as ClaimCategory,
      importance: Math.round(claim.importance),
      verifiability: claim.verifiability,
      searchQuery: claim.searchQuery,
    }));
    if (drafts.length === 0) throw new Error("no claims");
    log.push("Claim extraction: model.");
    return { drafts, extraction: "model" as const };
  } catch {
    log.push("Claim extraction fell back to the heuristic splitter because the model JSON was invalid.");
    return { drafts: heuristicClaims(answer, limit), extraction: "heuristic" as const };
  }
}

async function auditClaims(question: string, drafts: DraftClaim[], evidence: EvidenceItem[], log: string[]) {
  if (evidence.length === 0) return { judgments: [] as ModelJudgment[], issues: [] as { claimIds: string[]; text: string }[] };
  const model = await grokChat({
    system:
      "Compare claims ONLY to the evidence objects provided. Return JSON only. status is SUPPORTED, PARTIALLY_SUPPORTED, CONTRADICTED, UNVERIFIED, or NOT_APPLICABLE. Use CONTRADICTED only when the provided text conflicts. If evidence is missing, use UNVERIFIED. evidenceIds must come from the input. Do not invent ids, urls, quotations, or a numeric trust score. logicalIssues are contradictions inside the answer; claimIds must be real. rationale must not add new facts.",
    user: JSON.stringify({
      question,
      claims: drafts.map((claim) => ({ id: claim.id, text: claim.text, category: claim.category })),
      evidence: evidence.map((item) => ({
        id: item.id,
        title: item.title,
        url: item.url,
        snippet: item.snippet.slice(0, 900),
        snippetKind: item.snippetKind,
        quality: item.quality,
        pageUpdatedAt: item.pageUpdatedAt,
      })),
    }),
    maxTokens: 1000,
    json: true,
    timeoutMs: 45_000,
  });
  if (!model.ok) {
    log.push(`Model auditor unavailable. Lexical comparison was used. ${model.error}`);
    return { judgments: [] as ModelJudgment[], issues: [] as { claimIds: string[]; text: string }[] };
  }
  try {
    const parsed = AuditSchema.parse(parseJsonObject(model.text));
    const allowed = new Set(evidence.map((item) => item.url));
    log.push("Model auditor returned claim statuses. The trust score is still calculated in code.");
    return {
      judgments: parsed.claims.map((claim) => ({
        id: claim.id,
        status: claim.status,
        evidenceIds: claim.evidenceIds,
        rationale: stripUnknownUrls(claim.rationale, new Set([...allowed].map((url) => url.replace(/\/$/, "")))).text,
      })),
      issues: parsed.logicalIssues ?? [],
    };
  } catch {
    log.push("Model auditor JSON was invalid. Lexical comparison was used.");
    return { judgments: [] as ModelJudgment[], issues: [] as { claimIds: string[]; text: string }[] };
  }
}

export async function runClaimVerification(raw: unknown) {
  const parsed = VerifyClaimInput.safeParse(raw);
  if (!parsed.success) return fail("Enter a claim of at least 3 characters.");
  const claim = parsed.data.claim;
  return runAnalysis(
    { question: claim, answer: claim, answerSource: "user", generatorModel: null },
    claim,
  );
}

export async function runAnalysis(raw: unknown, directClaim?: string) {
  const parsed = AnalyzeInput.safeParse(raw);
  if (!parsed.success) return fail("Enter a question and an answer. Text length limits apply.");
  if (!takeRateToken()) return fail("Too many verification requests. Wait a minute and try again.");
  const { question, answer } = parsed.data;
  const log: string[] = [];
  const { drafts, extraction } = directClaim
    ? {
        drafts: [
          {
            id: "c1",
            text: directClaim,
            category: "factual" as ClaimCategory,
            importance: 4,
            verifiability: "high" as const,
            searchQuery: directClaim,
          },
        ],
        extraction: "heuristic" as const,
      }
    : await extractClaims(question, answer, log);
  if (directClaim) log.push("Web Verify searched the submitted question or claim directly.");
  let evidence: EvidenceItem[] = [];
  let evidenceMode: "external" | "unavailable" = "unavailable";
  let evidenceNote: string | null = "External evidence verification unavailable.";
  if (drafts.some((claim) => claim.verifiability !== "none")) {
    const queries = drafts.filter((claim) => claim.verifiability !== "none").map((claim) => claim.searchQuery);
    try {
      const searched = await searchEvidence(queries);
      evidenceMode = searched.mode;
      evidenceNote = searched.note;
      evidence = toEvidence(searched.hits, new Date().toISOString());
      log.push(
        searched.mode === "external"
          ? `Retrieved ${evidence.length} source(s). Snippets are labeled as extracts, search snippets, or page excerpts.`
          : evidenceNote || "External evidence verification unavailable.",
      );
    } catch {
      log.push("External evidence verification unavailable. Search failed.");
    }
  } else {
    evidenceNote = "No verifiable factual claims were extracted.";
    log.push(evidenceNote);
  }
  const audit = evidenceMode === "external" ? await auditClaims(question, drafts, evidence, log) : { judgments: [], issues: [] };
  if (evidenceMode !== "external") log.push("Statuses are unverified because external evidence was not available.");
  const record = assembleVerification({
    id: crypto.randomUUID(),
    question,
    answer,
    answerSource: parsed.data.answerSource ?? "user",
    generatorModel: parsed.data.generatorModel ?? null,
    drafts,
    evidence,
    evidenceMode,
    evidenceNote,
    extraction,
    modelJudgments: audit.judgments,
    modelIssues: audit.issues,
    pipelineLog: log,
  });
  return { ok: true as const, record };
}

export async function generateAnswer(raw: unknown) {
  const parsed = GenerateInput.safeParse(raw);
  if (!parsed.success) return fail("Enter a question of at least 3 characters.");
  if (!takeRateToken()) return fail("Too many requests. Wait a minute and try again.");
  const activeConfig = getActiveServerSettings();
  const result = await grokChat({
    model: activeConfig.primaryModel || PRIMARY_MODEL,
    system:
      "Answer the question directly and concisely. If you are unsure, say so. Do not claim you searched the live web. This answer will be verified separately and is not itself a verification.",
    user: parsed.data.question,
    maxTokens: 700,
    temperature: activeConfig.temperature ?? 0.3,
  });
  if (!result.ok) return fail(result.error);
  return { ok: true as const, answer: result.text, model: result.model };
}

export async function askOne(raw: unknown) {
  const parsed = z.object({ question: z.string().trim().min(3).max(4000), model: z.string().max(80) }).safeParse(raw);
  if (!parsed.success) return fail("Enter a question and a configured model.");
  const activeConfig = getActiveServerSettings();
  const isPrimary = parsed.data.model === activeConfig.primaryModel;
  const known = MULTI_MODELS.find((model) => model.id === parsed.data.model);
  if (!known && !isPrimary) return fail("That model is not configured.");
  const label = isPrimary ? (activeConfig.modelLabel || activeConfig.primaryModel) : (known?.label || parsed.data.model);
  if (!takeRateToken()) return fail("Too many requests. Wait a minute and try again.");
  const result = await grokChat({
    model: parsed.data.model,
    system: "Answer the question directly. If you are unsure, say so. Do not invent citations.",
    user: parsed.data.question,
    maxTokens: 600,
    temperature: 0.3,
    timeoutMs: 40_000,
  });
  if (!result.ok) return { ok: true as const, result: { model: parsed.data.model, label, ok: false as const, text: "", error: result.error } };
  return { ok: true as const, result: { model: parsed.data.model, label, ok: true as const, text: result.text, error: null } };
}

export async function askModels(raw: unknown) {
  const parsed = MultiInput.safeParse(raw);
  if (!parsed.success) return fail("Enter a question and at least one model.");
  if (!takeRateToken()) return fail("Too many requests. Wait a minute and try again.");
  const activeConfig = getActiveServerSettings();
  const allowed = new Map<string, string>(MULTI_MODELS.map((model) => [model.id, model.label]));
  if (activeConfig.primaryModel && !allowed.has(activeConfig.primaryModel)) {
    allowed.set(activeConfig.primaryModel, `${activeConfig.modelLabel || activeConfig.primaryModel} (Primary)`);
  }
  const chosen = parsed.data.models.filter((id) => allowed.has(id));
  if (chosen.length === 0) return fail("None of the selected models are configured.");
  const results = await Promise.all(
    chosen.map(async (id) => {
      const label = allowed.get(id) || id;
      const result = await grokChat({
        model: id,
        system: "Answer the question directly. If you are unsure, say so. Do not invent citations.",
        user: parsed.data.question,
        maxTokens: 600,
        temperature: 0.3,
        timeoutMs: 40_000,
      });
      if (!result.ok) return { model: id, label, ok: false as const, text: "", error: result.error };
      return { model: id, label, ok: true as const, text: result.text, error: null };
    }),
  );
  return { ok: true as const, results };
}

export async function improveDraft(raw: unknown) {
  const parsed = ImproveInput.safeParse(raw);
  if (!parsed.success) return fail("The improvement request was missing claim or evidence details.");
  if (parsed.data.trustScore >= 85) {
    return fail("This answer already meets the 85 trust threshold, so improvement is not offered.");
  }
  if (!takeRateToken()) return fail("Too many requests. Wait a minute and try again.");
  const gaps = parsed.data.claims.filter((claim) => claim.status === "UNVERIFIED" || claim.status === "CONTRADICTED");
  let evidence = parsed.data.evidence.filter((item) => safeHttpUrl(item.url));
  if (gaps.length > 0) {
    try {
      const extra = await searchEvidence(gaps.slice(0, 2).map((claim) => claim.text.slice(0, 160)));
      const retrievedAt = new Date().toISOString();
      const mapped = toEvidence(extra.hits, retrievedAt).filter((item) => !evidence.some((existing) => sameUrl(existing.url, item.url)));
      evidence = [...evidence, ...mapped].slice(0, 12);
    } catch {
      /* existing evidence still stands */
    }
  }
  const allowed = allowedUrls(evidence);
  const model = await grokChat({
    system:
      "Revise the answer so it is more accurate using ONLY the evidence JSON. Return JSON with improvedAnswer, corrections, sourcesUsed, uncertainties. Do not invent facts, numbers, quotations, or urls. Every url must be copied from the evidence list. If evidence is insufficient, say so. Do not try to maximize a score. Preserve accurate parts of the original answer. Answer the original question.",
    user: JSON.stringify({
      question: parsed.data.question,
      originalAnswer: parsed.data.answer,
      originalTrustScore: parsed.data.trustScore,
      riskLevel: parsed.data.riskLevel,
      claims: parsed.data.claims,
      evidence,
      auditNotes: parsed.data.auditNotes,
    }),
    maxTokens: 1200,
    json: true,
    timeoutMs: 50_000,
  });
  if (!model.ok) return fail(model.error);
  let draft: z.infer<typeof ImproveSchema>;
  try {
    draft = ImproveSchema.parse(parseJsonObject(model.text));
  } catch {
    return fail("The improvement model returned malformed JSON. Nothing was saved.");
  }
  const cleaned = stripUnknownUrls(draft.improvedAnswer, allowed);
  const sourcesUsed = draft.sourcesUsed.filter((source) => {
    const safe = safeHttpUrl(source.url);
    return Boolean(safe && [...allowed].some((url) => sameUrl(url, safe)));
  });
  const uncertainties = [...draft.uncertainties];
  if (cleaned.removed > 0 || sourcesUsed.length < draft.sourcesUsed.length) {
    uncertainties.push("A cited source was removed because it was not in the retrieved evidence.");
  }
  if (!cleaned.text || cleaned.text.length < 20) return fail("The improved answer was empty after removing unsupported source links.");
  return {
    ok: true as const,
    improvedAnswer: cleaned.text,
    corrections: draft.corrections,
    sourcesUsed: sourcesUsed.map((source) => ({ title: source.title, url: safeHttpUrl(source.url) || source.url })),
    uncertainties,
  };
}
