import { createServerFn } from "@tanstack/react-start";

export const analyzeAnswer = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .handler(async ({ data }) => {
    const { runAnalysis } = await import("@/lib/verify/pipeline.server");
    return runAnalysis(data);
  });

export const verifyClaim = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .handler(async ({ data }) => {
    const { runClaimVerification } = await import("@/lib/verify/pipeline.server");
    return runClaimVerification(data);
  });

export const generateOnScreen = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .handler(async ({ data }) => {
    const { generateAnswer } = await import("@/lib/verify/pipeline.server");
    return generateAnswer(data);
  });

export const askMulti = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .handler(async ({ data }) => {
    const { askModels } = await import("@/lib/verify/pipeline.server");
    return askModels(data);
  });

export const askOneModel = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .handler(async ({ data }) => {
    const { askOne } = await import("@/lib/verify/pipeline.server");
    return askOne(data);
  });

export const improveAnswer = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .handler(async ({ data }) => {
    const { improveDraft } = await import("@/lib/verify/pipeline.server");
    return improveDraft(data);
  });

export const saveModelSettingsServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .handler(async ({ data }) => {
    const { setActiveServerSettings } = await import("@/lib/ai/settings.server");
    const settings = setActiveServerSettings((data && typeof data === "object" ? data : {}) as any);
    return { ok: true as const, settings };
  });

export const getModelSettingsServerFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const { getActiveServerSettings, maskApiKey } = await import("@/lib/ai/settings.server");
    const settings = getActiveServerSettings();
    return {
      ok: true as const,
      settings: {
        ...settings,
        apiKey: maskApiKey(settings.apiKey),
        hasCustomKey: Boolean(settings.apiKey),
        hasEnvKey: Boolean(process.env.XAI_API_KEY),
      },
    };
  });

export const testModelConnectionServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .handler(async ({ data }) => {
    const { grokChat } = await import("@/lib/ai/grok.server");
    const input = (data && typeof data === "object" ? data : {}) as Record<string, any>;
    const startTime = Date.now();
    const result = await grokChat({
      config: input.settings,
      model: input.settings?.primaryModel,
      system: "You are an AI connectivity tester for TrustLens. Keep your answer brief.",
      user: "Respond with exactly: 'TrustLens connected successfully.'",
      maxTokens: 50,
      temperature: 0,
      timeoutMs: 30_000,
    });
    const latencyMs = Date.now() - startTime;
    if (!result.ok) {
      return { ok: false as const, error: result.error, latencyMs };
    }
    return { ok: true as const, text: result.text, model: result.model, latencyMs };
  });
