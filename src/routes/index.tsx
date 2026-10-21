import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ClipboardPaste,
  Database,
  Eye,
  FlaskConical,
  Globe,
  Layers,
  Loader2,
  Shield,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button, Card, FeatureChip, StepIndicator } from "@/components/ui";
import { cn } from "@/lib/cn";
import { getApiSettings, getWellbeing, saveAnalysis } from "@/lib/storage";
import { analyzeAnswer, generateOnScreen } from "@/lib/verify/api";

export const Route = createFileRoute("/")(({
  head: () => ({ meta: [{ title: "Analyze · TrustLens" }] }),
  component: AnalyzePage,
}));

/* ── Example presets ─────────────────────────────────────── */
const EXAMPLES = [
  {
    label: "Established constant",
    question: "What is the speed of light in a vacuum?",
    answer:
      "The speed of light in a vacuum is exactly 299,792,458 metres per second. It is a defined constant in the SI system.",
  },
  {
    label: "Incorrect number",
    question: "What is the speed of light in a vacuum?",
    answer:
      "The speed of light in a vacuum is 50 metres per second, which is why sunlight takes several years to reach Earth.",
  },
];

/* ── Mode type ───────────────────────────────────────────── */
type Mode = "manual" | "generate" | "examples";

const MODES: { id: Mode; label: string; subtitle: string; icon: React.ReactNode }[] = [
  {
    id: "manual",
    label: "Manual Input",
    subtitle: "Paste your own question and answer",
    icon: <ClipboardPaste className="size-4" aria-hidden="true" />,
  },
  {
    id: "generate",
    label: "Generate with AI",
    subtitle: "Let TrustLens generate an answer first",
    icon: <Bot className="size-4" aria-hidden="true" />,
  },
  {
    id: "examples",
    label: "Load Examples",
    subtitle: "Try a sample question",
    icon: <FlaskConical className="size-4" aria-hidden="true" />,
  },
];

/* ── Workflow steps for sidebar ──────────────────────────── */
const WORKFLOW = [
  {
    n: 1,
    title: "Claims are extracted",
    desc: "TrustLens identifies factual claims. Opinions are not scored as facts.",
    icon: <Layers className="size-5" aria-hidden="true" />,
  },
  {
    n: 2,
    title: "Search for external sources",
    desc: "Search queries hit Wikipedia, Brave or web search only when those providers are configured and respond.",
    icon: <Globe className="size-5" aria-hidden="true" />,
  },
  {
    n: 3,
    title: "Compare claims with evidence",
    desc: "Claims are matched with retrieved text. Missing evidence stays unverified.",
    icon: <Eye className="size-5" aria-hidden="true" />,
  },
  {
    n: 4,
    title: "Calculate trust score",
    desc: "A transparent formula is used. Changing it means changing the scoring module.",
    icon: <Database className="size-5" aria-hidden="true" />,
  },
];

/* ── Why it matters ──────────────────────────────────────── */
const WHY = [
  {
    icon: <CheckCircle2 className="size-5 text-primary" aria-hidden="true" />,
    title: "Fact-based insights",
    desc: "See what is supported, contradicted or unverified.",
  },
  {
    icon: <Globe className="size-5 text-primary" aria-hidden="true" />,
    title: "Transparent sources",
    desc: "View the actual sources and evidence used.",
  },
  {
    icon: <Shield className="size-5 text-primary" aria-hidden="true" />,
    title: "Reduce AI hallucinations",
    desc: "Catch unsupported or misleading claims.",
  },
  {
    icon: <Zap className="size-5 text-primary" aria-hidden="true" />,
    title: "Make better decisions",
    desc: "Use reliable information from trusted sources.",
  },
];

