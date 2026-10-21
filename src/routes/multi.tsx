import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button, Card, Field, Notice, TextArea } from "@/components/ui";
import { AGREEMENT_DISCLAIMER } from "@/lib/copy";
import { MULTI_MODELS } from "@/lib/ai/models";
import { compareModelTexts } from "@/lib/multi/diff";
import { getApiSettings, saveAnalysis } from "@/lib/storage";
import type { MultiModelResult } from "@/lib/types";
import { analyzeAnswer, askOneModel } from "@/lib/verify/api";

export const Route = createFileRoute("/multi")({
  head: () => ({ meta: [{ title: "Multi-AI · TrustLens" }] }),
  component: MultiPage,
});

function MultiPage() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [availableModels, setAvailableModels] = useState<{ id: string; label: string }[]>([...MULTI_MODELS]);
  const [selected, setSelected] = useState<string[]>(MULTI_MODELS.map((model) => model.id));
  const [results, setResults] = useState<MultiModelResult[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const settings = getApiSettings();
    if (settings.primaryModel && !MULTI_MODELS.some((m) => m.id === settings.primaryModel)) {
      const custom = {
        id: settings.primaryModel,
        label: `${settings.modelLabel || settings.primaryModel} (Primary)`,
      };
      setAvailableModels([custom, ...MULTI_MODELS]);
      setSelected((prev) => Array.from(new Set([settings.primaryModel, ...prev])));
    }
  }, []);

  async function run() {
    if (!navigator.onLine) {
      setError("You are offline. Model requests need a connection.");
      return;
    }
    setRunning(true);
    setError(null);
    setResults(selected.map((id) => {
      const known = availableModels.find((model) => model.id === id);
      return { model: id, label: known?.label || id, ok: false, text: "", error: "Waiting…" };
    }));
    await Promise.all(
      selected.map(async (model) => {
        try {
          const response = await askOneModel({ data: { question, model } });
          setResults((current) =>
            current.map((item) => {
              if (item.model !== model) return item;
              if (!response.ok) return { ...item, error: response.error };
              return response.result;
            }),
          );
        } catch {
          setResults((current) => current.map((item) => (item.model === model ? { ...item, error: "The request failed." } : item)));
        }
      }),
    );
    setRunning(false);
  }

  async function verify(result: MultiModelResult) {
    if (!result.ok) return;
    setBusyId(result.model);
    setError(null);
    try {
      const verified = await analyzeAnswer({
        data: { question, answer: result.text, answerSource: "generated", generatorModel: result.model },
      });
      if (!verified.ok) {
        setError(verified.error);
        setBusyId(null);
        return;
      }
      saveAnalysis(verified.record);
      await navigate({ to: "/report/$id", params: { id: verified.record.id } });
    } catch {
      setError("Verification failed.");
      setBusyId(null);
    }
  }

  const diff = compareModelTexts(results.filter((item) => item.ok).map((item) => ({ id: item.label, text: item.text })));

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="font-serif text-4xl">Multi-AI</h1>
        <p className="mt-2 max-w-3xl text-muted">The same question goes to each configured model. One failure does not hide the others. Agreement is not treated as truth.</p>
      </div>
      <Notice>{AGREEMENT_DISCLAIMER}</Notice>
      <Card className="grid gap-3 p-5">
        <Field label="Question">
          <TextArea value={question} onChange={(event) => setQuestion(event.target.value)} />
        </Field>
        <fieldset className="grid gap-2">
          <legend className="text-sm font-semibold">Models</legend>
          {availableModels.map((model) => (
            <label key={model.id} className="flex min-h-11 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.includes(model.id)}
                onChange={(event) => {
                  setSelected((current) =>
                    event.target.checked ? [...current, model.id] : current.filter((id) => id !== model.id),
                  );
                }}
              />
              {model.label}
            </label>
          ))}
        </fieldset>
        <Button disabled={running || question.trim().length < 3 || selected.length === 0} onClick={run}>
          {running ? "Asking models…" : "Ask models"}
        </Button>
        {error ? <Notice tone="bad">{error}</Notice> : null}
      </Card>
      <div className="grid gap-3 lg:grid-cols-2">
        {results.map((result) => (
          <Card key={result.model} className="p-4">
            <p className="font-semibold">{result.label}</p>
            {result.ok ? <p className="mt-2 whitespace-pre-wrap text-sm">{result.text}</p> : <p className="mt-2 text-sm text-bad">{result.error || "Unavailable"}</p>}
            {result.ok ? (
              <Button className="mt-3" variant="ghost" disabled={busyId === result.model} onClick={() => verify(result)}>
                {busyId === result.model ? "Verifying…" : "Verify this response"}
              </Button>
            ) : null}
          </Card>
        ))}
      </div>
      {results.some((item) => item.ok) ? (
        <Card className="grid gap-2 p-5 text-sm">
          <h2 className="font-serif text-2xl">Textual comparison</h2>
          <p className="text-muted">This only compares wording. It does not verify either answer.</p>
          <p className="font-semibold">Similar sentences</p>
          {diff.shared.length === 0 ? <p>No strongly overlapping sentences.</p> : diff.shared.map((line) => <p key={line}>{line}</p>)}
          <p className="font-semibold">Sentences that don't overlap</p>
          {diff.unique.length === 0 ? <p>None flagged.</p> : diff.unique.map((line) => <p key={`${line.id}-${line.text}`}><span className="font-semibold">{line.id}. </span>{line.text}</p>)}
          <p className="font-semibold">Numerical differences</p>
          {diff.numericalDifferences.length === 0 ? <p>No differing numbers were extracted.</p> : diff.numericalDifferences.map((line) => <p key={line}>{line}</p>)}
        </Card>
      ) : null}
    </div>
  );
}
