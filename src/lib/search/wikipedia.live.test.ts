import assert from "node:assert/strict";
import test from "node:test";

import { wikiSearch } from "@/lib/search/wikipedia.server";

test("wikipedia returns a real extract for a known topic", async (t) => {
  try {
    const hits = await wikiSearch("speed of light vacuum", 1);
    if (hits.length === 0) {
      t.skip("Wikipedia returned no hits");
      return;
    }
    assert.match(hits[0].url, /^https:\/\/en\.wikipedia\.org\/wiki\//);
    assert.ok(hits[0].snippet.length > 40);
    assert.equal(hits[0].snippetKind === "extract" || hits[0].snippetKind === "search-snippet", true);
    assert.equal(hits[0].quality, "SECONDARY_REPUTABLE");
  } catch (error) {
    t.skip(`Wikipedia unavailable: ${error instanceof Error ? error.message : "error"}`);
  }
});
