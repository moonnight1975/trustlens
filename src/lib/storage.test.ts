import assert from "node:assert/strict";
import test from "node:test";

import { emptyStore, migrateStore } from "@/lib/storage";
import type { AnalysisRecord } from "@/lib/types";

test("migration keeps a legacy list and drops garbage", () => {
  const record = {
    id: "a",
    question: "q",
    answer: "b",
    scores: { trustScore: 50 },
    claims: [],
    evidence: [],
  } as unknown as AnalysisRecord;
  const migrated = migrateStore([record, { id: "bad" }]);
  assert.equal(migrated.version, 1);
  assert.equal(migrated.analyses.length, 1);
  assert.equal(migrated.analyses[0].id, "a");
  assert.deepEqual(migrateStore(null), emptyStore());
});
