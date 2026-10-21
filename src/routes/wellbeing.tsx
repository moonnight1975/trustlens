import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Card } from "@/components/ui";
import { getWellbeing, listAnalyses, updateWellbeing, type WellbeingSettings } from "@/lib/storage";

export const Route = createFileRoute("/wellbeing")({
  head: () => ({ meta: [{ title: "Wellbeing · TrustLens" }] }),
  component: WellbeingPage,
});

const SESSION_KEY = "trustlens.sessionStart";

function WellbeingPage() {
  const [settings, setSettings] = useState<WellbeingSettings | null>(null);
  const [counts, setCounts] = useState({ today: 0, total: 0 });
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    setSettings(getWellbeing());
    const rows = listAnalyses();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    setCounts({
      total: rows.length,
      today: rows.filter((row) => new Date(row.createdAt).getTime() >= startOfDay.getTime()).length,
    });
    const tick = () => {
      const start = Number(sessionStorage.getItem(SESSION_KEY) || Date.now());
      setMinutes(Math.max(0, Math.round((Date.now() - start) / 60000)));
    };
    tick();
    const timer = window.setInterval(tick, 15000);
    return () => window.clearInterval(timer);
  }, []);

  if (!settings) return <p className="text-sm text-muted">Loading settings…</p>;

  function patch(next: Partial<WellbeingSettings>) {
    const saved = updateWellbeing(next);
    setSettings(saved);
  }

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="font-serif text-4xl">Digital wellbeing</h1>
        <p className="mt-2 max-w-3xl text-muted">
          AI systems can be wrong, including this one. These controls stay on this device. TrustLens does not diagnose focus, stress, or health, and it does not track you across sites.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4"><p className="text-sm text-muted">Reports today</p><p className="font-serif text-4xl">{counts.today}</p></Card>
        <Card className="p-4"><p className="text-sm text-muted">Reports saved here</p><p className="font-serif text-4xl">{counts.total}</p></Card>
        <Card className="p-4"><p className="text-sm text-muted">Minutes this session</p><p className="font-serif text-4xl">{minutes}</p></Card>
      </div>
      <Card className="grid gap-4 p-5">
        <label className="flex min-h-11 items-center justify-between gap-3 text-sm">
          <span>Verification reminder on the Analyze page</span>
          <input type="checkbox" checked={settings.verificationReminders} onChange={(event) => patch({ verificationReminders: event.target.checked })} />
        </label>
        <label className="flex min-h-11 items-center justify-between gap-3 text-sm">
          <span>Optional break reminder</span>
          <input type="checkbox" checked={settings.breakReminders} onChange={(event) => patch({ breakReminders: event.target.checked })} />
        </label>
        <label className="block text-sm font-semibold">
          Remind after (minutes)
          <input
            type="number"
            min={10}
            max={120}
            value={settings.breakMinutes}
            onChange={(event) => patch({ breakMinutes: Number(event.target.value) })}
            className="mt-1 min-h-11 w-full rounded-xl border border-border px-3"
          />
        </label>
        <p className="text-sm text-muted">Break reminders are off until you turn them on. Dismissing one snoozes it for 30 minutes.</p>
      </Card>
      <Card className="grid gap-2 p-5 text-sm">
        <h2 className="font-serif text-2xl">Checking an important claim</h2>
        <p>Read the source, not only the snippet. Note whether the page date matches the time the claim is about.</p>
        <p>Treat agreement between chatbots as a hint to look harder, not as confirmation.</p>
        <p>If a claim stays unverified, leave it uncertain. Missing evidence is not the same thing as a false claim.</p>
        <p>Step away if you have been at it for a long stretch. The reminder above is a timer, not a health judgment.</p>
      </Card>
    </div>
  );
}
