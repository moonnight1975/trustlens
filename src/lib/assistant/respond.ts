import { ASSISTANT_SCOPE, MISSING_CONTEXT } from "@/lib/copy";
import { METHODOLOGY } from "@/lib/scoring/config";
import type { AnalysisRecord, SourceQuality } from "@/lib/types";

type Turn = { role: "user" | "assistant"; text: string };
type AssistantReply = { text: string; searchWeb?: boolean };

const RANK: Record<SourceQuality, number> = {
  PRIMARY_OFFICIAL: 4,
  SECONDARY_REPUTABLE: 3,
  GENERAL: 2,
  LOW_CONFIDENCE: 1,
};

function count(record: AnalysisRecord, status: AnalysisRecord["claims"][number]["status"]) {
  return record.claims.filter((claim) => claim.status === status).length;
}

function whyScore(record: AnalysisRecord) {
  const bits = [
    `The trust score is ${record.scores.trustScore} (${record.scores.riskLevel} risk) under formula ${record.scores.formulaVersion}.`,
  ];
  if (record.scores.factuality != null) bits.push(`Factuality is ${record.scores.factuality}.`);
  if (record.scores.evidenceSupport != null) bits.push(`Evidence support is ${record.scores.evidenceSupport}.`);
  if (record.scores.hallucinationRisk != null) bits.push(`Hallucination risk is ${record.scores.hallucinationRisk}.`);
  bits.push(`Logical consistency is ${record.scores.logicalConsistency}. Alignment is ${record.scores.semanticAlignment}.`);
  const contradicted = record.claims.filter((claim) => claim.status === "CONTRADICTED");
  if (contradicted.length) {
    bits.push(`Contradicted claims: ${contradicted.map((claim) => claim.text).join(" ")}`);
  }
  const unverified = record.claims.filter((claim) => claim.status === "UNVERIFIED");
  if (unverified.length) bits.push(`${unverified.length} claim(s) are unverified, which lowers confidence without marking them false.`);
  if (record.scores.notes[0]) bits.push(record.scores.notes[0]);
  return bits.join(" ");
}

function evidenceAnswer(record: AnalysisRecord) {
  if (record.evidenceMode === "unavailable" || record.evidence.length === 0) {
    return record.evidenceNote
      ? `External evidence verification unavailable. ${record.evidenceNote}`
      : "External evidence verification unavailable.";
  }
  const lines = record.evidence.slice(0, 6).map((item) => {
    const kind = item.snippetKind === "extract" ? "extract" : item.snippetKind;
    return `${item.title} (${item.domain}, ${item.quality}, ${kind})${item.pageUpdatedAt ? `, page updated ${item.pageUpdatedAt}` : ""}: ${item.url}`;
  });
  return `Retrieved ${record.evidence.length} source(s). ${lines.join(" ")}`;
}

function strongest(record: AnalysisRecord) {
  if (record.evidence.length === 0) return MISSING_CONTEXT;
  const best = [...record.evidence].sort((a, b) => RANK[b.quality] - RANK[a.quality] || b.snippet.length - a.snippet.length)[0];
  return `The strongest retrieved source by the quality label is ${best.title} at ${best.domain} (${best.quality}). URL: ${best.url}. Quality is a signal, not proof.`;
}

function claimsOf(record: AnalysisRecord, status: AnalysisRecord["claims"][number]["status"], label: string) {
  const rows = record.claims.filter((claim) => claim.status === status);
  if (rows.length === 0) return `No claims are marked ${label}.`;
  return `${label}: ${rows.map((claim) => claim.text).join(" ")}`;
}

function productAnswer(message: string) {
  if (/\bfuzzy\b/i.test(message)) {
    return "The fuzzy trust score is a separate soft-computing view. It runs support, contradiction, and coverage through membership functions and centroid defuzzification. It does not replace the deterministic trust score.";
  }
  if (/\btcs\b/i.test(message)) {
    return "TCS is Trust, Confidence, and Stability. Trust comes from the fuzzy score. Confidence is an interval from claim confidence and source mix. Stability drops when time-sensitive claims lack fresh dates. Nothing here trains a model.";
  }
  if (/how (is|does).*(score|trust)|scoring|formula|weights/i.test(message)) return METHODOLOGY;
  if (/what is trustlens|how does trustlens|what do you do|who are you/i.test(message)) {
    return "TrustLens checks an AI answer by extracting claims, retrieving external sources, comparing claims with that text, and calculating a trust score in code. The model does not choose the score. I can explain the report that is open.";
  }
  return null;
}

