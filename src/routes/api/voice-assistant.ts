import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { answerAssistant } from "@/lib/assistant/respond";
import { takeRateToken } from "@/lib/ai/grok.server";
import type { AnalysisRecord } from "@/lib/types";

const Body = z.object({
  message: z.string().max(1000),
  page: z.string().max(200).optional(),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(2000) }))
    .max(20)
    .optional(),
  analysis: z.unknown().optional(),
});

export const Route = createFileRoute("/api/voice-assistant")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const text = await request.text();
        if (text.length > 200_000) {
          return Response.json({ ok: false, error: "Request is too large." }, { status: 413 });
        }
        let json: unknown;
        try {
          json = JSON.parse(text);
        } catch {
          return Response.json({ ok: false, error: "Request body must be JSON." }, { status: 400 });
        }
        const parsed = Body.safeParse(json);
        if (!parsed.success) return Response.json({ ok: false, error: "Invalid assistant request." }, { status: 400 });
        const analysis =
          parsed.data.analysis && typeof parsed.data.analysis === "object" && "scores" in parsed.data.analysis
            ? (parsed.data.analysis as AnalysisRecord)
            : null;
        const result = answerAssistant({
          message: parsed.data.message,
          history: parsed.data.history ?? [],
          analysis,
          page: parsed.data.page ?? "",
        });
        if (result.searchWeb) {
          if (!takeRateToken(8, 60_000)) {
            return Response.json({ ok: false, error: "Too many assistant searches. Please wait a moment and try again." }, { status: 429 });
          }
          try {
            const { searchEvidence } = await import("@/lib/search/webSearch.server");
            const searched = await searchEvidence([parsed.data.message]);
            const useful = searched.hits.slice(0, 4);
            if (useful.length === 0) {
              return Response.json({
                ok: true,
                text: `I couldn't find useful web results for “${parsed.data.message}”. Try rephrasing it or ask me about TrustLens and the report that's open.`,
              });
            }
            const sources = useful.map((hit) => ({
              title: hit.title,
              snippet: hit.snippet || "No preview text was retrieved. Open the source to review it.",
              url: hit.url,
              domain: hit.domain,
            }));
            return Response.json({
              ok: true,
              text: `I searched the web for “${parsed.data.message}”. These results may help; open the original pages to check their details.`,
              sources,
            });
          } catch {
            return Response.json({
              ok: true,
              text: "I couldn't reach web search just now. You can still ask me about TrustLens or the report that's open.",
            });
          }
        }
        return Response.json({ ok: true, text: result.text });
      },
    },
  },
});
