import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { Ban, Check, ChevronDown, ChevronUp, CircleHelp, ExternalLink, Minus, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ScoreRadar } from "@/components/charts";
import { Button, Card, Notice } from "@/components/ui";
import { EVIDENCE_DISCLAIMER } from "@/lib/copy";
import { METHODOLOGY } from "@/lib/scoring/config";
import { FUZZY_RULES, fuzzyTrust } from "@/lib/scoring/fuzzy";
import { tcsAnalysis } from "@/lib/scoring/tcs";
import { saveFeedback } from "@/lib/storage";
import type { AnalysisRecord, ClaimStatus } from "@/lib/types";
import { safeHttpUrl } from "@/lib/urlSafety";

const STATUS: Record<ClaimStatus, { label: string; tone: string; icon: LucideIcon }> = {
  SUPPORTED: { label: "Supported", tone: "bg-ok-bg text-ok", icon: Check },
  PARTIALLY_SUPPORTED: { label: "Partially supported", tone: "bg-warn-bg text-warn", icon: Minus },
  CONTRADICTED: { label: "Contradicted", tone: "bg-bad-bg text-bad", icon: Ban },
  UNVERIFIED: { label: "Unverified", tone: "bg-info-bg text-info", icon: CircleHelp },
  NOT_APPLICABLE: { label: "Not applicable", tone: "bg-accent text-fg", icon: Minus },
};