function aboutAnalysis(message: string, record: AnalysisRecord) {
  const text = message.toLowerCase();
  if (/trust score|my score|the score/.test(text)) {
    if (/why|low|high|explain/.test(text)) return whyScore(record);
    return `Your trust score is ${record.scores.trustScore} out of 100. Risk is ${record.scores.riskLevel}. Formula ${record.scores.formulaVersion}.`;
  }
  if (/why/.test(text) && /low|high|score|risk/.test(text)) return whyScore(record);
  if (/hallucination/.test(text)) {
    return record.scores.hallucinationRisk == null
      ? "Hallucination risk is not applicable because this answer had no verifiable factual claims."
      : `Hallucination risk is ${record.scores.hallucinationRisk} out of 100. Higher means more unsupported or contradicted material. It is not 100 minus the trust score.`;
  }
  if (/factual/.test(text)) {
    return record.scores.factuality == null
      ? MISSING_CONTEXT.replace("that information", "a factuality score")
      : `Factuality is ${record.scores.factuality}. That is the weighted claim-support index, not the final trust score.`;
  }
  if (/logical/.test(text)) return `Logical consistency is ${record.scores.logicalConsistency}.`;
  if (/semantic|alignment/.test(text)) return `Semantic alignment is ${record.scores.semanticAlignment}.`;
  if (/evidence support/.test(text)) {
    return record.scores.evidenceSupport == null
      ? "Evidence support is not applicable for this analysis."
      : `Evidence support is ${record.scores.evidenceSupport}. Coverage is ${record.scores.evidenceCoverage}. Source reliability is ${record.scores.sourceReliability}.`;
  }
  if (/strongest source|which source/.test(text)) return strongest(record);
  if (/source|evidence|url/.test(text)) return evidenceAnswer(record);
  if (/contradict/.test(text)) return claimsOf(record, "CONTRADICTED", "Contradicted claims");
  if (/supported|which claims are support/.test(text)) return claimsOf(record, "SUPPORTED", "Supported claims");
  if (/unverified|why is this claim unverified/.test(text)) {
    const rows = record.claims.filter((claim) => claim.status === "UNVERIFIED");
    if (rows.length === 0) return "No claims are marked UNVERIFIED.";
    return rows.map((claim) => `${claim.text} — ${claim.rationale}`).join(" ");
  }
  if (/how many/.test(text)) {
    return `Supported claims: ${count(record, "SUPPORTED")}. I don't count partial, contradicted, or unverified claims as verified. Partially supported: ${count(record, "PARTIALLY_SUPPORTED")}. Contradicted: ${count(record, "CONTRADICTED")}. Unverified: ${count(record, "UNVERIFIED")}. Not applicable: ${count(record, "NOT_APPLICABLE")}.`;
  }
  if (/fuzzy/.test(text)) {
    return `The fuzzy trust score for this analysis is ${record.fuzzy.score}. Inputs were support ${record.fuzzy.support}, contradiction ${record.fuzzy.contradiction}, coverage ${record.fuzzy.coverage}.`;
  }
  if (/\btcs\b/.test(text)) return record.tcs.narrative.join(" ");
  if (/improv/.test(text)) {
    if (!record.improvement) return "This analysis is not an improved answer, or the improvement record is not on this report.";
    const delta = record.scores.trustScore - record.improvement.originalTrustScore;
    return `Original trust score ${record.improvement.originalTrustScore}. This improved answer scores ${record.scores.trustScore} (${delta >= 0 ? "+" : ""}${delta}). The change was not forced toward 85. Uncertainties: ${record.improvement.uncertainties.join(" ") || "none recorded"}.`;
  }
  if (/summar|explain this report|explain the report|explain this analysis/.test(text)) {
    return `Question: ${record.question} Trust score ${record.scores.trustScore}, risk ${record.scores.riskLevel}. ${whyScore(record)} ${evidenceAnswer(record)}`;
  }
  return null;
}

function isFollowUp(message: string) {
  return /^(why|why\??|and why\??|explain|go on|what about that)\??$/i.test(message.trim());
}

function looksGeneralKnowledge(message: string) {
  return /\b(capital of|who (is|was)|weather|recipe|write (me )?a poem|tell me a joke|population of|define )\b/i.test(message);
}

export function answerAssistant(input: {
  message: string;
  history: Turn[];
  analysis: AnalysisRecord | null;
  page: string;
}): AssistantReply {
  const message = input.message.trim();
  if (!message) return { text: "Say or type a question about this TrustLens report." };

  let effective = message;
  if (isFollowUp(message)) {
    const previous = [...input.history].reverse().find((turn) => turn.role === "user" && !isFollowUp(turn.text));
    if (!previous) return { text: MISSING_CONTEXT };
    if (/score|trust/.test(previous.text.toLowerCase())) effective = "why is my trust score what it is";
    else if (/evidence|source/.test(previous.text.toLowerCase())) effective = "which source is strongest";
    else effective = previous.text;
  }

  if (looksGeneralKnowledge(effective) && !/trustlens|this report|my score|this analysis/i.test(effective)) {
    return { text: ASSISTANT_SCOPE, searchWeb: true };
  }

  const needsRecord = /my score|trust score|hallucination|factual|logical|alignment|evidence|source|claim|contradict|unverified|fuzzy|tcs|summar|this report|this analysis|improv/i.test(
    effective,
  );
  if (needsRecord) {
    if (!input.analysis) return { text: MISSING_CONTEXT };
    const answer = aboutAnalysis(effective, input.analysis);
    if (answer) return { text: answer };
    if (/\b(my|this)\b/i.test(effective)) return { text: MISSING_CONTEXT };
  }

  const product = productAnswer(effective);
  if (product) return { text: product };

  if (input.page && /what page|where am i/.test(effective.toLowerCase())) {
    return { text: `You are on ${input.page}.` };
  }

  return { text: ASSISTANT_SCOPE, searchWeb: true };
}
