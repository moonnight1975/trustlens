import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertCircle,
  Bot,
  Check,
  CheckCircle2,
  Cpu,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Layers,
  Loader2,
  RotateCcw,
  Save,
  Server,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button, Card, Notice } from "@/components/ui";
import { MODEL_PRESETS, type ModelProvider, type ModelSettings } from "@/lib/ai/types";
import { cn } from "@/lib/cn";
import { getApiSettings, resetApiSettings, saveApiSettings } from "@/lib/storage";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings & AI Model · TrustLens" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [settings, setSettings] = useState<ModelSettings>(() => getApiSettings());
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    text?: string;
    error?: string;
    latencyMs?: number;
    model?: string;
  } | null>(null);
  const [serverStatus, setServerStatus] = useState<{
    hasCustomKey: boolean;
    hasEnvKey: boolean;
    primaryModel: string;
  } | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const local = getApiSettings();
    setSettings(local);

    // Sync from server to know if env key exists
    fetch("/api/settings")
      .then((r) => r.json())
      .then((res) => {
        if (res.ok) {
          setServerStatus({
            hasCustomKey: res.settings.hasCustomKey,
            hasEnvKey: res.settings.hasEnvKey,
            primaryModel: res.settings.primaryModel,
          });
        }
      })
      .catch(() => undefined);
  }, []);

  const activePreset = MODEL_PRESETS[settings.provider] || MODEL_PRESETS.custom;

  function handleSelectPreset(presetKey: ModelProvider) {
    const preset = MODEL_PRESETS[presetKey];
    setSettings((prev) => ({
      ...prev,
      provider: presetKey,
      baseUrl: preset.defaultBaseUrl,
      primaryModel: preset.defaultModel,
      modelLabel: preset.name,
    }));
    setTestResult(null);
    setIsSaved(false);
  }

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test", settings }),
      });
      const data = await res.json();
      if (data.ok) {
        setTestResult({
          ok: true,
          text: data.text,
          model: data.model,
          latencyMs: data.latencyMs,
        });
        toast.success(`Connected to ${data.model} successfully!`);
      } else {
        setTestResult({
          ok: false,
          error: data.error,
          latencyMs: data.latencyMs,
        });
        toast.error("Connection failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      setTestResult({
        ok: false,
        error: err instanceof Error ? err.message : "Failed to run test",
      });
      toast.error("Test request failed");
    } finally {
      setTesting(false);
    }
  }

  async function handleSave() {
    try {
      // 1. Save locally
      saveApiSettings(settings);

      // 2. Save to server runtime
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", settings }),
      });

      setIsSaved(true);
      toast.success(`Primary model set to ${settings.primaryModel}! Whole website will now answer with this model.`);
      setTimeout(() => setIsSaved(false), 3000);
    } catch {
      toast.error("Failed to save settings to server.");
    }
  }

  async function handleReset() {
    const def = resetApiSettings();
    setSettings(def);
    setTestResult(null);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });
    toast.info("Settings reset to default xAI Grok 4.5.");
  }

  const isKeyConfigured = Boolean(
    settings.apiKey || (settings.provider === "xai" && serverStatus?.hasEnvKey) || settings.provider === "ollama",
  );

  return (
    <div className="grid gap-8">
      {/* ── Page Header ── */}
      <div>
        <h1 className="font-serif text-4xl text-fg">Settings & AI Model</h1>
        <p className="mt-2 max-w-2xl text-base text-muted leading-relaxed">
          Configure the primary AI model and API credentials. Once saved, TrustLens uses this model across the entire
          website for answering questions, extracting claims, auditing against sources, and improving drafts.
        </p>
      </div>

      {/* ── Active Status Overview ── */}
      <Card className="p-5 sm:p-6 grid gap-4 border border-border-light">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="size-11 rounded-2xl gradient-primary flex items-center justify-center text-white shadow-nm-raised-sm flex-shrink-0">
              <Sparkles className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Active Primary Model</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-serif text-2xl font-bold text-fg">{settings.primaryModel}</span>
                <span className="nm-raised-sm text-xs font-semibold px-2.5 py-0.5 rounded-full text-primary border border-primary/20">
                  {settings.modelLabel || activePreset.name}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {isKeyConfigured ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ok-bg text-ok px-3 py-1 text-xs font-semibold">
                <CheckCircle2 className="size-3.5" aria-hidden="true" />
                API Key Configured
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-bad-bg text-bad px-3 py-1 text-xs font-semibold">
                <AlertCircle className="size-3.5" aria-hidden="true" />
                No Key Provided
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent text-primary px-3 py-1 text-xs font-semibold truncate max-w-[220px]">
              <Server className="size-3.5 flex-shrink-0" aria-hidden="true" />
              {new URL(settings.baseUrl || "https://api.x.ai/v1").hostname}
            </span>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        {/* ── Main Form ── */}
        <div className="grid gap-6">
          {/* Preset Selector */}
          <Card className="p-5 sm:p-6 grid gap-4">
            <div>
              <h2 className="font-serif text-xl text-fg">1. Choose AI Provider</h2>
              <p className="text-sm text-muted mt-1">Select a popular provider or connect any custom OpenAI-compatible endpoint.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(Object.keys(MODEL_PRESETS) as ModelProvider[]).map((key) => {
                const preset = MODEL_PRESETS[key];
                const active = settings.provider === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectPreset(key)}
                    className={cn(
                      "p-3 rounded-2xl text-left border transition-all duration-150 flex flex-col justify-between min-h-[92px]",
                      active
                        ? "nm-raised-sm gradient-primary-soft text-primary border-primary/30 shadow-glow"
                        : "nm-raised-sm bg-surface text-fg border-border-light hover:border-primary/20",
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted opacity-80">
                          {preset.badge}
                        </span>
                        {active && <Check className="size-3.5 text-primary flex-shrink-0" />}
                      </div>
                      <p className="font-semibold text-xs leading-snug text-fg">{preset.name}</p>
                    </div>
                    <span className="text-[10px] text-muted truncate mt-1">{preset.defaultModel}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted leading-relaxed">{activePreset.description}</p>
          </Card>

          {/* Configuration Fields */}
          <Card className="p-5 sm:p-6 grid gap-5">
            <div>
              <h2 className="font-serif text-xl text-fg">2. API Credentials & Model</h2>
              <p className="text-sm text-muted mt-1">Configure your credentials and model name for {activePreset.name}.</p>
            </div>

            {/* Base URL */}
            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="base-url-input" className="text-sm font-semibold text-fg flex items-center gap-2">
                  <Globe className="size-4 text-primary" aria-hidden="true" />
                  API Base URL
                </label>
                {settings.baseUrl !== activePreset.defaultBaseUrl && (
                  <button
                    type="button"
                    onClick={() => setSettings((p) => ({ ...p, baseUrl: activePreset.defaultBaseUrl }))}
                    className="text-xs text-primary hover:underline"
                  >
                    Reset to default
                  </button>
                )}
              </div>
              <input
                id="base-url-input"
                type="text"
                value={settings.baseUrl}
                onChange={(e) => {
                  setSettings((p) => ({ ...p, baseUrl: e.target.value }));
                  setIsSaved(false);
                }}
                placeholder={activePreset.defaultBaseUrl}
                className="nm-inset w-full rounded-xl border border-border-light px-4 py-2.5 text-sm text-fg placeholder:text-subtle focus:outline-none focus-visible:outline-2 focus-visible:outline-primary"
              />
              <span className="text-xs text-muted">
                Endpoint where chat requests are sent (e.g. <code>{activePreset.defaultBaseUrl}</code>)
              </span>
            </div>

            {/* API Key */}
            <div className="grid gap-1.5">
              <label htmlFor="api-key-input" className="text-sm font-semibold text-fg flex items-center gap-2">
                <KeyRound className="size-4 text-primary" aria-hidden="true" />
                API Key
              </label>
              <div className="relative">
                <input
                  id="api-key-input"
                  type={showKey ? "text" : "password"}
                  value={settings.apiKey}
                  onChange={(e) => {
                    setSettings((p) => ({ ...p, apiKey: e.target.value }));
                    setIsSaved(false);
                  }}
                  placeholder={activePreset.placeholderKey}
                  className="nm-inset w-full rounded-xl border border-border-light px-4 py-2.5 pr-12 text-sm text-fg placeholder:text-subtle focus:outline-none focus-visible:outline-2 focus-visible:outline-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-fg rounded-lg transition-colors"
                  aria-label={showKey ? "Hide API key" : "Show API key"}
                >
                  {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {settings.provider === "xai" && !settings.apiKey && serverStatus?.hasEnvKey ? (
                <span className="text-xs text-ok flex items-center gap-1">
                  <CheckCircle2 className="size-3.5" />
                  Using environment XAI_API_KEY from server. Enter a custom key above to override.
                </span>
              ) : settings.provider === "ollama" ? (
                <span className="text-xs text-muted">Local Ollama does not require an API key.</span>
              ) : (
                <span className="text-xs text-muted">Your key is stored in your browser session and never shared.</span>
              )}
            </div>

            {/* Primary Model Name */}
            <div className="grid gap-1.5">
              <label htmlFor="model-name-input" className="text-sm font-semibold text-fg flex items-center gap-2">
                <Bot className="size-4 text-primary" aria-hidden="true" />
                Primary Model Name
              </label>
              <input
                id="model-name-input"
                type="text"
                value={settings.primaryModel}
                onChange={(e) => {
                  setSettings((p) => ({ ...p, primaryModel: e.target.value }));
                  setIsSaved(false);
                }}
                placeholder={activePreset.defaultModel}
                className="nm-inset w-full rounded-xl border border-border-light px-4 py-2.5 text-sm text-fg placeholder:text-subtle focus:outline-none focus-visible:outline-2 focus-visible:outline-primary font-mono text-xs"
              />
              {/* Suggested Model Pills */}
              {activePreset.suggestedModels.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <span className="text-xs text-muted mr-1">Suggestions:</span>
                  {activePreset.suggestedModels.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSettings((p) => ({ ...p, primaryModel: s.id, modelLabel: s.label }));
                        setIsSaved(false);
                      }}
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-lg border transition-all",
                        settings.primaryModel === s.id
                          ? "gradient-primary text-white border-primary/20 shadow-sm"
                          : "nm-raised-sm bg-surface text-fg border-border-light hover:border-primary/30",
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Model Display Label */}
            <div className="grid gap-1.5">
              <label htmlFor="model-label-input" className="text-sm font-semibold text-fg flex items-center gap-2">
                <Layers className="size-4 text-primary" aria-hidden="true" />
                Display Label
              </label>
              <input
                id="model-label-input"
                type="text"
                value={settings.modelLabel}
                onChange={(e) => {
                  setSettings((p) => ({ ...p, modelLabel: e.target.value }));
                  setIsSaved(false);
                }}
                placeholder="e.g. GPT-4o Omni"
                className="nm-inset w-full rounded-xl border border-border-light px-4 py-2.5 text-sm text-fg placeholder:text-subtle focus:outline-none focus-visible:outline-2 focus-visible:outline-primary"
              />
              <span className="text-xs text-muted">Friendly name shown across the UI.</span>
            </div>

            {/* Temperature */}
            <div className="grid gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-fg">Temperature (Factual Precision)</span>
                <span className="font-mono text-xs text-primary font-bold">{settings.temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.temperature}
                onChange={(e) => {
                  setSettings((p) => ({ ...p, temperature: parseFloat(e.target.value) }));
                  setIsSaved(false);
                }}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[11px] text-muted">
                <span>0.0 (Strict / Deterministic)</span>
                <span>0.3 (Recommended for Verification)</span>
                <span>1.0 (Creative)</span>
              </div>
            </div>

            {/* ── Test Result Banner ── */}
            {testResult && (
              <div
                className={cn(
                  "p-4 rounded-2xl border text-sm grid gap-1.5",
                  testResult.ok ? "bg-ok-bg text-ok border-ok/20" : "bg-bad-bg text-bad border-bad/20",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold">
                    {testResult.ok ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
                    <span>{testResult.ok ? "Connection Successful" : "Connection Failed"}</span>
                  </div>
                  {testResult.latencyMs !== undefined && (
                    <span className="text-xs opacity-80">{testResult.latencyMs} ms</span>
                  )}
                </div>
                <p className="text-xs leading-relaxed opacity-90">
                  {testResult.ok ? testResult.text : testResult.error}
                </p>
              </div>
            )}

            {/* ── Action Buttons ── */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={testing}
                className="flex-1 min-h-12 shadow-glow"
              >
                {isSaved ? (
                  <>
                    <Check className="size-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    Save as Primary Model
                  </>
                )}
              </Button>

              <Button
                variant="secondary"
                onClick={handleTest}
                disabled={testing}
                className="min-h-12 px-5"
              >
                {testing ? (
                  <>
                    <Loader2 className="size-4 animate-spin text-primary" />
                    Testing…
                  </>
                ) : (
                  <>
                    <Activity className="size-4 text-primary" />
                    Test Connection
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={handleReset}
                title="Reset to default xAI Grok"
                className="nm-raised-sm size-12 rounded-xl flex items-center justify-center text-muted hover:text-bad border border-border-light transition-all"
              >
                <RotateCcw className="size-4" />
              </button>
            </div>
          </Card>
        </div>

        {/* ── Right Column: Information & Architecture ── */}
        <aside className="grid gap-5 content-start">
          <Card className="p-5 grid gap-3.5">
            <h3 className="font-serif text-lg text-fg flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              Where is this model used?
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              When you configure a primary model, it replaces the default engine everywhere in TrustLens:
            </p>

            <ul className="grid gap-3 text-xs text-muted">
              <li className="flex items-start gap-2.5">
                <div className="size-6 rounded-lg gradient-primary flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                  <Bot className="size-3.5" />
                </div>
                <div>
                  <strong className="text-fg block">Answer Generation</strong>
                  Generates answers in the Analyze page when you click &quot;Generate answer&quot; or &quot;Generate and verify&quot;.
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <div className="size-6 rounded-lg gradient-primary flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                  <Layers className="size-3.5" />
                </div>
                <div>
                  <strong className="text-fg block">Claim Extraction</strong>
                  Analyzes long input texts and breaks them down into individual, verifiable factual claims.
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <div className="size-6 rounded-lg gradient-primary flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                  <Cpu className="size-3.5" />
                </div>
                <div>
                  <strong className="text-fg block">Evidence Auditing</strong>
                  Compares each claim against retrieved external web sources to mark claims as supported or contradicted.
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <div className="size-6 rounded-lg gradient-primary flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                  <Sparkles className="size-3.5" />
                </div>
                <div>
                  <strong className="text-fg block">Answer Improvement</strong>
                  Powers the &quot;Improve Answer&quot; tool in reports when an answer scores below the 85 trust threshold.
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <div className="size-6 rounded-lg gradient-primary flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                  <Zap className="size-3.5" />
                </div>
                <div>
                  <strong className="text-fg block">Multi-AI Comparison</strong>
                  Automatically listed as a primary choice in the Multi-AI comparison tab alongside Grok 4.5 and Grok 4.
                </div>
              </li>
            </ul>
          </Card>

          <Card className="p-5 grid gap-2.5">
            <h3 className="font-serif text-lg text-fg">Privacy & Keys</h3>
            <p className="text-xs text-muted leading-relaxed">
              API keys you enter are stored only in your browser storage and passed directly to your chosen AI provider endpoint. They are never sent to third parties or logged.
            </p>
            <Notice tone="info">
              The deterministic Trust Score and TCS composite calculations always remain mathematically computed in code — AI models never invent or manipulate the final numeric score.
            </Notice>
          </Card>
        </aside>
      </div>
    </div>
  );
}
