import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/settings")({
  server: {
    handlers: {
      GET: async () => {
        const { getActiveServerSettings, maskApiKey } = await import("@/lib/ai/settings.server");
        const settings = getActiveServerSettings();
        return Response.json({
          ok: true,
          settings: {
            ...settings,
            apiKey: maskApiKey(settings.apiKey),
            hasCustomKey: Boolean(settings.apiKey),
            hasEnvKey: Boolean(process.env.XAI_API_KEY),
          },
        });
      },

      POST: async ({ request }) => {
        const text = await request.text();
        let body: Record<string, unknown> = {};
        try {
          body = text ? (JSON.parse(text) as Record<string, unknown>) : {};
        } catch {
          return Response.json({ ok: false, error: "Request body must be JSON." }, { status: 400 });
        }

        const action = typeof body.action === "string" ? body.action : "save";

        // Action: Test connectivity
        if (action === "test") {
          const { grokChat } = await import("@/lib/ai/grok.server");
          const targetSettings = (body.settings && typeof body.settings === "object" ? body.settings : body) as Record<
            string,
            unknown
          >;
          const startTime = Date.now();
          const result = await grokChat({
            config: targetSettings as any,
            model: typeof targetSettings.primaryModel === "string" ? targetSettings.primaryModel : undefined,
            system: "You are an AI connectivity tester. Reply strictly with the test phrase.",
            user: "Respond with exactly: 'TrustLens connected successfully.'",
            maxTokens: 50,
            temperature: 0,
            timeoutMs: 30_000,
          });
          const latencyMs = Date.now() - startTime;
          if (!result.ok) {
            return Response.json({ ok: false, error: result.error, latencyMs }, { status: 400 });
          }
          return Response.json({ ok: true, text: result.text, model: result.model, latencyMs });
        }

        // Action: Reset
        if (action === "reset") {
          const { setActiveServerSettings } = await import("@/lib/ai/settings.server");
          const { DEFAULT_MODEL_SETTINGS } = await import("@/lib/ai/types");
          const reset = setActiveServerSettings(DEFAULT_MODEL_SETTINGS);
          return Response.json({ ok: true, settings: reset });
        }

        // Action: Save
        const { setActiveServerSettings } = await import("@/lib/ai/settings.server");
        const newSettings = (body.settings && typeof body.settings === "object" ? body.settings : body) as Record<
          string,
          unknown
        >;
        const saved = setActiveServerSettings(newSettings as any);
        return Response.json({ ok: true, settings: saved });
      },
    },
  },
});
