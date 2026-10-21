import assert from "node:assert/strict";
import test from "node:test";

import { FORMULA_VERSION, SCORE_WEIGHTS } from "@/lib/scoring/config";
import { scoreAnalysis } from "@/lib/scoring/score";
import type { Claim, EvidenceItem } from "@/lib/types";

function claim(partial: Partial<Claim> & Pick<Claim, "id" | "status" | "importance">): Claim {
  return {
    text: partial.text ?? partial.id,
    category: "factual",
    verifiability: "high",
    searchQuery: "q",
    confidence: 0.5,
    evidenceIds: partial.evidenceIds ?? ["e1"],
    rationale: "",
    auditor: "lexical",
    temporalNote: null,
    ...partial,
  };
}

function evidence(quality: EvidenceItem["quality"] = "SECONDARY_REPUTABLE"): EvidenceItem[] {
  return [
    {
      id: "e1",
      title: "Source",
      url: "https://en.wikipedia.org/wiki/Example",
      domain: "en.wikipedia.org",
      snippet: "A retrieved extract long enough to count as usable evidence text.",
      snippetKind: "extract",
      publishedAt: null,
      pageUpdatedAt: null,
      eventDate: null,
      retrievedAt: "2026-10-20T00:00:00.000Z",
      quality,
      sourceType: "reference",
      provider: "wikipedia",
      claimIds: ["c1"],
    },
  ];
}

const base = { logicalIssueCount: 0, alignment: 90, evidenceAvailable: true };

test("weights sum to 1 and version is set", () => {
  const sum = Object.values(SCORE_WEIGHTS).reduce((total, value) => total + value, 0);
  assert.ok(Math.abs(sum - 1) < 1e-9);
  assert.equal(FORMULA_VERSION, "2026.10.1");
});

test("supported claims score higher than a contradicted important claim", () => {
  const good = scoreAnalysis({
    ...base,
    claims: [claim({ id: "c1", status: "SUPPORTED", importance: 5 })],
    evidence: evidence(),
  });
  const bad = scoreAnalysis({
    ...base,
    claims: [claim({ id: "c1", status: "CONTRADICTED", importance: 5 })],
    evidence: evidence(),
  });
  const unknown = scoreAnalysis({
    ...base,
    claims: [claim({ id: "c1", status: "UNVERIFIED", importance: 5, evidenceIds: [] })],
    evidence: [],
    evidenceAvailable: false,
  });
  assert.ok(good.trustScore > unknown.trustScore);
  assert.ok(unknown.trustScore > bad.trustScore);
  assert.ok(good.trustScore - bad.trustScore >= 25);
  assert.equal(good.riskLevel, "low");
});

test("opinion-only answers are capped", () => {
  const scored = scoreAnalysis({
    ...base,
    claims: [claim({ id: "c1", status: "NOT_APPLICABLE", importance: 1, verifiability: "none", evidenceIds: [] })],
    evidence: [],
  });
  assert.ok(scored.trustScore <= 55);
  assert.equal(scored.factuality, null);
});

test("scores stay inside 0-100 and are deterministic", () => {
  const input = {
    ...base,
    claims: [
      claim({ id: "c1", status: "SUPPORTED", importance: 5 }),
      claim({ id: "c2", status: "UNVERIFIED", importance: 4, evidenceIds: [] }),
    ],
    evidence: evidence(),
  };
  const a = scoreAnalysis(input);
  const b = scoreAnalysis(input);
  assert.deepEqual(a, b);
  for (const value of [a.trustScore, a.factuality, a.logicalConsistency, a.hallucinationRisk]) {
    assert.ok(value != null && value >= 0 && value <= 100);
  }
});
