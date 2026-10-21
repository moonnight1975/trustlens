import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Button, Card, Field, Notice, TextArea } from "@/components/ui";
import { SearchAnimation } from "@/components/search-animation";
import { saveAnalysis } from "@/lib/storage";
import { verifyClaim } from "@/lib/verify/api";

export const Route = createFileRoute("/verify")({
  head: () => ({ meta: [{ title: "Web Verify · TrustLens" }] }),
  component: VerifyPage,
});

function VerifyPage() {
  const navigate = useNavigate();
  const [claim, setClaim] = useState("");
  const [stage, setStage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (!navigator.onLine) {
      setError("You are offline. Web verification needs a connection.");
      return;
    }
    setStage("Retrieving sources for this claim...");
    setError(null);
    try {
      const result = await verifyClaim({ data: { claim: claim.trim() } });
      setStage(null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      saveAnalysis(result.record);
      await navigate({ to: "/report/$id", params: { id: result.record.id } });
    } catch {
      setStage(null);
      setError("Verification failed.");
    }
  }

  if (stage) {
    return <SearchAnimation />;
  }

  return (
    <div className="grid max-w-3xl gap-4">
      <div className="text-center mb-8">
        <h1 className="font-serif text-5xl mb-4">Web Verify</h1>
        <p className="text-muted text-lg max-w-xl mx-auto">
          Search a question or claim across the web, review the retrieved sources, and see how closely they support it.
        </p>
      </div>
      <Card className="grid gap-6 p-8 shadow-glow">
        <Field label="Question or claim" hint="We search this wording directly and list every source we retrieve.">
          <TextArea 
            value={claim} 
            onChange={(event) => setClaim(event.target.value)} 
            placeholder="Is UPI India's instant payment system?" 
          />
        </Field>
        <div className="flex justify-center">
          <Button 
            className="px-12 py-4 text-lg rounded-full"
            disabled={claim.trim().length < 3} 
            onClick={run}
          >
            Search and verify
          </Button>
        </div>
        {error ? <Notice tone="bad">{error}</Notice> : null}
      </Card>
    </div>
  );
}
