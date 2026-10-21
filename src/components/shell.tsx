import { Link, useRouterState } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/cn";
import { getWellbeing } from "@/lib/storage";

const NAV = [
  { to: "/", label: "Analyze", hover: "Verify" },
  { to: "/history", label: "History", hover: "Saved" },
  { to: "/compare", label: "Compare", hover: "Versus" },
  { to: "/multi", label: "Multi-AI", hover: "Models" },
  { to: "/verify", label: "Web Verify", hover: "Search" },
  { to: "/wellbeing", label: "Wellbeing", hover: "Health" },
  { to: "/settings", label: "Settings", hover: "Config" },
] as const;

const SESSION_KEY = "trustlens.sessionStart";
const SNOOZE_KEY = "trustlens.breakSnooze";

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [offline, setOffline] = useState(false);
  const [breakDue, setBreakDue] = useState(false);

  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    if (!sessionStorage.getItem(SESSION_KEY)) sessionStorage.setItem(SESSION_KEY, String(Date.now()));
    if (import.meta.env.PROD && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    const timer = window.setInterval(() => {
      const settings = getWellbeing();
      if (!settings.breakReminders) {
        setBreakDue(false);
        return;
      }
      const start = Number(sessionStorage.getItem(SESSION_KEY) || Date.now());
      const snooze = Number(sessionStorage.getItem(SNOOZE_KEY) || 0);
      const minutes = (Date.now() - start) / 60000;
      setBreakDue(minutes >= settings.breakMinutes && Date.now() > snooze);
    }, 15000);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Skip to content */}
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-surface focus:px-4 focus:py-2 focus:rounded-xl focus:shadow-card"
      >
        Skip to content
      </a>

      {/* ── Floating Navbar ── */}
      <header
        className="fixed top-4 left-1/2 z-20 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-6xl"
      >
        <div
          className="rounded-[2.5rem] border border-border-light backdrop-blur-xl px-3.5 py-2 sm:px-6 sm:py-2.5"
          style={{
            background: "rgba(240, 241, 251, 0.92)",
            boxShadow:
              "6px 6px 14px rgba(163, 168, 210, 0.45), -5px -5px 12px rgba(255, 255, 255, 0.85), 0 4px 24px rgba(67,56,202,0.08)",
          }}
        >
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 text-fg group shrink-0">
              <div
                className="flex items-center justify-center size-9 sm:size-10 rounded-full gradient-primary group-hover:glow-primary transition-all"
                style={{
                  boxShadow: "0 4px 14px rgba(67, 56, 202, 0.35)",
                }}
              >
                <Shield className="size-5 text-white" aria-hidden="true" />
              </div>
              <span className="hidden sm:inline font-serif text-lg font-semibold tracking-tight">TrustLens</span>
            </Link>

            {/* ── Navigation ── */}
            <nav aria-label="Primary" className="primary-nav flex items-center gap-1.5 sm:gap-2 overflow-x-auto overflow-y-hidden scrollbar-hide px-1 py-2 -mx-1 -my-2">
              {NAV.map((item) => {
                const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    aria-current={active ? "page" : undefined}
                    className={cn("btn", active && "btn-active")}
                  >
                    <span className="btn-text-one">{item.label}</span>
                    <span className="btn-text-two">{item.hover}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-24 sm:h-28" />

      {/* ── Offline banner ── */}
      {offline ? (
        <p
          className="border-b border-border-light bg-warn-bg px-4 py-3 text-center text-sm text-warn"
          role="status"
        >
          You are offline. Saved reports and history still open. Live answer generation and web verification do not run
          offline.
        </p>
      ) : null}

      {/* ── Break reminder ── */}
      {breakDue ? (
        <p
          className="flex flex-wrap items-center justify-center gap-3 border-b border-border-light bg-accent px-4 py-3 text-center text-sm text-fg"
          role="status"
        >
          You have been using TrustLens for a while. Consider a break from the screen.
          <button
            type="button"
            className="min-h-9 rounded-xl border border-border-light bg-surface px-4 font-semibold text-sm nm-raised-sm hover:border-primary/20 transition-all"
            onClick={() => {
              sessionStorage.setItem(SNOOZE_KEY, String(Date.now() + 30 * 60 * 1000));
              setBreakDue(false);
            }}
          >
            Remind me later
          </button>
        </p>
      ) : null}

      {/* ── Main content ── */}
      <main id="content" className="mx-auto max-w-6xl px-4 py-4 pb-32">
        {children}
      </main>
    </div>
  );
}