/* ── Main page ───────────────────────────────────────────── */
function AnalyzePage() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [stage, setStage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reminders, setReminders] = useState(true);
  const [mode, setMode] = useState<Mode>("manual");
  const [apiSettings, setApiSettings] = useState(getApiSettings());
  const request = useRef(0);
  const questionRef = useRef<HTMLTextAreaElement>(null);
  const answerRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setReminders(getWellbeing().verificationReminders);
    setApiSettings(getApiSettings());
  }, []);

  /* ── paste helpers ── */
  const pasteInto = useCallback(async (setter: (v: string) => void) => {
    try {
      const text = await navigator.clipboard.readText();
      setter(text);
    } catch {
      /* ignore if not permitted */
    }
  }, []);

  /* ── verify ── */
  async function verify(text: string, source: "user" | "generated", model: string | null) {
    if (!navigator.onLine) {
      setError(
        "You are offline. Live verification needs a connection. Saved reports are still available in History.",
      );
      return;
    }
    const mine = ++request.current;
    setStage("Checking claims against retrieved sources…");
    setError(null);
    try {
      const result = await analyzeAnswer({
        data: { question, answer: text, answerSource: source, generatorModel: model },
      });
      if (request.current !== mine) return;
      if (!result.ok) {
        setError(result.error);
        setStage(null);
        return;
      }
      saveAnalysis(result.record);
      setStage(null);
      await navigate({ to: "/report/$id", params: { id: result.record.id } });
    } catch {
      if (request.current === mine) {
        setStage(null);
        setError("Verification failed before a report could be saved.");
      }
    }
  }

  /* ── generate (and optionally verify) ── */
  async function generate(andVerify: boolean) {
    if (!navigator.onLine) {
      setError("You are offline. Answer generation needs a connection.");
      return;
    }
    const mine = ++request.current;
    setStage("Generating an answer…");
    setError(null);
    try {
      const generated = await generateOnScreen({ data: { question } });
      if (request.current !== mine) return;
      if (!generated.ok) {
        setStage(null);
        setError(generated.error);
        return;
      }
      setAnswer(generated.answer);
      if (!andVerify) {
        setStage(null);
        return;
      }
      setStage("Checking claims against retrieved sources…");
      const result = await analyzeAnswer({
        data: {
          question,
          answer: generated.answer,
          answerSource: "generated",
          generatorModel: generated.model,
        },
      });
      if (request.current !== mine) return;
      if (!result.ok) {
        setError(result.error);
        setStage(null);
        return;
      }
      saveAnalysis(result.record);
      setStage(null);
      await navigate({ to: "/report/$id", params: { id: result.record.id } });
    } catch {
      if (request.current === mine) {
        setStage(null);
        setError("Answer generation failed.");
      }
    }
  }

  const busy = !!stage;
  const canVerify = !busy && question.trim().length >= 3 && answer.trim().length >= 1;
  const canGenerate = !busy && question.trim().length >= 3;

  return (
    <div className="grid gap-8">
      {/* ── Hero ── */}
      <section className="grid gap-6 lg:grid-cols-[1fr_auto]">
        {/* left: heading + feature chips */}
        <div className="grid gap-4">
          <div>
            <h1 className="font-serif text-4xl sm:text-5xl leading-tight text-fg">
              Check an answer against{" "}
              <span className="text-gradient-primary">real sources</span>
            </h1>
            <p className="mt-3 max-w-2xl text-base text-muted leading-relaxed">
              Paste a question and an AI answer, or generate one here. TrustLens extracts claims,
              retrieves external evidence, and calculates a transparent trust score.
            </p>
          </div>

          {/* feature chips */}
          <div className="flex flex-wrap items-center gap-2">
            <FeatureChip icon={<Globe className="size-3.5" />} label="Real web sources" />
            <FeatureChip icon={<Layers className="size-3.5" />} label="Claim-by-claim analysis" />
            <FeatureChip icon={<Eye className="size-3.5" />} label="Transparent scoring" />
            <FeatureChip icon={<ShieldCheck className="size-3.5" />} label="No invented facts" />
            <Link
              to="/settings"
              className="nm-raised-sm inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 border border-primary/25 text-xs font-semibold text-primary hover:glow-primary transition-all duration-200"
              title="Configure in Settings"
            >
              <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
              <span>Primary Engine: <strong className="text-fg">{apiSettings.modelLabel || apiSettings.primaryModel}</strong></span>
            </Link>
          </div>

          {reminders ? (
            <div
              className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-info-bg px-4 py-3 text-sm text-info"
            >
              <ShieldCheck className="mt-0.5 size-4 flex-shrink-0" aria-hidden="true" />
              <span>
                Important decisions need sources outside any chatbot, including this one. A high
                score is not a substitute for the underlying documents.
              </span>
            </div>
          ) : null}
        </div>

        {/* right: shield illustration */}
        <div className="hidden lg:flex items-start justify-center pt-2">
          <ShieldIllustration />
        </div>
      </section>

      {/* ── Two-column workspace ── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">

        {/* ── LEFT: Analysis workspace ── */}
        <div className="grid gap-5">

          {/* Mode selector */}
          <div
            className="nm-inset rounded-2xl border border-border-light p-1.5 flex gap-1"
            role="tablist"
            aria-label="Input mode"
          >
            {MODES.map((m) => (
              <button
                key={m.id}
                role="tab"
                type="button"
                aria-selected={mode === m.id}
                onClick={() => setMode(m.id)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-0.5 rounded-xl px-2 py-2.5 text-xs font-semibold transition-all duration-200 min-h-0",
                  "sm:flex-row sm:gap-2 sm:px-3 sm:py-2",
                  mode === m.id
                    ? "nm-raised-sm text-primary border border-primary/15 gradient-primary-soft shadow-glow"
                    : "text-muted hover:text-fg",
                )}
              >
                {m.icon}
                <span className="hidden sm:inline">{m.label}</span>
                <span className="sm:hidden text-[10px]">{m.label.split(" ")[0]}</span>
              </button>
            ))}
          </div>

          {/* Main card */}
          <Card className="p-5 sm:p-6 grid gap-6">

            {/* ── Mode: Examples ── */}
            {mode === "examples" && (
              <div className="grid gap-4" role="tabpanel">
                <div>
                  <h2 className="font-semibold text-fg mb-1">Try a sample question</h2>
                  <p className="text-sm text-muted">
                    Select an example to populate the question and answer fields, then verify.
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex.label}
                      type="button"
                      onClick={() => {
                        setQuestion(ex.question);
                        setAnswer(ex.answer);
                        setError(null);
                        setMode("manual");
                      }}
                      className={cn(
                        "nm-raised-sm border border-border-light rounded-2xl p-4 text-left transition-all duration-200",
                        "hover:border-primary/25 hover:shadow-glow",
                        "focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2",
                      )}
                    >
                      <p className="text-sm font-semibold text-primary mb-1">{ex.label}</p>
                      <p className="text-xs text-muted leading-relaxed line-clamp-3">{ex.answer}</p>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setQuestion("");
                    setAnswer("");
                    setError(null);
                  }}
                  className="flex items-center gap-2 text-sm text-muted hover:text-bad transition-colors w-fit"
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                  Clear All
                </button>
              </div>
            )}

            {/* ── Mode: Manual / Generate ── */}
            {mode !== "examples" && (
              <>
                {/* Step 1 — Question */}
                <div className="grid gap-3" role="tabpanel">
                  <StepIndicator number={1} label="Question" />
                  <p className="text-sm text-muted -mt-2">What should the answer address?</p>
                  <div className="relative">
                    <textarea
                      id="question-input"
                      aria-label="Question"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      maxLength={4000}
                      ref={questionRef}
                      placeholder="Type your question here… (e.g. a factual question about current events, science, technology, etc.)"
                      className={cn(
                        "min-h-28 w-full resize-y px-4 py-3 text-base text-fg leading-relaxed pr-16",
                        "nm-inset border border-border-light rounded-2xl",
                        "placeholder:text-subtle",
                        "focus:outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1",
                        "transition-all duration-150",
                      )}
                    />
                    {/* controls */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      <button
                        type="button"
                        aria-label="Paste from clipboard"
                        title="Paste"
                        onClick={() => pasteInto(setQuestion)}
                        className="size-7 flex items-center justify-center rounded-lg text-muted hover:text-primary nm-raised-sm border border-border-light transition-all"
                      >
                        <ClipboardPaste className="size-3.5" aria-hidden="true" />
                      </button>
                      {question && (
                        <button
                          type="button"
                          aria-label="Clear question"
                          title="Clear"
                          onClick={() => setQuestion("")}
                          className="size-7 flex items-center justify-center rounded-lg text-muted hover:text-bad nm-raised-sm border border-border-light transition-all"
                        >
                          <X className="size-3.5" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-subtle text-right">{question.length} / 4000</p>
                </div>

                {/* Step 2 — AI answer (manual mode) */}
                {mode === "manual" && (
                  <div className="grid gap-3">
                    <StepIndicator number={2} label="AI answer" />
                    <p className="text-sm text-muted -mt-2">
                      Paste the answer you want checked. Leave this blank if you want TrustLens to
                      generate an answer first.
                    </p>
                    <div className="relative">
                      <textarea
                        id="answer-input"
                        aria-label="AI answer"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        maxLength={20000}
                        ref={answerRef}
                        placeholder="Paste the AI answer here… (from ChatGPT, Gemini, Claude, etc.)"
                        className={cn(
                          "min-h-40 w-full resize-y px-4 py-3 text-base text-fg leading-relaxed pr-16",
                          "nm-inset border border-border-light rounded-2xl",
                          "placeholder:text-subtle",
                          "focus:outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1",
                          "transition-all duration-150",
                        )}
                      />
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        <button
                          type="button"
                          aria-label="Paste from clipboard"
                          title="Paste"
                          onClick={() => pasteInto(setAnswer)}
                          className="size-7 flex items-center justify-center rounded-lg text-muted hover:text-primary nm-raised-sm border border-border-light transition-all"
                        >
                          <ClipboardPaste className="size-3.5" aria-hidden="true" />
                        </button>
                        {answer && (
                          <button
                            type="button"
                            aria-label="Clear answer"
                            title="Clear"
                            onClick={() => setAnswer("")}
                            className="size-7 flex items-center justify-center rounded-lg text-muted hover:text-bad nm-raised-sm border border-border-light transition-all"
                          >
                            <X className="size-3.5" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-subtle text-right">{answer.length} / 20000</p>
                  </div>
                )}

                {/* Utility row */}
                {(question || answer) && (
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setQuestion("");
                        setAnswer("");
                        setError(null);
                      }}
                      className="flex items-center gap-1.5 text-xs text-muted hover:text-bad transition-colors"
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                      Clear All
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ── Action buttons ── */}
            <div className="grid gap-4 pt-1">
              {/* Primary: Verify */}
              {mode === "manual" && (
                <PrimaryButton
                  disabled={!canVerify}
                  busy={busy}
                  stage={stage}
                  icon={<ShieldCheck className="size-5" aria-hidden="true" />}
                  label="Verify pasted answer"
                  subtitle="Analyze and check against real sources"
                  onClick={() => verify(answer, "user", null)}
                />
              )}

              {/* Generate + Generate-and-verify */}
              <div className={cn("grid gap-3", mode === "manual" ? "sm:grid-cols-2" : "sm:grid-cols-1")}>
                {mode !== "manual" && (
                  <PrimaryButton
                    disabled={!canGenerate}
                    busy={busy}
                    stage={stage}
                    icon={<ShieldCheck className="size-5" aria-hidden="true" />}
                    label="Generate and verify"
                    subtitle="Generate then analyze"
                    onClick={() => generate(true)}
                  />
                )}

                <SecondaryButton
                  disabled={!canGenerate}
                  busy={busy}
                  icon={<Bot className="size-4" aria-hidden="true" />}
                  label="Generate answer"
                  subtitle="Get AI answer first"
                  onClick={() => generate(false)}
                />

                {mode === "manual" && (
                  <SecondaryButton
                    disabled={!canGenerate}
                    busy={busy}
                    icon={<Sparkles className="size-4" aria-hidden="true" />}
                    label="Generate and verify"
                    subtitle="Generate then analyze"
                    onClick={() => generate(true)}
                  />
                )}
              </div>

              {/* Cancel */}
              {busy && (
                <button
                  type="button"
                  onClick={() => {
                    request.current += 1;
                    setStage(null);
                  }}
                  className="text-sm text-muted hover:text-bad transition-colors flex items-center gap-1.5 w-fit mx-auto"
                >
                  <X className="size-3.5" aria-hidden="true" />
                  Cancel
                </button>
              )}

              {/* Status */}
              {stage && (
                <div className="flex items-center justify-center gap-2 py-2" aria-live="polite" role="status">
                  <Loader2 className="size-4 text-primary animate-spin" aria-hidden="true" />
                  <p className="text-sm font-semibold text-primary">{stage}</p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-bad-bg px-4 py-3 text-sm text-bad">
                  <X className="mt-0.5 size-4 flex-shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ── RIGHT: Sidebar ── */}
        <aside className="grid gap-5 content-start">

          {/* Card A: What happens */}
          <Card className="p-5">
            <h2 className="font-serif text-xl mb-4">What happens</h2>
            <ol className="grid gap-4">
              {WORKFLOW.map((step) => (
                <li key={step.n} className="flex gap-3">
                  <div
                    className="mt-0.5 flex-shrink-0 size-8 rounded-xl gradient-primary flex items-center justify-center text-white shadow-nm-raised-sm"
                  >
                    <span className="text-xs font-bold">{step.n}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-fg">{step.title}</p>
                    <p className="text-xs text-muted mt-0.5 leading-relaxed">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          {/* Card B: Why it matters */}
          <Card className="p-5">
            <h2 className="font-serif text-xl mb-4">Why it matters</h2>
            <div className="grid grid-cols-2 gap-2">
              {WHY.map((w) => (
                <div
                  key={w.title}
                  className="nm-inset rounded-xl border border-border-light p-3 grid gap-1.5"
                >
                  {w.icon}
                  <p className="text-xs font-semibold text-fg leading-snug">{w.title}</p>
                  <p className="text-[11px] text-muted leading-snug">{w.desc}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Card C: Availability notice */}
          <div
            className="rounded-2xl border border-border-light px-4 py-3 text-xs text-muted nm-inset"
          >
            <p className="font-semibold text-fg mb-0.5">If search or the model is unavailable</p>
            <p>The report says so. TrustLens does not invent sources.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ── Primary action button ──────────────────────────────── */
function PrimaryButton({
  disabled,
  busy,
  stage,
  icon,
  label,
  subtitle,
  onClick,
}: {
  disabled: boolean;
  busy: boolean;
  stage: string | null;
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-disabled={disabled}
      className={cn(
        "w-full rounded-2xl px-5 py-4 text-left transition-all duration-200 select-none",
        "gradient-primary text-white border border-primary/20",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        !disabled && "hover:glow-primary-strong active:scale-[0.99]",
        "focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
            {busy && stage ? (
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            ) : (
              icon
            )}
          </div>
          <div>
            <p className="font-semibold text-base">{label}</p>
            <p className="text-sm text-white/70 mt-0.5">{subtitle}</p>
          </div>
        </div>
        <ArrowRight className="size-5 text-white/60 flex-shrink-0" aria-hidden="true" />
      </div>
    </button>
  );
}

/* ── Secondary action button ─────────────────────────────── */
function SecondaryButton({
  disabled,
  busy,
  icon,
  label,
  subtitle,
  onClick,
}: {
  disabled: boolean;
  busy: boolean;
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-disabled={disabled}
      className={cn(
        "rounded-2xl px-4 py-3.5 text-left transition-all duration-200 select-none",
        "nm-raised-sm border border-border-light bg-surface",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        !disabled && "hover:border-primary/25 hover:shadow-glow active:shadow-nm-inset active:scale-[0.99]",
        "focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-xl gradient-primary-soft border border-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : icon}
        </div>
        <div>
          <p className="font-semibold text-sm text-fg">{label}</p>
          <p className="text-xs text-muted mt-0.5">{subtitle}</p>
        </div>
      </div>
    </button>
  );
}

/* ── Shield illustration ─────────────────────────────────── */
function ShieldIllustration() {
  return (
    <div className="relative size-48 flex items-center justify-center select-none" aria-hidden="true">
      {/* outer glow ring */}
      <div
        className="absolute inset-0 rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
        }}
      />

      {/* shield body */}
      <div
        className="relative size-32 flex items-center justify-center rounded-3xl nm-raised border border-primary/15"
        style={{ background: "linear-gradient(140deg, #f8f9ff 0%, #eef0fc 100%)" }}
      >
        <Shield
          className="size-14"
          style={{ color: "#4338ca", opacity: 0.85 }}
        />

        {/* check overlay */}
        <div
          className="absolute -bottom-2 -right-2 size-9 rounded-full gradient-primary flex items-center justify-center nm-raised-sm border-2 border-white"
        >
          <CheckCircle2 className="size-4 text-white" />
        </div>
      </div>

      {/* floating labels */}
      <FloatingLabel text="Claims" style={{ top: "2px", left: "4px" }} />
      <FloatingLabel text="Evidence" style={{ top: "2px", right: "0px" }} />
      <FloatingLabel text="Sources" style={{ bottom: "28px", left: "0px" }} />
      <FloatingLabel text="Trust Score" style={{ bottom: "8px", right: "0px" }} />
    </div>
  );
}

function FloatingLabel({
  text,
  style,
}: {
  text: string;
  style: React.CSSProperties;
}) {
  return (
    <div
      className="absolute nm-raised-sm border border-primary/15 rounded-full px-2 py-0.5"
      style={style}
    >
      <span className="text-[10px] font-semibold text-primary">{text}</span>
    </div>
  );
}
