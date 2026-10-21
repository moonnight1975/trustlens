import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/analyze")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const text = await request.text();
        if (text.length > 200_000) {
          return Response.json({ ok: false, error: "Request is too large." }, { status: 413 });
        }
        let body: unknown;
        try {
          body = JSON.parse(text);
        } catch {
          return Response.json({ ok: false, error: "Request body must be JSON." }, { status: 400 });
        }
        const { runAnalysis } = await import("@/lib/verify/pipeline.server");
        const result = await runAnalysis(body);
        return Response.json(result, { status: result.ok ? 200 : 400 });
      },
    },
  },
});
