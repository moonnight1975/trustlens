import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/improve-answer")({
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
        const { improveDraft } = await import("@/lib/verify/pipeline.server");
        const result = await improveDraft(body);
        return Response.json(result, { status: result.ok ? 200 : 400 });
      },
    },
  },
});