function Pill({ status }: { status: ClaimStatus }) {
  const meta = STATUS[status];
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${meta.tone}`}>
      <Icon className="size-3.5" aria-hidden="true" />
      {meta.label}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-xl border border-border px-3 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="font-serif text-2xl">{value == null ? "n/a" : value}</p>
    </div>
  );
}

export function ReportView({
  record,
  stage,
  error,
  draft,
  onImprove,
  onCancel,
}: {
  record: AnalysisRecord;
  stage: string | null;
  error: string | null;
  draft: string | null;
  onImprove: () => void;
  onCancel: () => void;
}) {
  const score = record.scores.trustScore;
  const showImprove = score < 85 && !stage;
  const points = [
    record.scores.factuality != null ? { metric: "Factuality", value: record.scores.factuality } : null,
    { metric: "Logic", value: record.scores.logicalConsistency },
    record.scores.evidenceSupport != null ? { metric: "Evidence", value: record.scores.evidenceSupport } : null,
    { metric: "Alignment", value: record.scores.semanticAlignment },
    record.scores.hallucinationRisk != null ? { metric: "Groundedness", value: 100 - record.scores.hallucinationRisk } : null,
    record.scores.evidenceCoverage != null ? { metric: "Coverage", value: record.scores.evidenceCoverage } : null,
  ].filter((point): point is { metric: string; value: number } => Boolean(point));
  const delta = record.improvement ? score - record.improvement.originalTrustScore : null;

  function sendFeedback(kind: "correct" | "incorrect" | "helpful" | "not-helpful" | "issue") {
    try {
      const saved = saveFeedback({ analysisId: record.id, kind, note: "" });
      if (saved.status === "saved") toast.success("Feedback saved on this device.");
    } catch {
      toast.error("Feedback could not be saved.");
    }
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
        <Card className="p-5">
          <p className="text-sm font-semibold text-muted">Trust score</p>
          <p className="font-serif text-6xl text-primary">{score}</p>
          <p className="mt-1 text-sm font-semibold capitalize">Risk: {record.scores.riskLevel}</p>
          <p className="mt-2 text-xs text-muted">Formula {record.scores.formulaVersion}. Calculated in code, not chosen by a model.</p>
          {record.improvement ? (
            <p className="mt-3 text-sm">
              Original {record.improvement.originalTrustScore}. Change {delta != null && delta > 0 ? "+" : ""}
              {delta}. The revised score is not forced to 85.
            </p>
          ) : null}
          {score >= 85 ? (
            <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-ok">
              <Check className="size-4" aria-hidden="true" />
              Answer meets the 85+ trust threshold.
            </p>
          ) : null}
          {showImprove ? (
            <Button className="mt-4 w-full" onClick={onImprove}>
              <Sparkles className="size-4" aria-hidden="true" />
              Improve Answer
            </Button>
          ) : null}
          {stage ? (
            <div className="mt-4" aria-live="polite">
              <p className="text-sm font-semibold">{stage}</p>
              <Button variant="ghost" className="mt-2 w-full" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          ) : null}
          {error ? (
            <div className="mt-3">
              <Notice tone="bad">{error}</Notice>
            </div>
          ) : null}
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted">{format(new Date(record.createdAt), "d MMM yyyy, HH:mm")}</p>
          <h1 className="mt-1 font-serif text-3xl">{record.question}</h1>
          <p className="mt-4 whitespace-pre-wrap text-base">{record.answer}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            {record.improvement ? (
              <Link className="font-semibold text-primary" to="/report/$id" params={{ id: record.improvement.ofId }}>
                Original analysis
              </Link>
            ) : null}
            {record.improvedChildId ? (
              <Link className="font-semibold text-primary" to="/report/$id" params={{ id: record.improvedChildId }}>
                Improved analysis
              </Link>
            ) : null}
          </div>
        </Card>
      </div>

      <Card className="grid gap-3 p-5 sm:grid-cols-3">
        <Metric label="Factuality" value={record.scores.factuality} />
        <Metric label="Logical consistency" value={record.scores.logicalConsistency} />
        <Metric label="Evidence support" value={record.scores.evidenceSupport} />
        <Metric label="Semantic alignment" value={record.scores.semanticAlignment} />
        <Metric label="Hallucination risk" value={record.scores.hallucinationRisk} />
        <Metric label="Evidence coverage" value={record.scores.evidenceCoverage} />
        <Metric label="Source reliability" value={record.scores.sourceReliability} />
        <Metric label="Fuzzy trust" value={record.fuzzy.score} />
        <Metric label="TCS composite" value={record.tcs.composite} />
      </Card>

      <Card className="p-5">
        <h2 className="font-serif text-2xl">Score shape</h2>
        <p className="mt-1 text-sm text-muted">Groundedness is 100 minus hallucination risk, so every axis is better when higher. Axes that do not apply are omitted.</p>
        <ScoreRadar points={points} />
      </Card>

      <section className="grid gap-3">
        <h2 className="font-serif text-2xl">Claims</h2>
        {record.claims.length === 0 ? <Notice>No claims were extracted.</Notice> : null}
        {record.claims.map((claim) => (
          <Card key={claim.id} className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Pill status={claim.status} />
              <span className="text-xs font-semibold uppercase text-muted">{claim.category}</span>
              <span className="text-xs text-muted">Importance {claim.importance}</span>
              <span className="text-xs text-muted">Auditor: {claim.auditor}</span>
            </div>
            <p className="mt-2">{claim.text}</p>
            <p className="mt-2 text-sm text-muted">
              <span className="font-semibold text-fg">Interpretation. </span>
              {claim.rationale}
            </p>
            {claim.temporalNote ? <p className="mt-2 text-sm text-warn">{claim.temporalNote}</p> : null}
          </Card>
        ))}
      </section>

      <section className="grid gap-3">
        <div>
          <h2 className="font-serif text-2xl">Evidence and sources</h2>
          <p className="mt-1 text-sm text-muted">
            {record.evidence.length > 0
              ? `${record.evidence.length} source${record.evidence.length === 1 ? "" : "s"} found for this search. Open each link to review the original page.`
              : "No sources were found for this search."}
          </p>
        </div>
        <Notice>{EVIDENCE_DISCLAIMER}</Notice>
        {record.evidenceMode === "unavailable" ? <Notice tone="warn">{record.evidenceNote || "External evidence verification unavailable."}</Notice> : null}
        {record.evidence.map((item) => {
          const href = safeHttpUrl(item.url);
          return (
            <Card key={item.id} className="p-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase text-muted">
                <span>{item.quality.replaceAll("_", " ")}</span>
                <span>{item.snippetKind}</span>
                <span>{item.provider}</span>
              </div>
              <p className="mt-1 font-semibold">{item.title}</p>
              <p className="text-sm text-muted">{item.domain}</p>
              {item.pageUpdatedAt ? <p className="text-sm text-muted">Page updated {item.pageUpdatedAt}. This is not necessarily the event date.</p> : <p className="text-sm text-muted">No publication date was retrieved.</p>}
              {item.snippet ? <p className="mt-2 text-sm">{item.snippet}</p> : <p className="mt-2 text-sm text-muted">No excerpt was retrieved. This citation is not used as supporting text.</p>}
              {href ? (
                <a className="mt-2 inline-flex min-h-11 items-center gap-1 font-semibold text-primary" href={href} target="_blank" rel="noopener noreferrer">
                  Open source <ExternalLink className="size-4" aria-hidden="true" />
                </a>
              ) : (
                <p className="mt-2 text-sm text-bad">Source URL was rejected as unsafe and is not linked.</p>
              )}
            </Card>
          );
        })}
      </section>

      {record.improvement ? (
        <Card className="grid gap-3 p-5">
          <h2 className="font-serif text-2xl">What changed</h2>
          {record.improvement.corrections.length === 0 ? <p className="text-sm">No structured corrections were returned.</p> : null}
          {record.improvement.corrections.map((item, index) => (
            <div key={`${item.originalClaim}-${index}`} className="border-t border-border pt-3 text-sm">
              <p><span className="font-semibold">Original claim. </span>{item.originalClaim}</p>
              <p className="mt-1"><span className="font-semibold">Correction. </span>{item.correction}</p>
              <p className="mt-1 text-muted"><span className="font-semibold text-fg">Reason. </span>{item.reason}</p>
            </div>
          ))}
          {record.improvement.uncertainties.length > 0 ? (
            <div>
              <p className="font-semibold">Remaining uncertainties</p>
              <ul className="mt-1 list-disc pl-5 text-sm">
                {record.improvement.uncertainties.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </Card>
      ) : null}

      {draft && error ? (
        <Card className="p-5">
          <h2 className="font-serif text-2xl">Unverified draft</h2>
          <p className="mt-1 text-sm text-muted">This text was not saved because re-verification did not finish. It is not a TrustLens score.</p>
          <p className="mt-3 whitespace-pre-wrap text-sm">{draft}</p>
        </Card>
      ) : null}

      <Card className="p-5">
        <h2 className="font-serif text-2xl">How this score was calculated</h2>
        <p className="mt-2 text-sm">{METHODOLOGY}</p>
        <ul className="mt-3 list-disc pl-5 text-sm text-muted">
          {record.scores.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
          {record.pipelineLog.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        {record.logicalIssues.length > 0 ? (
          <div className="mt-3">
            <p className="font-semibold">Logical issues</p>
            <ul className="mt-1 list-disc pl-5 text-sm">
              {record.logicalIssues.map((issue) => (
                <li key={issue.text}>{issue.text}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </Card>

      <SoftComputingSection record={record} />
      <TcsSection record={record} />

      <Card className="p-5">
        <h2 className="font-serif text-2xl">Feedback</h2>
        <p className="mt-1 text-sm text-muted">Saved on this device only. It is not treated as ground truth and does not train a model.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {([
            ["correct", "Correct"],
            ["incorrect", "Incorrect"],
            ["helpful", "Helpful"],
            ["not-helpful", "Not helpful"],
            ["issue", "Report an issue"],
          ] as const).map(([kind, label]) => (
            <Button key={kind} variant="ghost" onClick={() => sendFeedback(kind)}>
              {label}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ── Progress Bar ────────────────────────────────────────── */
function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-accent">
        <div
          className="h-2 rounded-full gradient-primary transition-all duration-500"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

/* ── Soft Computing Section ──────────────────────────────── */
function SoftComputingSection({ record }: { record: AnalysisRecord }) {
  const [open, setOpen] = useState(false);
  const recomputed = fuzzyTrust({
    support: record.scores.factuality ?? 0,
    contradiction: record.fuzzy.contradiction,
    coverage: record.scores.evidenceCoverage ?? 0,
  });

  return (
    <Card className="p-5">
      <button
        type="button"
        className="flex w-full items-center justify-between text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <div>
          <h2 className="font-serif text-2xl">Soft Computing</h2>
          <p className="mt-1 text-sm text-muted">Fuzzy trust score: {record.fuzzy.score}</p>
        </div>
        {open ? (
          <ChevronUp className="size-5 text-muted shrink-0" aria-hidden="true" />
        ) : (
          <ChevronDown className="size-5 text-muted shrink-0" aria-hidden="true" />
        )}
      </button>
      {open && (
        <div className="mt-4 grid gap-3">
          <p className="font-serif text-5xl text-primary">{record.fuzzy.score}</p>
          <p className="text-sm">
            Stored fuzzy score. Recomputed now: {recomputed.score}. Support{" "}
            {record.fuzzy.support}, contradiction {record.fuzzy.contradiction}, coverage{" "}
            {record.fuzzy.coverage}.
          </p>
          <p className="text-sm">
            Deterministic trust score for the same report:{" "}
            {record.scores.trustScore}.
          </p>
          <p className="text-sm text-muted">
            The fuzzy trust score is a separate soft-computing view. It runs support,
            contradiction, and coverage through membership functions and centroid
            defuzzification. It does not replace the deterministic trust score and it does
            not train a model.
          </p>
          <ul className="list-disc pl-5 text-sm">
            {FUZZY_RULES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
          <p className="text-sm text-muted">
            Rules that fired:{" "}
            {record.fuzzy.rulesFired.join("; ") || "none above the firing threshold."}
          </p>
        </div>
      )}
    </Card>
  );
}

/* ── TCS Section ─────────────────────────────────────────── */
function TcsSection({ record }: { record: AnalysisRecord }) {
  const [open, setOpen] = useState(false);
  const fresh = tcsAnalysis({
    fuzzyTrust: record.fuzzy.score,
    claims: record.claims,
    evidence: record.evidence,
    now: new Date(record.createdAt),
  });

  return (
    <Card className="p-5">
      <button
        type="button"
        className="flex w-full items-center justify-between text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <div>
          <h2 className="font-serif text-2xl">TCS — Trust · Confidence · Stability</h2>
          <p className="mt-1 text-sm text-muted">Composite: {fresh.composite}</p>
        </div>
        {open ? (
          <ChevronUp className="size-5 text-muted shrink-0" aria-hidden="true" />
        ) : (
          <ChevronDown className="size-5 text-muted shrink-0" aria-hidden="true" />
        )}
      </button>
      {open && (
        <div className="mt-4 grid gap-4">
          <Bar label="Trust (fuzzy)" value={fresh.trust} />
          <Bar label="Confidence" value={fresh.confidence} />
          <p className="text-sm">
            Confidence interval {fresh.confidenceLow}–{fresh.confidenceHigh}. The width
            grows when evidence is thin or low-quality.
          </p>
          <Bar label="Stability" value={fresh.stability} />
          <Bar label="Composite" value={fresh.composite} />
          <p className="text-sm text-muted">
            Trust, confidence, and stability. Confidence is an interval. Stability watches
            time-sensitive claims and source dates. This is not a psychological assessment
            and it does not update a model.
          </p>
          <ul className="list-disc pl-5 text-sm">
            {fresh.narrative.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
