import assert from "node:assert/strict";
import test from "node:test";

import { assembleVerification } from "@/lib/verify/assemble";
import { judgeClaim } from "@/lib/verify/judge";
import type { EvidenceItem } from "@/lib/types";

const speed =
  "The speed of light in vacuum is a universal physical constant exactly 299792458 metres per second.";

test("matching constant is supported", () => {
  const result = judgeClaim("The speed of light in vacuum is exactly 299792458 metres per second.", [
    { id: "e1", text: speed, quality: "SECONDARY_REPUTABLE" },
  ]);
  assert.equal(result.status, "SUPPORTED");
  assert.deepEqual(result.evidenceIds, ["e1"]);
});

test("wrong speed is contradicted", () => {
  const result = judgeClaim("The speed of light in vacuum is 50 metres per second.", [
    { id: "e1", text: speed, quality: "SECONDARY_REPUTABLE" },
  ]);
  assert.equal(result.status, "CONTRADICTED");
});

test("capital mismatch is contradicted and a correct capital is supported", () => {
  const paris = "Paris is the capital of France and its largest city.";
  assert.equal(judgeClaim("Lyon is the capital of France.", [{ id: "e1", text: paris, quality: "SECONDARY_REPUTABLE" }]).status, "CONTRADICTED");
  assert.equal(judgeClaim("Paris is the capital of France.", [{ id: "e1", text: paris, quality: "SECONDARY_REPUTABLE" }]).status, "SUPPORTED");
});

test("missing evidence stays unverified and opinions are not applicable", () => {
  assert.equal(
    judgeClaim("A mineral called glorphium was declared the national rock of France in 2099.", []).status,
    "UNVERIFIED",
  );
  assert.equal(judgeClaim("I think chocolate is the best flavor in the world.", [{ id: "e1", text: speed, quality: "GENERAL" }]).status, "NOT_APPLICABLE");
});

test("a partial overlap without the number is partially supported", () => {
  const result = judgeClaim("Paris is the capital of France and has a population of 12000000.", [
    { id: "e1", text: "Paris is the capital of France and its largest city.", quality: "SECONDARY_REPUTABLE" },
  ]);
  assert.equal(result.status, "PARTIALLY_SUPPORTED");
});

test("numeric conflict overrides a model status of supported", () => {
  const evidence: EvidenceItem[] = [
    {
      id: "e1",
      title: "Speed of light",
      url: "https://en.wikipedia.org/wiki/Speed_of_light",
      domain: "en.wikipedia.org",
      snippet: speed,
      snippetKind: "extract",
      publishedAt: null,
      pageUpdatedAt: "2026-10-01T00:00:00Z",
      eventDate: null,
      retrievedAt: "2026-10-20T00:00:00.000Z",
      quality: "SECONDARY_REPUTABLE",
      sourceType: "reference",
      provider: "wikipedia",
      claimIds: [],
    },
  ];
  const record = assembleVerification({
    id: "a1",
    now: new Date("2026-10-20T00:00:00.000Z"),
    question: "What is the speed of light in a vacuum?",
    answer: "The speed of light in vacuum is 50 metres per second.",
    answerSource: "user",
    generatorModel: null,
    drafts: [
      {
        id: "c1",
        text: "The speed of light in vacuum is 50 metres per second.",
        category: "numerical",
        importance: 5,
        verifiability: "high",
        searchQuery: "speed of light vacuum",
      },
    ],
    evidence,
    evidenceMode: "external",
    evidenceNote: null,
    extraction: "heuristic",
    modelJudgments: [{ id: "c1", status: "SUPPORTED", evidenceIds: ["e1"], rationale: "model says yes" }],
    pipelineLog: [],
  });
  assert.equal(record.claims[0].status, "CONTRADICTED");
  assert.ok(record.scores.trustScore < 70);
  assert.equal(record.scores.formulaVersion, "2026.10.1");
});

test("unavailable evidence does not mark a claim false", () => {
  const record = assembleVerification({
    id: "a2",
    question: "What is glorphium?",
    answer: "Glorphium boils at 50 degrees.",
    answerSource: "user",
    generatorModel: null,
    drafts: [
      {
        id: "c1",
        text: "Glorphium boils at 50 degrees.",
        category: "scientific",
        importance: 4,
        verifiability: "high",
        searchQuery: "glorphium",
      },
    ],
    evidence: [],
    evidenceMode: "unavailable",
    evidenceNote: "External evidence verification unavailable.",
    extraction: "heuristic",
    pipelineLog: [],
  });
  assert.equal(record.claims[0].status, "UNVERIFIED");
  assert.ok(record.scores.trustScore > 0);
  assert.match(record.scores.notes.join(" "), /unavailable/i);
});
