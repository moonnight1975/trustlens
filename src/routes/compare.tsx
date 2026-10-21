import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Card, Notice } from "@/components/ui";
import { listAnalyses } from "@/lib/storage";
import type { AnalysisRecord } from "@/lib/types";

export const Route = createFileRoute("/compare")({
  head: () => ({ meta: [{ title: "Compare · TrustLens" }] }),
  component: ComparePage,
});

function count(record: AnalysisRecord, status: AnalysisRecord["claims"][number]["status"]) {
  return record.claims.filter((claim) => claim.status === status).length;
}

function cell(value: number | null) {
  return value == null ? "n/a" : String(value);
}

function ComparePage() {
  const [rows, setRows] = useState<AnalysisRecord[] | null>(null);
  const [picked, setPicked] = useState<string[]>([]);

  useEffect(() => setRows(listAnalyses()), []);
  if (!rows) return <p className="text-sm text-muted">Loading reports…</p>;
  const selected = rows.filter((row) => picked.includes(row.id)).slice(0, 3);

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="font-serif text-4xl">Compare</h1>
        <p className="mt-2 text-muted">Same formula on every report. A higher score is not assumed to be the truer one without looking at the claims.</p>
      </div>
      {rows.length < 2 ? <Notice>Verify at least two answers to compare them.</Notice> : null}
      <div className="grid gap-2">
        {rows.map((row) => (
          <label key={row.id} className="flex min-h-11 items-center gap-3 rounded-xl border border-border bg-surface px-3">
            <input
              type="checkbox"
              checked={picked.includes(row.id)}
              onChange={(event) => {
                setPicked((current) => {
                  if (event.target.checked) return [...current, row.id].slice(-3);
                  return current.filter((id) => id !== row.id);
                });
              }}
            />
            <span className="text-sm">
              {row.scores.trustScore} · {row.question}
            </span>
          </label>
        ))}
      </div>
      {selected.length >= 2 ? (
        <Card className="overflow-x-auto p-4">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-3 font-semibold">Metric</th>
                {selected.map((row) => (
                  <th key={row.id} className="py-2 pr-3 font-semibold">
                    <Link className="text-primary" to="/report/$id" params={{ id: row.id }}>{row.question.slice(0, 42)}</Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["Trust score", (row: AnalysisRecord) => String(row.scores.trustScore)],
                  ["Factuality", (row: AnalysisRecord) => cell(row.scores.factuality)],
                  ["Evidence support", (row: AnalysisRecord) => cell(row.scores.evidenceSupport)],
                  ["Source reliability", (row: AnalysisRecord) => cell(row.scores.sourceReliability)],
                  ["Hallucination risk", (row: AnalysisRecord) => cell(row.scores.hallucinationRisk)],
                  ["Supported claims", (row: AnalysisRecord) => String(count(row, "SUPPORTED"))],
                  ["Contradicted claims", (row: AnalysisRecord) => String(count(row, "CONTRADICTED"))],
                  ["Unverified claims", (row: AnalysisRecord) => String(count(row, "UNVERIFIED"))],
                ] as const
              ).map(([label, read]) => (
                <tr key={label} className="border-b border-border">
                  <th className="py-2 pr-3 font-medium">{label}</th>
                  {selected.map((row) => (
                    <td key={row.id} className="py-2 pr-3">{read(row)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <p className="text-sm text-muted">Select two or three reports.</p>
      )}
    </div>
  );
}
