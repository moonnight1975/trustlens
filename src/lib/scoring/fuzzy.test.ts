import assert from "node:assert/strict";
import test from "node:test";

import { fuzzyTrust } from "@/lib/scoring/fuzzy";

test("fuzzy trust rises with support and falls when contradiction is high", () => {
  const high = fuzzyTrust({ support: 92, contradiction: 5, coverage: 100 });
  const low = fuzzyTrust({ support: 20, contradiction: 80, coverage: 20 });
  assert.ok(high.score > 75);
  assert.ok(low.score < 45);
  assert.ok(high.score > low.score);
  assert.ok(high.rulesFired.length > 0);
});
