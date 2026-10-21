import { useRouterState } from "@tanstack/react-router";
import { ExternalLink, Mic, Send, Square, Volume2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui";
import { getAnalysis, getLastAnalysis, readChat, writeChat, type ChatSource, type ChatTurn } from "@/lib/storage";
import { safeHttpUrl } from "@/lib/urlSafety";

type Recog = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> & { length: number } }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

function getRecognition(): Recog | null {
  const root = window as Window & {
    SpeechRecognition?: new () => Recog;
    webkitSpeechRecognition?: new () => Recog;
  };
  const Ctor = root.SpeechRecognition || root.webkitSpeechRecognition;
  if (!Ctor) return null;
  const recog = new Ctor();
  recog.lang = "en-US";
  recog.interimResults = false;
  recog.continuous = false;
  return recog;
}

export function AssistantDock() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [speechNote, setSpeechNote] = useState<string | null>(null);
  const recogRef = useRef<Recog | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const listeningRef = useRef(false);
  const submitRef = useRef<(text: string) => void>(() => {});

  useEffect(() => {
    setTurns(readChat());
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [turns, open]);

  function analysisForPage() {
    const match = pathname.match(/^\/report\/([^/]+)/);
    if (match) return getAnalysis(decodeURIComponent(match[1]));
    return getLastAnalysis();
  }

  function speak(text: string) {
    if (!("speechSynthesis" in window)) {
      setSpeechNote("This browser cannot speak replies. The text answer is still shown.");
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.onstart = () => setStatus("speaking");
    utter.onend = () => setStatus("idle");
    utter.onerror = () => {
      setStatus("idle");
      setSpeechNote("Speech output failed. The text answer is still shown.");
    };
    window.speechSynthesis.speak(utter);
  }

  function stopSpeaking() {
    window.speechSynthesis?.cancel();
    setStatus("idle");
  }

  async function submit(text: string) {
    const message = text.trim();
    if (!message || status === "thinking") return;
    stopSpeaking();
    setSpeechNote(null);
    recogRef.current?.stop();
    listeningRef.current = false;
    const history = readChat();
    const userTurn: ChatTurn = { role: "user", text: message, at: new Date().toISOString() };
    const nextHistory = [...history, userTurn];
    setStatus("thinking");
    setDraft("");
    setTurns(nextHistory);
    writeChat(nextHistory);
    try {
      const response = await fetch("/api/voice-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: nextHistory.slice(-12).map((turn) => ({ role: turn.role, text: turn.text })),
          analysis: analysisForPage(),
          page: pathname,
        }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        text?: string;
        error?: string;
        sources?: ChatSource[];
      };
      if (!response.ok || !payload.ok || typeof payload.text !== "string") {
        throw new Error(payload.error || "The assistant could not answer just now.");
      }
      const sources = Array.isArray(payload.sources)
        ? payload.sources
            .filter((source) => source && typeof source.title === "string" && typeof source.snippet === "string" && Boolean(safeHttpUrl(source.url)))
            .slice(0, 4)
        : undefined;
      const assistantTurn: ChatTurn = {
        role: "assistant",
        text: payload.text,
        at: new Date().toISOString(),
        ...(sources?.length ? { sources } : {}),
      };
      const stored = [...nextHistory, assistantTurn].slice(-40);
      writeChat(stored);
      setTurns(stored);
      setStatus("idle");
      speak(payload.text);
    } catch (error) {
      const assistantTurn: ChatTurn = {
        role: "assistant",
        text: error instanceof Error
          ? error.message
          : "I couldn't reach the assistant service. Please try again.",
        at: new Date().toISOString(),
      };
      const stored = [...nextHistory, assistantTurn].slice(-40);
      writeChat(stored);
      setTurns(stored);
      setStatus("idle");
    }
  }

  // Keep submitRef current so speech callbacks can use the latest closure
  submitRef.current = submit;

  const startListening = useCallback(() => {
    stopSpeaking();
    if (recogRef.current) {
      try { recogRef.current.stop(); } catch { /* ignore */ }
      recogRef.current = null;
    }
    const recog = getRecognition();
    if (!recog) {
      setSpeechNote("This browser has no speech recognition. Type your question instead.");
      return;
    }
    setSpeechNote(null);
    recogRef.current = recog;
    listeningRef.current = true;

    recog.onresult = (event) => {
      listeningRef.current = false;
      const last = event.results.length - 1;
      const transcript = event.results?.[last]?.[0]?.transcript ?? "";
      if (!transcript.trim()) {
        setSpeechNote("No speech was recognized.");
        setStatus("idle");
        return;
      }
      setDraft(transcript);
      // Use the ref to call submit with the latest closure
      submitRef.current(transcript);
    };
    recog.onerror = (event) => {
      listeningRef.current = false;
      setStatus("idle");
      if (event.error === "network") setSpeechNote("Voice recognition is unavailable because its speech service could not connect. Type your question instead.");
      else if (event.error === "not-allowed") setSpeechNote("Microphone permission was denied. You can still type.");
      else if (event.error === "no-speech") setSpeechNote("No speech was detected. Try speaking louder or closer to the mic.");
      else if (event.error === "aborted") setSpeechNote(null);
      else setSpeechNote(`Speech recognition failed (${event.error}). You can still type.`);
    };
    recog.onend = () => {
      // Only reset to idle if we were still listening (not if submit already fired)
      if (listeningRef.current) {
        listeningRef.current = false;
        setStatus("idle");
      }
    };
    try {
      setStatus("listening");
      recog.start();
    } catch {
      listeningRef.current = false;
      setStatus("idle");
      setSpeechNote("The microphone could not be started. Check your browser permissions.");
    }
  }, []);

  function stopListening() {
    listeningRef.current = false;
    recogRef.current?.stop();
    recogRef.current = null;
    setStatus("idle");
  }

  return (
    <div className="fixed bottom-4 right-4 z-30 flex w-[min(100%-2rem,24rem)] flex-col items-end gap-2">
      {open ? (
        <section
          className="flex max-h-[70vh] w-full flex-col rounded-2xl border border-border-light nm-raised"
          style={{ background: "rgba(244,245,253,0.97)" }}
          aria-label="TrustLens Project Assistant"
        >
          <header className="flex items-center justify-between gap-2 border-b border-border-light px-4 py-3">
            <div>
              <p className="font-semibold text-fg">TrustLens Assistant</p>
              <p className="text-xs text-muted" aria-live="polite">
                {status === "listening"
                  ? "Listening…"
                  : status === "thinking"
                    ? "Thinking…"
                    : status === "speaking"
                      ? "Speaking…"
                      : "Ready"}
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => {
                stopListening();
                stopSpeaking();
                setOpen(false);
              }}
            >
              Close
            </Button>
          </header>
          <div ref={listRef} className="flex min-h-48 flex-1 flex-col gap-2 overflow-y-auto px-4 py-3">
            {turns.length === 0 ? (
              <p className="text-sm text-muted">
                Ask about this report, or ask a general question and I’ll search the web for relevant sources.
              </p>
            ) : null}
            {turns.map((turn, index) => (
              <div
                key={`${turn.at}-${index}`}
                className={
                  turn.role === "user"
                    ? "self-end rounded-2xl gradient-primary text-white px-3 py-2 text-sm max-w-[85%]"
                    : "rounded-2xl nm-inset border border-border-light px-3 py-2 text-sm max-w-[90%]"
                }
              >
                <p>{turn.text}</p>
                {turn.sources?.map((source) => {
                  const href = safeHttpUrl(source.url);
                  if (!href) return null;
                  return (
                    <article key={href} className="mt-2 border-t border-border-light pt-2">
                      <a className="inline-flex items-center gap-1 font-semibold text-primary underline" href={href} target="_blank" rel="noopener noreferrer">
                        {source.title} <ExternalLink className="size-3" aria-hidden="true" />
                      </a>
                      <p className="mt-1 text-xs text-muted">{source.domain} · {source.snippet}</p>
                    </article>
                  );
                })}
              </div>
            ))}
          </div>
          {speechNote ? <p className="px-4 text-xs text-warn">{speechNote}</p> : null}
          <form
            className="flex gap-2 border-t border-border-light p-3"
            onSubmit={(event) => {
              event.preventDefault();
              submit(draft);
            }}
          >
            <label className="sr-only" htmlFor="assistant-input">
              Message the TrustLens assistant
            </label>
            <input
              id="assistant-input"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="min-h-11 min-w-0 flex-1 rounded-xl border border-border-light nm-inset px-3 text-sm text-fg placeholder:text-subtle focus:outline-none focus-visible:outline-2 focus-visible:outline-primary"
              placeholder="Ask a question or about this report"
            />
            <Button type="submit" aria-label="Send message" disabled={status === "thinking" || !draft.trim()}>
              <Send className="size-4" aria-hidden="true" />
            </Button>
          </form>
          <div className="flex flex-wrap gap-2 px-3 pb-3">
            {status === "listening" ? (
              <Button variant="ghost" onClick={stopListening}>
                <Square className="size-4" aria-hidden="true" /> Stop listening
              </Button>
            ) : (
              <Button variant="ghost" onClick={startListening}>
                <Mic className="size-4" aria-hidden="true" /> Start listening
              </Button>
            )}
            {status === "speaking" ? (
              <Button variant="ghost" onClick={stopSpeaking}>
                <Square className="size-4" aria-hidden="true" /> Stop speaking
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={() => {
                  const last = [...turns].reverse().find((turn) => turn.role === "assistant");
                  if (last) speak(last.text);
                  else setSpeechNote("There is no reply to speak yet.");
                }}
              >
                <Volume2 className="size-4" aria-hidden="true" /> Speak
              </Button>
            )}
          </div>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={false}
          aria-label="Open TrustLens Assistant"
          className="flex items-center gap-2 rounded-full px-5 py-3 gradient-primary text-white text-sm font-semibold nm-raised border border-primary/20 hover:glow-primary-strong transition-all duration-200 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        >
          <Mic className="size-4" aria-hidden="true" />
          Assistant
        </button>
      )}
    </div>
  );
}
