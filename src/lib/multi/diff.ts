import { extractNumbers, sentencesOf } from "@/lib/text";

function tokens(text: string) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3),
  );
}

function jaccard(a: Set<string>, b: Set<string>) {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const word of a) if (b.has(word)) inter += 1;
  return inter / (a.size + b.size - inter);
}

export function compareModelTexts(items: { id: string; text: string }[]) {
  const available = items.filter((item) => item.text.trim().length > 0);
  const shared: string[] = [];
  const unique: { id: string; text: string }[] = [];
  const numbers = available.map((item) => ({
    id: item.id,
    values: [...new Set(extractNumbers(item.text).filter((n) => Math.abs(n) >= 3))],
  }));
  const numericalDifferences: string[] = [];
  for (let i = 0; i < numbers.length; i++) {
    for (let j = i + 1; j < numbers.length; j++) {
      const left = numbers[i];
      const right = numbers[j];
      if (left.values.length === 0 || right.values.length === 0) continue;
      const onlyLeft = left.values.filter((n) => !right.values.some((m) => Math.abs(n - m) / Math.max(Math.abs(n), Math.abs(m), 1) <= 0.02));
      if (onlyLeft.length) {
        numericalDifferences.push(`${left.id} and ${right.id} mention different numbers (${onlyLeft.slice(0, 4).join(", ")} appears in ${left.id}).`);
      }
    }
  }
  if (available.length >= 2) {
    const first = available[0];
    for (const sentence of sentencesOf(first.text)) {
      const bag = tokens(sentence);
      const echoed = available.slice(1).some((other) => sentencesOf(other.text).some((s) => jaccard(bag, tokens(s)) >= 0.55));
      if (echoed && sentence.length > 30) shared.push(sentence);
      else if (sentence.length > 30) unique.push({ id: first.id, text: sentence });
    }
    for (const other of available.slice(1)) {
      for (const sentence of sentencesOf(other.text)) {
        const bag = tokens(sentence);
        const echoed = sentencesOf(first.text).some((s) => jaccard(bag, tokens(s)) >= 0.55);
        if (!echoed && sentence.length > 30) unique.push({ id: other.id, text: sentence });
      }
    }
  }
  return {
    shared: shared.slice(0, 6),
    unique: unique.slice(0, 8),
    numericalDifferences: numericalDifferences.slice(0, 6),
  };
}
