/** Deterministic TrustLens score. The model never picks this number. */
export const FORMULA_VERSION = "2026.10.1";

export const SCORE_WEIGHTS = {
  claimSupport: 0.3,
  lowContradiction: 0.22,
  lowUnverified: 0.1,
  sourceQuality: 0.1,
  evidenceCoverage: 0.1,
  logicalConsistency: 0.1,
  alignment: 0.08,
} as const;

export const QUALITY_FACTOR = {
  PRIMARY_OFFICIAL: 1,
  SECONDARY_REPUTABLE: 0.92,
  GENERAL: 0.78,
  LOW_CONFIDENCE: 0.55,
} as const;

export const QUALITY_RELIABILITY = {
  PRIMARY_OFFICIAL: 100,
  SECONDARY_REPUTABLE: 82,
  GENERAL: 60,
  LOW_CONFIDENCE: 35,
} as const;

/** Points before quality is applied. Missing evidence is not treated as false. */
export const STATUS_POINTS = {
  SUPPORTED: 1,
  PARTIALLY_SUPPORTED: 0.55,
  UNVERIFIED: 0.35,
  CONTRADICTED: 0,
  NOT_APPLICABLE: 0,
} as const;

export const METHODOLOGY = [
  "Trust Score is a weighted sum, then blended toward the weakest important claim so one serious contradiction cannot hide behind several supported details.",
  "Weights: claim support 30%, low contradiction 22%, low unverified share 10%, source quality 10%, evidence coverage 10%, logical consistency 10%, answer-question alignment 8%.",
  "Supported claims score 1, partially supported 0.55, unverified 0.35, contradicted 0. Unverified is a gap, not a finding that the claim is false.",
  "Source quality scales support: official 1.0, reputable secondary 0.92, general 0.78, low-confidence 0.55.",
  "A supported, contradicted, or partial status with no linked retrieved text is scored as unverified.",
  "If any verifiable claim has importance 4 or 5, the final score is 65% the weighted sum and 35% that claim's weakest point value.",
  "Each internal contradiction deducts 15 points from logical consistency, up to four issues.",
  "Answers with no verifiable factual claims are capped at 55. Opinion is not treated as established fact.",
  "Hallucination risk is separate: 55% weak support, 30% contradiction, 15% logical issues. It is not simply 100 minus the trust score.",
].join(" ");
