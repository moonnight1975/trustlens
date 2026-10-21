const STOP = new Set(
  "a an the of to in on for and or is are was were be been being with from by that this those these it its as at into over after before about than then not no nor so if but which who whom whose what when where why how into per via than within without between among during such other more most some any each both few other into can may might must should would could will just also very much many one two new old own same than too only over after again further once here there all into does did doing have has had having".split(
    " ",
  ),
);

export function contentWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOP.has(w));
}

export function overlapRatio(claim: string, evidence: string): number {
  const words = contentWords(claim);
  if (words.length === 0) return 0;
  const ev = new Set(contentWords(evidence));
  return words.filter((w) => ev.has(w)).length / words.length;
}

export function extractNumbers(text: string): number[] {
  const nums: number[] = [];
  const re = /\b\d{1,3}(?:,\d{3})+(?:\.\d+)?\b|\b\d+(?:\.\d+)?\b/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    const n = Number(match[0].replace(/,/g, ""));
    if (Number.isFinite(n)) nums.push(n);
  }
  return nums;
}

export function numbersClose(a: number, b: number) {
  const scale = Math.max(Math.abs(a), Math.abs(b), 1);
  return Math.abs(a - b) / scale <= 0.02;
}

export function sentencesOf(text: string): string[] {
  const parts = text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return parts.length > 0 ? parts : [text.trim()].filter(Boolean);
}

export function stripTags(value: string) {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&/g, "&")
    .replace(/"/g, '"')
    .replace(/&#039;|'/g, "'")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function alignmentOf(question: string, answer: string): { score: number; level: "full" | "partial" | "weak" | "off-topic"; reason: string } {
  const q = contentWords(question);
  if (q.length < 2) {
    return { score: 70, level: "partial", reason: "The question is too short to judge alignment closely." };
  }
  const a = new Set(contentWords(answer));
  const overlap = q.filter((w) => a.has(w)).length / q.length;
  if (overlap >= 0.65) return { score: 92, level: "full", reason: "Most of the question's content words appear in the answer." };
  if (overlap >= 0.4) return { score: 72, level: "partial", reason: "The answer shares some of the question's subject, but not most of it." };
  if (overlap >= 0.2) return { score: 48, level: "weak", reason: "The answer only weakly overlaps the question." };
  return { score: 18, level: "off-topic", reason: "The answer does not use the question's main terms." };
}

const PHRASE_SETS = [
  ["asia", "europe", "africa", "oceania", "antarctica", "north america", "south america"],
  ["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"],
];

export function phraseConflict(claim: string, evidence: string): boolean {
  const c = claim.toLowerCase();
  const e = evidence.toLowerCase();
  for (const set of PHRASE_SETS) {
    const inClaim = set.filter((p) => c.includes(p));
    const inEv = set.filter((p) => e.includes(p));
    if (inClaim.length === 1 && inEv.length >= 1 && !inEv.includes(inClaim[0])) return true;
  }
  return false;
}

export function relationValue(text: string): { rel: string; value: string } | null {
  const first = text.match(
    /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s+is\s+the\s+(capital|president|prime minister|ceo|king|queen)\b/,
  );
  if (first) return { rel: first[2].toLowerCase(), value: first[1].toLowerCase() };
  const second = text.match(
    /\bthe\s+(capital|president|prime minister|ceo)\s+of\s+(?:the\s+)?[A-Za-z][A-Za-z\s]{1,40}?\s+is\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/,
  );
  if (second) return { rel: second[1].toLowerCase(), value: second[2].toLowerCase() };
  return null;
}
