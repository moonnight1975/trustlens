import {
  FORMULA_VERSION,
  METHODOLOGY,
  QUALITY_FACTOR,
  QUALITY_RELIABILITY,
  SCORE_WEIGHTS,
  STATUS_POINTS,
} from "@/lib/scoring/config";
import type { Claim, EvidenceItem, RiskLevel, ScoreBreakdown, SourceQuality } from "@/lib/types";

export { METHODOLOGY };

function clamp(n: number, lo = 0, hi = 100) {
  return Math.min(hi, Math.max(lo, n));
}

function round(n: number) {
  return Math.round(clamp(n));
}

function bestQuality(claim: Claim, evidence: EvidenceItem[]): SourceQuality | null {
  const linked = evidence.filter((e) => claim.evidenceIds.includes(e.id) && e.snippet.trim().length > 0);
  if (linked.length === 0) return null;
  const rank: Record<SourceQuality, number> = {
    PRIMARY_OFFICIAL: 4,
    SECONDARY_REPUTABLE: 3,
    GENERAL: 2,
    LOW_CONFIDENCE: 1,
  };
  return linked.sort((a, b) => rank[b.quality] - rank[a.quality])[0].quality;
}

export function riskFromTrust(trust: number): RiskLevel {
  if (trust >= 80) return "low";
  if (trust >= 60) return "moderate";
  if (trust >= 40) return "high";
  return "critical";
}

export function scoreAnalysis(input: {
  claims: Claim[];
  evidence: EvidenceItem[];
  logicalIssueCount: number;
  alignment: number;
  evidenceAvailable: boolean;
}): ScoreBreakdown {
  const notes: string[] = [];
  const verifiable = input.claims.filter(
    (c) => c.status !== "NOT_APPLICABLE" && c.verifiability !== "none",
  );
  const weightSum = verifiable.reduce((s, c) => s + c.importance, 0);

  const logicalConsistency = round(100 - 15 * Math.min(4, input.logicalIssueCount));
  const alignment = round(input.alignment);

  if (!input.evidenceAvailable) {
    notes.push("External evidence verification unavailable. Unverified claims were not treated as false.");
  }

  if (verifiable.length === 0 || weightSum === 0) {
    const trustScore = Math.min(55, round(0.5 * logicalConsistency + 0.5 * alignment));
    notes.push(
      "No externally verifiable factual claims were scored. The trust score is capped because factual support was not established.",
    );
    return {
      formulaVersion: FORMULA_VERSION,
      trustScore,
      riskLevel: trustScore >= 45 ? "moderate" : "high",
      factuality: null,
      logicalConsistency,
      evidenceSupport: null,
      semanticAlignment: alignment,
      hallucinationRisk: null,
      evidenceCoverage: null,
      sourceReliability: null,
      weights: { ...SCORE_WEIGHTS },
      notes,
    };
  }

  let supportAcc = 0;
  let contradictedW = 0;
  let unverifiedW = 0;
  let covered = 0;
  const qualities: SourceQuality[] = [];
  const importantPoints: number[] = [];

  for (const claim of verifiable) {
    const quality = bestQuality(claim, input.evidence);
    let status = claim.status;
    if (
      (status === "SUPPORTED" || status === "PARTIALLY_SUPPORTED" || status === "CONTRADICTED") &&
      !quality
    ) {
      status = "UNVERIFIED";
      notes.push(`Claim ${claim.id} had no usable retrieved text, so it was scored as unverified.`);
    }
    const qf = quality ? QUALITY_FACTOR[quality] : 1;
    const points = STATUS_POINTS[status] * (status === "SUPPORTED" || status === "PARTIALLY_SUPPORTED" ? qf : 1);
    supportAcc += claim.importance * points;
    if (status === "CONTRADICTED") contradictedW += claim.importance;
    if (status === "UNVERIFIED") unverifiedW += claim.importance;
    if (quality) {
      covered += 1;
      qualities.push(quality);
    }
    if (claim.importance >= 4) importantPoints.push(points * 100);
  }

  const claimSupport = (100 * supportAcc) / weightSum;
  const contradictionPenalty = (100 * contradictedW) / weightSum;
  const unverifiedDrag = (100 * unverifiedW) / weightSum;
  const evidenceCoverage = (100 * covered) / verifiable.length;
  const sourceReliability =
    qualities.length === 0
      ? 0
      : qualities.reduce((s, q) => s + QUALITY_RELIABILITY[q], 0) / qualities.length;
  const evidenceSupport =
    evidenceCoverage === 0 ? Math.min(claimSupport, 20) : 0.6 * claimSupport + 0.4 * evidenceCoverage;

  const w = SCORE_WEIGHTS;
  const base =
    w.claimSupport * claimSupport +
    w.lowContradiction * (100 - contradictionPenalty) +
    w.lowUnverified * (100 - unverifiedDrag) +
    w.sourceQuality * sourceReliability +
    w.evidenceCoverage * evidenceCoverage +
    w.logicalConsistency * logicalConsistency +
    w.alignment * alignment;

  let trust = base;
  if (importantPoints.length > 0) {
    const worst = Math.min(...importantPoints);
    trust = 0.65 * base + 0.35 * worst;
    notes.push("The weakest important claim pulled the trust score (65% weighted sum, 35% that claim).");
  }

  const hallucinationRisk = round(
    0.55 * (100 - claimSupport) + 0.3 * contradictionPenalty + 0.15 * (100 - logicalConsistency),
  );

  if (contradictedW > 0) notes.push("Contradicted claims lowered support and added a contradiction penalty.");
  if (unverifiedW > 0) notes.push("Unverified claims reduced confidence without being scored as false.");

  const trustScore = round(trust);
  return {
    formulaVersion: FORMULA_VERSION,
    trustScore,
    riskLevel: riskFromTrust(trustScore),
    factuality: round(claimSupport),
    logicalConsistency,
    evidenceSupport: round(evidenceSupport),
    semanticAlignment: alignment,
    hallucinationRisk,
    evidenceCoverage: round(evidenceCoverage),
    sourceReliability: round(sourceReliability),
    weights: { ...SCORE_WEIGHTS },
    notes,
  };
}
