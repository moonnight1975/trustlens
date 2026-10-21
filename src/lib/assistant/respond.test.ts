import assert from "node:assert/strict";
import test from "node:test";

import { answerAssistant } from "@/lib/assistant/respond";
import type { AnalysisRecord } from "@/lib/types";

function record(): AnalysisRecord {
  return {
    id: "rep-1",
    createdAt: "2026-10-20T00:00:00.000Z",
    question: "What is the speed of light?",
    answer: "It is 50 metres per second.",
    answerSource: "user",
    generatorModel: null,
    evidenceMode: "external",
    evidenceNote: null,
    extraction: "lexical" as AnalysisRecord["extraction"],
    claims: [
      {
        id: "c1",
        text: "The speed of light is 50 metres per second.",
        category: "numerical",
        importance: 5,
        verifiability: "high",
        searchQuery: "speed of light",
        status: "CONTRADICTED",
        confidence: 0.7,
        evidenceIds: ["e1"],
        rationale: "A retrieved sentence contains a different number.",
        auditor: "lexical",
        temporalNote: null,
      },
    ],
    evidence: [
      {
        id: "e1",
        title: "Speed of light",
        url: "https://en.wikipedia.org/wiki/Speed_of_light",
        domain: "en.wikipedia.org",
        snippet: "The speed of light in vacuum is exactly 299792458 metres per second.",
        snippetKind: "extract",
        publishedAt: null,
        pageUpdatedAt: "2026-10-01T00:00:00Z",
        eventDate: null,
        retrievedAt: "2026-10-20T00:00:00.000Z",
        quality: "SECONDARY_REPUTABLE",
        sourceType: "reference",
        provider: "wikipedia",
        claimIds: ["c1"],
      },
    ],
    logicalIssues: [],
    scores: {
      formulaVersion: "2026.10.1",
      trustScore: 41,
      riskLevel: "high",
      factuality: 12,
      logicalConsistency: 100,
      evidenceSupport: 20,
      semanticAlignment: 80,
      hallucinationRisk: 70,
      evidenceCoverage: 100,
      sourceReliability: 82,
      weights: {},
      notes: ["Contradicted claims lowered support."],
    },
    fuzzy: { score: 28, support: 12, contradiction: 100, coverage: 100, rulesFired: [] },
    tcs: {
      trust: 28,
      confidence: 60,
      confidenceLow: 46,
      confidenceHigh: 74,
      stability: 85,
      composite: 49,
      narrative: ["TCS composite 49."],
    },
    pipelineLog: [],
    improvement: null,
    improvedChildId: null,
  };
}

test("assistant quotes the real trust score", () => {
  const reply = answerAssistant({
    message: "What is my Trust Score?",
    history: [],
    analysis: record(),
    page: "/report/rep-1",
  });
  assert.match(reply.text, /\b41\b/);
  assert.doesNotMatch(reply.text, /\b85\b/);
});

test("missing analysis does not invent a score", () => {
  const reply = answerAssistant({
    message: "What is my Trust Score?",
    history: [],
    analysis: null,
    page: "/",
  });
  assert.match(reply.text, /don't have that information/i);
});

test("general knowledge is directed to web search", () => {
  const reply = answerAssistant({
    message: "What is the capital of France?",
    history: [],
    analysis: record(),
    page: "/report/rep-1",
  });
  assert.equal(reply.searchWeb, true);
  assert.match(reply.text, /search the web/i);
});

test("why follows the previous score question", () => {
  const first = answerAssistant({ message: "What is my Trust Score?", history: [], analysis: record(), page: "/report/rep-1" });
  const follow = answerAssistant({
    message: "Why?",
    history: [
      { role: "user", text: "What is my Trust Score?" },
      { role: "assistant", text: first.text },
    ],
    analysis: record(),
    page: "/report/rep-1",
  });
  assert.match(follow.text, /41/);
  assert.match(follow.text, /Contradicted|50 metres/i);
});

test("evidence answer uses the retrieved url", () => {
  const reply = answerAssistant({
    message: "What evidence was found?",
    history: [],
    analysis: record(),
    page: "/report/rep-1",
  });
  assert.match(reply.text, /wikipedia\.org\/wiki\/Speed_of_light/);
});
