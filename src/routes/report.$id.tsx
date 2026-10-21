import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { ReportView } from "@/components/report-view";
import { Notice } from "@/components/ui";
import { getAnalysis, saveAnalysis } from "@/lib/storage";
import type { AnalysisRecord } from "@/lib/types";
import { analyzeAnswer, improveAnswer } from "@/lib/verify/api";

export const Route = createFileRoute("/report/$id")({
  head: () => ({ meta: [{ title: "Report · TrustLens" }] }),
  component: ReportPage,
});

function ReportPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<AnalysisRecord | null>(null);
  const [ready, setReady] = useState(false);
  const [stage, setStage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const token = useRef(0);

  useEffect(() => {
    setRecord(getAnalysis(id));
    setReady(true);
    setStage(null);
    setError(null);
    setDraft(null);
  }, [id]);

  async function onImprove() {
    if (!record) return;
    if (!navigator.onLine) {
      setError("You are offline. Answer improvement needs a connection.");
      return;
    }
    const mine = ++token.current;
    setError(null);
    setDraft(null);
    setStage("Reviewing claims and evidence...");
    try {
      const improved = await improveAnswer({
        data: {
          question: record.question,
          answer: record.answer,
          trustScore: record.scores.trustScore,
          riskLevel: record.scores.riskLevel,
          claims: record.claims.map((claim) => ({ text: claim.text, status: claim.status, rationale: claim.rationale })),
          evidence: record.evidence.map((item) => ({
            id: item.id,
            title: item.title,
            url: item.url,
            snippet: item.snippet,
            snippetKind: item.snippetKind,
            pageUpdatedAt: item.pageUpdatedAt,
            publishedAt: item.publishedAt,
            quality: item.quality,
          })),
          auditNotes: record.scores.notes,
        },
      });
      if (token.current !== mine) return;
      if (!improved.ok) {
        setStage(null);
        setError(improved.error);
        return;
      }
      setDraft(improved.improvedAnswer);
      setStage("Re-verifying improved answer...");
      const verified = await analyzeAnswer({
        data: {
          question: record.question,
          answer: improved.improvedAnswer,
          answerSource: "improved",
          generatorModel: null,
        },
      });
      if (token.current !== mine) return;
      setStage(null);
      if (!verified.ok) {
        setError(`${verified.error} The draft was not saved because it was not re-verified.`);
        return;
      }
      const next: AnalysisRecord = {
        ...verified.record,
        improvement: {
          ofId: record.id,
          corrections: improved.corrections,
          sourcesUsed: improved.sourcesUsed,
          uncertainties: improved.uncertainties,
          originalTrustScore: record.scores.trustScore,
        },
      };
      saveAnalysis(next);
      setDraft(null);
      await navigate({ to: "/report/$id", params: { id: next.id } });
    } catch {
      if (token.current !== mine) return;
      setStage(null);
      setError("Improvement failed before a new report could be saved. The original analysis was not changed.");
    }
  }

  if (!ready) return <p className="text-sm text-muted">Loading the saved report…</p>;
  if (!record) return <Notice tone="warn">This report is not in this browser's history. It may have been saved on another device.</Notice>;

  return (
    <ReportView
      record={record}
      stage={stage}
      error={error}
      draft={draft}
      onImprove={onImprove}
      onCancel={() => {
        token.current += 1;
        setStage(null);
      }}
    />
  );
}
