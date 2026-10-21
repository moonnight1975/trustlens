import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { useEffect, useState } from "react";

import { Button, Card, Notice } from "@/components/ui";
import { buildEvaluationDataset, deleteAnalysis, listAnalyses } from "@/lib/storage";
import type { AnalysisRecord } from "@/lib/types";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "History · TrustLens" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const [rows, setRows] = useState<AnalysisRecord[] | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  useEffect(() => setRows(listAnalyses()), []);

  function exportDataset() {
    const blob = new Blob([JSON.stringify(buildEvaluationDataset(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "trustlens-eval.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!rows) return <p className="text-sm text-muted">Loading history…</p>;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">History</h1>
          <p className="mt-2 text-muted">Reports stay in this browser. An improved answer is a new report and does not replace the original.</p>
        </div>
        <Button variant="ghost" onClick={exportDataset}>Export evaluation data</Button>
      </div>
      {rows.length === 0 ? <Notice>No reports yet. Verify an answer from Analyze.</Notice> : null}
      {rows.map((row) => (
        <Card key={row.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="text-xs text-muted">{format(new Date(row.createdAt), "d MMM yyyy, HH:mm")}</p>
            <p className="font-semibold">{row.question}</p>
            <p className="text-sm text-muted">
              Trust {row.scores.trustScore} · {row.scores.riskLevel}
              {row.improvement ? " · improved copy" : ""}
              {row.evidenceMode === "unavailable" ? " · evidence unavailable" : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <Link className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-fg" to="/report/$id" params={{ id: row.id }}>
              Open
            </Link>
            {pendingDelete === row.id ? (
              <Button
                variant="danger"
                onClick={() => {
                  deleteAnalysis(row.id);
                  setRows(listAnalyses());
                  setPendingDelete(null);
                }}
              >
                Confirm delete
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => setPendingDelete(row.id)}>
                Delete
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
