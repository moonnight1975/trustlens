import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

import { stripTags } from "@/lib/text";
import { safeHttpUrl } from "@/lib/urlSafety";

export function ipIsBlocked(ip: string): boolean {
  const lower = ip.toLowerCase();
  const mapped = lower.match(/::ffff:(\d+\.\d+\.\d+\.\d+)/);
  if (mapped) return ipIsBlocked(mapped[1]);
  if (lower.includes(":")) {
    return lower === "::1" || lower === "::" || lower.startsWith("fc") || lower.startsWith("fd") || lower.startsWith("fe80");
  }
  const parts = lower.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return true;
  const [a, b] = parts;
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

async function hostAllowed(hostname: string) {
  if (!hostname || hostname === "localhost" || hostname.endsWith(".local") || hostname === "metadata.google.internal") {
    return false;
  }
  if (isIP(hostname)) return !ipIsBlocked(hostname);
  try {
    const records = await lookup(hostname, { all: true });
    if (records.length === 0) return false;
    return records.every((record) => !ipIsBlocked(record.address));
  } catch {
    return false;
  }
}

export async function fetchPublicExcerpt(rawUrl: string, hint: string): Promise<string | null> {
  let current = safeHttpUrl(rawUrl);
  if (!current || !current.startsWith("https:")) return null;
  for (let hop = 0; hop < 3; hop++) {
    const url = new URL(current);
    if (!(await hostAllowed(url.hostname))) return null;
    const response = await fetch(current, {
      method: "GET",
      redirect: "manual",
      headers: { "User-Agent": "TrustLens/1.0 (excerpt fetch)", Accept: "text/html,text/plain" },
      signal: AbortSignal.timeout(7000),
    });
    if (response.status >= 300 && response.status < 400) {
      const next = response.headers.get("location");
      if (!next) return null;
      current = safeHttpUrl(new URL(next, current).toString());
      if (!current) return null;
      continue;
    }
    if (!response.ok) return null;
    const type = response.headers.get("content-type") ?? "";
    if (!/text\/html|text\/plain|application\/xhtml/i.test(type)) return null;
    const reader = response.body?.getReader();
    if (!reader) return null;
    const chunks: Uint8Array[] = [];
    let received = 0;
    while (received < 180_000) {
      const step = await reader.read();
      if (step.done) break;
      received += step.value.byteLength;
      chunks.push(step.value);
    }
    reader.cancel().catch(() => undefined);
    const html = new TextDecoder().decode(Buffer.concat(chunks));
    const text = stripTags(html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " "));
    if (text.length < 80) return null;
    const needle = hint.toLowerCase().split(/\s+/).find((word) => word.length > 4);
    const at = needle ? text.toLowerCase().indexOf(needle) : 0;
    const start = Math.max(0, (at < 0 ? 0 : at) - 180);
    return text.slice(start, start + 900).trim();
  }
  return null;
}
