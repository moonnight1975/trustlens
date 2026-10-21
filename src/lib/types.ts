export const CLAIM_STATUSES = [
  "SUPPORTED",
  "PARTIALLY_SUPPORTED",
  "CONTRADICTED",
  "UNVERIFIED",
  "NOT_APPLICABLE",
] as const;
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

export const CLAIM_CATEGORIES = [
  "factual",
  "numerical",
  "historical",
  "scientific",
  "financial",
  "statistical",
  "geographical",
  "temporal",
  "opinion",
  "subjective",
] as const;
export type ClaimCategory = (typeof CLAIM_CATEGORIES)[number];

export const SOURCE_QUALITIES = [
  "PRIMARY_OFFICIAL",
  "SECONDARY_REPUTABLE",
  "GENERAL",
  "LOW_CONFIDENCE",
] as const;
export type SourceQuality = (typeof SOURCE_QUALITIES)[number];

export type SnippetKind = "extract" | "search-snippet" | "page-excerpt" | "citation-only";

export type RiskLevel = "low" | "moderate" | "high" | "critical";

export interface EvidenceItem {
  id: string;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  snippetKind: SnippetKind;
  publishedAt: string | null;
  pageUpdatedAt: string | null;
  eventDate: string | null;
  retrievedAt: string;
  quality: SourceQuality;
  sourceType: string;
  provider: string;
  claimIds: string[];
}

export interface Claim {
  id: string;
  text: string;
  category: ClaimCategory;
  importance: number;
  verifiability: "high" | "medium" | "low" | "none";
  searchQuery: string;
  status: ClaimStatus;
  confidence: number;
  evidenceIds: string[];
  rationale: string;
  auditor: "model" | "lexical";
  temporalNote: string | null;
}

export interface LogicalIssue {
  claimIds: string[];
  text: string;
  source: "heuristic" | "model";
}

export interface ScoreBreakdown {
  formulaVersion: string;
  trustScore: number;
  riskLevel: RiskLevel;
  factuality: number | null;
  logicalConsistency: number;
  evidenceSupport: number | null;
  semanticAlignment: number;
  hallucinationRisk: number | null;
  evidenceCoverage: number | null;
  sourceReliability: number | null;
  weights: Record<string, number>;
  notes: string[];
}

export interface FuzzyResult {
  score: number;
  support: number;
  contradiction: number;
  coverage: number;
  rulesFired: string[];
}

export interface TcsResult {
  trust: number;
  confidence: number;
  confidenceLow: number;
  confidenceHigh: number;
  stability: number;
  composite: number;
  narrative: string[];
}

export interface Correction {
  originalClaim: string;
  correction: string;
  reason: string;
}

export interface SourceRef {
  title: string;
  url: string;
}

export interface AnalysisRecord {
  id: string;
  createdAt: string;
  question: string;
  answer: string;
  answerSource: "user" | "generated" | "improved";
  generatorModel: string | null;
  evidenceMode: "external" | "unavailable";
  evidenceNote: string | null;
  extraction: "model" | "heuristic";
  claims: Claim[];
  evidence: EvidenceItem[];
  logicalIssues: LogicalIssue[];
  scores: ScoreBreakdown;
  fuzzy: FuzzyResult;
  tcs: TcsResult;
  pipelineLog: string[];
  improvement: {
    ofId: string;
    corrections: Correction[];
    sourcesUsed: SourceRef[];
    uncertainties: string[];
    originalTrustScore: number;
  } | null;
  improvedChildId: string | null;
}

export interface FeedbackRecord {
  id: string;
  analysisId: string | null;
  kind: "correct" | "incorrect" | "helpful" | "not-helpful" | "issue";
  note: string;
  createdAt: string;
  status: "saved";
}

export interface MultiModelResult {
  model: string;
  label: string;
  ok: boolean;
  text: string;
  error: string | null;
}

export type DraftClaim = {
  id: string;
  text: string;
  category: ClaimCategory;
  importance: number;
  verifiability: "high" | "medium" | "low" | "none";
  searchQuery: string;
};
