import assert from "node:assert/strict";
import test from "node:test";

import { ipIsBlocked } from "@/lib/search/fetchPage.server";
import { safeHttpUrl } from "@/lib/urlSafety";

test("rejects unsafe urls", () => {
  assert.equal(safeHttpUrl("javascript:alert(1)"), null);
  assert.equal(safeHttpUrl("data:text/html,hi"), null);
  assert.equal(safeHttpUrl("https://user:pass@example.com/a"), null);
  assert.equal(safeHttpUrl("http://localhost/secret"), null);
  assert.ok(safeHttpUrl("https://en.wikipedia.org/wiki/Speed_of_light"));
});

test("blocks private and metadata addresses", () => {
  assert.equal(ipIsBlocked("127.0.0.1"), true);
  assert.equal(ipIsBlocked("10.1.2.3"), true);
  assert.equal(ipIsBlocked("169.254.169.254"), true);
  assert.equal(ipIsBlocked("192.168.0.4"), true);
  assert.equal(ipIsBlocked("8.8.8.8"), false);
  assert.equal(ipIsBlocked("::1"), true);
});
