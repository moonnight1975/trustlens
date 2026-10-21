/** Allow only http(s) URLs with no credentials. Reject javascript:, data:, and similar. */
export function safeHttpUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.username || url.password) return null;
    if (!url.hostname || url.hostname === "localhost" || url.hostname.endsWith(".local")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function domainOf(raw: string): string | null {
  const safe = safeHttpUrl(raw);
  if (!safe) return null;
  return new URL(safe).hostname.replace(/^www\./, "").toLowerCase();
}

export function sameUrl(a: string, b: string) {
  const left = safeHttpUrl(a);
  const right = safeHttpUrl(b);
  if (!left || !right) return false;
  const normalize = (value: string) => value.replace(/\/$/, "").replace(/#.*$/, "");
  return normalize(left) === normalize(right);
}
