import type { FuzzyResult } from "@/lib/types";

function leftShoulder(x: number, peakEnd: number, zeroAt: number) {
  if (x <= peakEnd) return 1;
  if (x >= zeroAt) return 0;
  return (zeroAt - x) / (zeroAt - peakEnd);
}

function rightShoulder(x: number, zeroAt: number, peakStart: number) {
  if (x <= zeroAt) return 0;
  if (x >= peakStart) return 1;
  return (x - zeroAt) / (peakStart - zeroAt);
}

function triangle(x: number, a: number, b: number, c: number) {
  if (x <= a || x >= c) return 0;
  if (x === b) return 1;
  if (x < b) return (x - a) / (b - a);
  return (c - x) / (c - b);
}

export const FUZZY_RULES = [
  "High support, low contradiction, and high coverage imply high trust.",
  "High support and low contradiction but low coverage imply medium trust.",
  "High contradiction implies low trust.",
  "Low support and low contradiction imply low trust.",
  "Medium support and low contradiction imply medium trust.",
  "High support and high contradiction imply low trust.",
];

function clip(n: number) {
  return Math.min(100, Math.max(0, n));
}

/** Mamdani inference with min implication, max aggregation, and centroid defuzzification. */
export function fuzzyTrust(input: { support: number; contradiction: number; coverage: number }): FuzzyResult {
  const support = clip(input.support);
  const contradiction = clip(input.contradiction);
  const coverage = clip(input.coverage);

  const sHigh = rightShoulder(support, 60, 90);
  const sMid = triangle(support, 30, 55, 80);
  const sLow = leftShoulder(support, 20, 50);
  const cLow = leftShoulder(contradiction, 15, 40);
  const cHigh = rightShoulder(contradiction, 25, 60);
  const covHigh = rightShoulder(coverage, 45, 80);
  const covLow = leftShoulder(coverage, 20, 50);

  const rules: { name: string; strength: number; shape: (y: number) => number }[] = [
    {
      name: "high support, low contradiction, high coverage → high",
      strength: Math.min(sHigh, cLow, covHigh),
      shape: (y) => rightShoulder(y, 55, 85),
    },
    {
      name: "high support, low contradiction, low coverage → medium",
      strength: Math.min(sHigh, cLow, covLow),
      shape: (y) => triangle(y, 30, 50, 70),
    },
    {
      name: "high contradiction → low",
      strength: cHigh,
      shape: (y) => leftShoulder(y, 15, 45),
    },
    {
      name: "low support, low contradiction → low",
      strength: Math.min(sLow, cLow),
      shape: (y) => leftShoulder(y, 15, 45),
    },
    {
      name: "medium support, low contradiction → medium",
      strength: Math.min(sMid, cLow),
      shape: (y) => triangle(y, 30, 50, 70),
    },
    {
      name: "high support, high contradiction → low",
      strength: Math.min(sHigh, cHigh),
      shape: (y) => leftShoulder(y, 15, 45),
    },
  ];

  const mu = new Array<number>(101).fill(0);
  const fired: string[] = [];
  for (const rule of rules) {
    if (rule.strength <= 0.02) continue;
    fired.push(rule.name);
    for (let y = 0; y <= 100; y++) {
      mu[y] = Math.max(mu[y], Math.min(rule.strength, rule.shape(y)));
    }
  }

  let num = 0;
  let den = 0;
  for (let y = 0; y <= 100; y++) {
    num += y * mu[y];
    den += mu[y];
  }
  const score = den === 0 ? 50 : Math.round(num / den);
  return { score, support: Math.round(support), contradiction: Math.round(contradiction), coverage: Math.round(coverage), rulesFired: fired };
}
