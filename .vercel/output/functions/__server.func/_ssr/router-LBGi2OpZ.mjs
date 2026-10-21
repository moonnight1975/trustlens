import { i as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, S as useRouter, Y as require_react, _ as lazyRouteComponent, b as Link, d as Scripts, f as HeadContent, g as Outlet, h as createRouter, p as useRouterState, v as createFileRoute, y as createRootRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as __exportAll, r as DEFAULT_MODEL_SETTINGS } from "./settings.server-CTS_aY1P.mjs";
import { i as takeRateToken } from "./grok.server-D-EFT4GT.mjs";
import { c as safeHttpUrl, n as METHODOLOGY } from "./config-RgztULDg.mjs";
import { a as object, c as unknown, i as number, n as array, o as string, r as literal, s as union, t as _enum } from "../_libs/zod.mjs";
import { T as ExternalLink, c as Shield, d as Send, g as Mic, i as TriangleAlert, o as Square, r as Volume2 } from "../_libs/lucide-react.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-LBGi2OpZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* Path-based preview hosts serve the dev server under `/{port_id}/` and strip
* that prefix before forwarding, so SSR sees `/` while the browser URL keeps the
* prefix. TanStack Start resets `basepath` on hydration, so a `rewrite` keeps
* client routing and generated links aligned with the public URL.
*/
var PATH_BASED_PREVIEW_HOSTS = /* @__PURE__ */ new Set([
	"preview.grok.genai.mil",
	"preview.grok.mil",
	"preview.grokgsac.com"
]);
var PORT_ID_PREFIX = /^\/hds-[a-z0-9]+-\d+-[a-z0-9]+(?=\/|$)/i;
function previewPathPrefix(hostname, pathname) {
	if (!PATH_BASED_PREVIEW_HOSTS.has(hostname.toLowerCase())) return void 0;
	return PORT_ID_PREFIX.exec(pathname)?.[0];
}
function prefixRewrite(prefix) {
	return {
		input: ({ url }) => {
			if (url.pathname === prefix) url.pathname = "/";
			else if (url.pathname.startsWith(`${prefix}/`)) url.pathname = url.pathname.slice(prefix.length);
			return url;
		},
		output: ({ url }) => {
			url.pathname = `${prefix}${url.pathname}`;
			return url;
		}
	};
}
function previewPathRewrite() {
	if (typeof window === "undefined") return void 0;
	const prefix = previewPathPrefix(window.location.hostname, window.location.pathname);
	return prefix ? prefixRewrite(prefix) : void 0;
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function Button({ variant = "primary", className, type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type,
		className: cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold select-none", "transition-all duration-150", "disabled:cursor-not-allowed disabled:opacity-50", "focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2", variant === "primary" && "gradient-primary text-white shadow-nm-raised-sm hover:shadow-glow active:shadow-nm-inset", variant === "secondary" && "nm-raised-sm text-primary border border-border-light hover:border-primary/30 active:shadow-nm-inset", variant === "ghost" && "nm-raised-sm text-fg border border-border-light hover:border-primary/30 active:shadow-nm-inset", variant === "danger" && "nm-raised-sm border border-border-light bg-bad-bg text-bad", className),
		...props
	});
}
function Card({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("rounded-card bg-surface nm-raised border border-border-light", className),
		...props
	});
}
function Field({ label, hint, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mb-1 block text-sm font-semibold text-fg",
				children: label
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mb-2 block text-sm text-muted leading-snug",
				children: hint
			}) : null,
			children
		]
	});
}
function TextArea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		...props,
		className: cn("min-h-32 w-full resize-y px-4 py-3 text-base text-fg leading-relaxed", "nm-inset border border-border-light rounded-2xl", "placeholder:text-subtle", "focus:outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1", "transition-all duration-150", className)
	});
}
function Notice({ tone = "info", children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: cn("rounded-xl border px-4 py-3 text-sm", tone === "info" && "bg-info-bg text-info border-blue-200", tone === "warn" && "bg-warn-bg text-warn border-yellow-200", tone === "bad" && "bg-bad-bg text-bad border-red-200"),
		children
	});
}
function FeatureChip({ icon, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "nm-raised-sm flex items-center gap-2 rounded-full px-3 py-1.5 border border-border-light",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-primary flex-shrink-0",
			children: icon
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs font-semibold text-fg whitespace-nowrap",
			children: label
		})]
	});
}
function StepIndicator({ number, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3 mb-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "gradient-primary size-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm",
			children: number
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-semibold text-fg",
			children: label
		})]
	});
}
var STORE_KEY = "trustlens.v1";
var CHAT_KEY = "trustlens.chat.v1";
var SETTINGS_KEY = "trustlens.settings.v1";
var MAX_ANALYSES = 40;
var MAX_FEEDBACK = 200;
function emptyStore() {
	return {
		version: 1,
		analyses: [],
		feedback: [],
		wellbeing: {
			breakReminders: false,
			verificationReminders: true,
			breakMinutes: 30
		},
		lastId: null
	};
}
function isAnalysis(value) {
	if (!value || typeof value !== "object") return false;
	const row = value;
	return typeof row.id === "string" && typeof row.question === "string" && typeof row.answer === "string" && typeof row.scores?.trustScore === "number" && Array.isArray(row.claims) && Array.isArray(row.evidence);
}
function migrateStore(raw) {
	const empty = emptyStore();
	if (Array.isArray(raw)) return {
		...empty,
		analyses: raw.filter(isAnalysis).slice(0, MAX_ANALYSES)
	};
	if (!raw || typeof raw !== "object") return empty;
	const row = raw;
	const analyses = Array.isArray(row.analyses) ? row.analyses.filter(isAnalysis).slice(0, MAX_ANALYSES) : [];
	const feedback = Array.isArray(row.feedback) ? row.feedback.filter((item) => {
		if (!item || typeof item !== "object") return false;
		const f = item;
		return typeof f.id === "string" && typeof f.kind === "string" && f.status === "saved";
	}).slice(0, MAX_FEEDBACK) : [];
	const wellbeing = {
		...empty.wellbeing,
		...row.wellbeing && typeof row.wellbeing === "object" ? row.wellbeing : {}
	};
	return {
		version: 1,
		analyses,
		feedback,
		wellbeing: {
			breakReminders: Boolean(wellbeing.breakReminders),
			verificationReminders: wellbeing.verificationReminders !== false,
			breakMinutes: Number.isFinite(wellbeing.breakMinutes) ? Math.min(120, Math.max(10, wellbeing.breakMinutes)) : 30
		},
		lastId: typeof row.lastId === "string" ? row.lastId : analyses[0]?.id ?? null
	};
}
function read() {
	if (typeof window === "undefined") return emptyStore();
	try {
		const raw = window.localStorage.getItem(STORE_KEY);
		if (!raw) return emptyStore();
		return migrateStore(JSON.parse(raw));
	} catch {
		return emptyStore();
	}
}
function write(store) {
	if (typeof window === "undefined") throw new Error("Storage is only available in the browser.");
	window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
}
function listAnalyses() {
	return read().analyses;
}
function getAnalysis(id) {
	return read().analyses.find((item) => item.id === id) ?? null;
}
function getLastAnalysis() {
	const store = read();
	if (store.lastId) return store.analyses.find((item) => item.id === store.lastId) ?? store.analyses[0] ?? null;
	return store.analyses[0] ?? null;
}
function saveAnalysis(record) {
	const store = read();
	store.analyses = [record, ...store.analyses.filter((item) => item.id !== record.id)].slice(0, MAX_ANALYSES);
	store.lastId = record.id;
	if (record.improvement?.ofId) store.analyses = store.analyses.map((item) => item.id === record.improvement?.ofId ? {
		...item,
		improvedChildId: record.id
	} : item);
	write(store);
	return record;
}
function deleteAnalysis(id) {
	const store = read();
	store.analyses = store.analyses.filter((item) => item.id !== id);
	if (store.lastId === id) store.lastId = store.analyses[0]?.id ?? null;
	write(store);
}
function saveFeedback(input) {
	const store = read();
	const record = {
		...input,
		note: input.note.slice(0, 500),
		id: crypto.randomUUID(),
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		status: "saved"
	};
	store.feedback = [record, ...store.feedback].slice(0, MAX_FEEDBACK);
	write(store);
	return record;
}
function updateWellbeing(patch) {
	const store = read();
	store.wellbeing = {
		...store.wellbeing,
		...patch
	};
	write(store);
	return store.wellbeing;
}
function getWellbeing() {
	return read().wellbeing;
}
function syncSettingsCookie(settings) {
	if (typeof document === "undefined") return;
	try {
		const value = encodeURIComponent(JSON.stringify(settings));
		document.cookie = `trustlens_model_settings=${value}; path=/; max-age=31536000; SameSite=Lax`;
	} catch {}
}
function getApiSettings() {
	if (typeof window === "undefined") return { ...DEFAULT_MODEL_SETTINGS };
	try {
		const raw = window.localStorage.getItem(SETTINGS_KEY);
		if (!raw) return { ...DEFAULT_MODEL_SETTINGS };
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object") return { ...DEFAULT_MODEL_SETTINGS };
		return {
			provider: parsed.provider || DEFAULT_MODEL_SETTINGS.provider,
			apiKey: typeof parsed.apiKey === "string" ? parsed.apiKey : "",
			baseUrl: parsed.baseUrl || DEFAULT_MODEL_SETTINGS.baseUrl,
			primaryModel: parsed.primaryModel || DEFAULT_MODEL_SETTINGS.primaryModel,
			modelLabel: parsed.modelLabel || DEFAULT_MODEL_SETTINGS.modelLabel,
			temperature: typeof parsed.temperature === "number" ? parsed.temperature : DEFAULT_MODEL_SETTINGS.temperature,
			maxTokens: parsed.maxTokens
		};
	} catch {
		return { ...DEFAULT_MODEL_SETTINGS };
	}
}
function saveApiSettings(settings) {
	if (typeof window === "undefined") return settings;
	try {
		window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
		syncSettingsCookie(settings);
	} catch {}
	return settings;
}
function resetApiSettings() {
	if (typeof window === "undefined") return { ...DEFAULT_MODEL_SETTINGS };
	try {
		window.localStorage.removeItem(SETTINGS_KEY);
		syncSettingsCookie(DEFAULT_MODEL_SETTINGS);
	} catch {}
	return { ...DEFAULT_MODEL_SETTINGS };
}
function readChat() {
	if (typeof window === "undefined") return [];
	try {
		const raw = JSON.parse(window.localStorage.getItem("trustlens.chat.v1") || "[]");
		if (!Array.isArray(raw)) return [];
		return raw.filter((item) => {
			if (!item || typeof item !== "object") return false;
			const turn = item;
			return (turn.role === "user" || turn.role === "assistant") && typeof turn.text === "string";
		}).slice(-40);
	} catch {
		return [];
	}
}
function writeChat(turns) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(CHAT_KEY, JSON.stringify(turns.slice(-40)));
}
function buildEvaluationDataset() {
	const store = read();
	return {
		schema: "trustlens-eval-v1",
		exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
		note: "User feedback is not ground truth and is not used to train a model. This file is a later evaluation dataset only.",
		feedback: store.feedback,
		analyses: store.analyses.map((item) => ({
			id: item.id,
			createdAt: item.createdAt,
			question: item.question,
			trustScore: item.scores.trustScore,
			riskLevel: item.scores.riskLevel,
			formulaVersion: item.scores.formulaVersion,
			evidenceMode: item.evidenceMode,
			claimStatuses: item.claims.map((claim) => ({
				id: claim.id,
				status: claim.status,
				text: claim.text
			})),
			improvementOf: item.improvement?.ofId ?? null
		}))
	};
}
function getRecognition() {
	const root = window;
	const Ctor = root.SpeechRecognition || root.webkitSpeechRecognition;
	if (!Ctor) return null;
	const recog = new Ctor();
	recog.lang = "en-US";
	recog.interimResults = false;
	recog.continuous = false;
	return recog;
}
function AssistantDock() {
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const [open, setOpen] = (0, import_react.useState)(false);
	const [turns, setTurns] = (0, import_react.useState)([]);
	const [draft, setDraft] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("idle");
	const [speechNote, setSpeechNote] = (0, import_react.useState)(null);
	const recogRef = (0, import_react.useRef)(null);
	const listRef = (0, import_react.useRef)(null);
	const listeningRef = (0, import_react.useRef)(false);
	const submitRef = (0, import_react.useRef)(() => {});
	(0, import_react.useEffect)(() => {
		setTurns(readChat());
	}, []);
	(0, import_react.useEffect)(() => {
		listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
	}, [turns, open]);
	function analysisForPage() {
		const match = pathname.match(/^\/report\/([^/]+)/);
		if (match) return getAnalysis(decodeURIComponent(match[1]));
		return getLastAnalysis();
	}
	function speak(text) {
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
	async function submit(text) {
		const message = text.trim();
		if (!message || status === "thinking") return;
		stopSpeaking();
		setSpeechNote(null);
		recogRef.current?.stop();
		listeningRef.current = false;
		const history = readChat();
		const userTurn = {
			role: "user",
			text: message,
			at: (/* @__PURE__ */ new Date()).toISOString()
		};
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
					history: nextHistory.slice(-12).map((turn) => ({
						role: turn.role,
						text: turn.text
					})),
					analysis: analysisForPage(),
					page: pathname
				})
			});
			const payload = await response.json();
			if (!response.ok || !payload.ok || typeof payload.text !== "string") throw new Error(payload.error || "The assistant could not answer just now.");
			const sources = Array.isArray(payload.sources) ? payload.sources.filter((source) => source && typeof source.title === "string" && typeof source.snippet === "string" && Boolean(safeHttpUrl(source.url))).slice(0, 4) : void 0;
			const assistantTurn = {
				role: "assistant",
				text: payload.text,
				at: (/* @__PURE__ */ new Date()).toISOString(),
				...sources?.length ? { sources } : {}
			};
			const stored = [...nextHistory, assistantTurn].slice(-40);
			writeChat(stored);
			setTurns(stored);
			setStatus("idle");
			speak(payload.text);
		} catch (error) {
			const assistantTurn = {
				role: "assistant",
				text: error instanceof Error ? error.message : "I couldn't reach the assistant service. Please try again.",
				at: (/* @__PURE__ */ new Date()).toISOString()
			};
			const stored = [...nextHistory, assistantTurn].slice(-40);
			writeChat(stored);
			setTurns(stored);
			setStatus("idle");
		}
	}
	submitRef.current = submit;
	const startListening = (0, import_react.useCallback)(() => {
		stopSpeaking();
		if (recogRef.current) {
			try {
				recogRef.current.stop();
			} catch {}
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed bottom-4 right-4 z-30 flex w-[min(100%-2rem,24rem)] flex-col items-end gap-2",
		children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "flex max-h-[70vh] w-full flex-col rounded-2xl border border-border-light nm-raised",
			style: { background: "rgba(244,245,253,0.97)" },
			"aria-label": "TrustLens Project Assistant",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex items-center justify-between gap-2 border-b border-border-light px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold text-fg",
						children: "TrustLens Assistant"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						"aria-live": "polite",
						children: status === "listening" ? "Listening…" : status === "thinking" ? "Thinking…" : status === "speaking" ? "Speaking…" : "Ready"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => {
							stopListening();
							stopSpeaking();
							setOpen(false);
						},
						children: "Close"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					ref: listRef,
					className: "flex min-h-48 flex-1 flex-col gap-2 overflow-y-auto px-4 py-3",
					children: [turns.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Ask about this report, or ask a general question and I’ll search the web for relevant sources."
					}) : null, turns.map((turn, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: turn.role === "user" ? "self-end rounded-2xl gradient-primary text-white px-3 py-2 text-sm max-w-[85%]" : "rounded-2xl nm-inset border border-border-light px-3 py-2 text-sm max-w-[90%]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: turn.text }), turn.sources?.map((source) => {
							const href = safeHttpUrl(source.url);
							if (!href) return null;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "mt-2 border-t border-border-light pt-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									className: "inline-flex items-center gap-1 font-semibold text-primary underline",
									href,
									target: "_blank",
									rel: "noopener noreferrer",
									children: [
										source.title,
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, {
											className: "size-3",
											"aria-hidden": "true"
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-xs text-muted",
									children: [
										source.domain,
										" · ",
										source.snippet
									]
								})]
							}, href);
						})]
					}, `${turn.at}-${index}`))]
				}),
				speechNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-4 text-xs text-warn",
					children: speechNote
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "flex gap-2 border-t border-border-light p-3",
					onSubmit: (event) => {
						event.preventDefault();
						submit(draft);
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "sr-only",
							htmlFor: "assistant-input",
							children: "Message the TrustLens assistant"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "assistant-input",
							value: draft,
							onChange: (event) => setDraft(event.target.value),
							className: "min-h-11 min-w-0 flex-1 rounded-xl border border-border-light nm-inset px-3 text-sm text-fg placeholder:text-subtle focus:outline-none focus-visible:outline-2 focus-visible:outline-primary",
							placeholder: "Ask a question or about this report"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							"aria-label": "Send message",
							disabled: status === "thinking" || !draft.trim(),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, {
								className: "size-4",
								"aria-hidden": "true"
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2 px-3 pb-3",
					children: [status === "listening" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						onClick: stopListening,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, {
							className: "size-4",
							"aria-hidden": "true"
						}), " Stop listening"]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						onClick: startListening,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, {
							className: "size-4",
							"aria-hidden": "true"
						}), " Start listening"]
					}), status === "speaking" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						onClick: stopSpeaking,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, {
							className: "size-4",
							"aria-hidden": "true"
						}), " Stop speaking"]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						onClick: () => {
							const last = [...turns].reverse().find((turn) => turn.role === "assistant");
							if (last) speak(last.text);
							else setSpeechNote("There is no reply to speak yet.");
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, {
							className: "size-4",
							"aria-hidden": "true"
						}), " Speak"]
					})]
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => setOpen(true),
			"aria-expanded": false,
			"aria-label": "Open TrustLens Assistant",
			className: "flex items-center gap-2 rounded-full px-5 py-3 gradient-primary text-white text-sm font-semibold nm-raised border border-primary/20 hover:glow-primary-strong transition-all duration-200 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, {
				className: "size-4",
				"aria-hidden": "true"
			}), "Assistant"]
		})
	});
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var NAV = [
	{
		to: "/",
		label: "Analyze",
		hover: "Verify"
	},
	{
		to: "/history",
		label: "History",
		hover: "Saved"
	},
	{
		to: "/compare",
		label: "Compare",
		hover: "Versus"
	},
	{
		to: "/multi",
		label: "Multi-AI",
		hover: "Models"
	},
	{
		to: "/verify",
		label: "Web Verify",
		hover: "Search"
	},
	{
		to: "/wellbeing",
		label: "Wellbeing",
		hover: "Health"
	},
	{
		to: "/settings",
		label: "Settings",
		hover: "Config"
	}
];
var SESSION_KEY = "trustlens.sessionStart";
var SNOOZE_KEY = "trustlens.breakSnooze";
function Shell({ children }) {
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const [offline, setOffline] = (0, import_react.useState)(false);
	const [breakDue, setBreakDue] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const sync = () => setOffline(!navigator.onLine);
		sync();
		window.addEventListener("online", sync);
		window.addEventListener("offline", sync);
		if (!sessionStorage.getItem(SESSION_KEY)) sessionStorage.setItem(SESSION_KEY, String(Date.now()));
		if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => void 0);
		const timer = window.setInterval(() => {
			const settings = getWellbeing();
			if (!settings.breakReminders) {
				setBreakDue(false);
				return;
			}
			const start = Number(sessionStorage.getItem(SESSION_KEY) || Date.now());
			const snooze = Number(sessionStorage.getItem(SNOOZE_KEY) || 0);
			const minutes = (Date.now() - start) / 6e4;
			setBreakDue(minutes >= settings.breakMinutes && Date.now() > snooze);
		}, 15e3);
		return () => {
			window.removeEventListener("online", sync);
			window.removeEventListener("offline", sync);
			window.clearInterval(timer);
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: "#content",
				className: "sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-surface focus:px-4 focus:py-2 focus:rounded-xl focus:shadow-card",
				children: "Skip to content"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "fixed top-4 left-1/2 z-20 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-6xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-[2.5rem] border border-border-light backdrop-blur-xl px-3.5 py-2 sm:px-6 sm:py-2.5",
					style: {
						background: "rgba(240, 241, 251, 0.92)",
						boxShadow: "6px 6px 14px rgba(163, 168, 210, 0.45), -5px -5px 12px rgba(255, 255, 255, 0.85), 0 4px 24px rgba(67,56,202,0.08)"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3 sm:gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							className: "flex items-center gap-2.5 text-fg group shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-center justify-center size-9 sm:size-10 rounded-full gradient-primary group-hover:glow-primary transition-all",
								style: { boxShadow: "0 4px 14px rgba(67, 56, 202, 0.35)" },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {
									className: "size-5 text-white",
									"aria-hidden": "true"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden sm:inline font-serif text-lg font-semibold tracking-tight",
								children: "TrustLens"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
							"aria-label": "Primary",
							className: "flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide py-1",
							children: NAV.map((item) => {
								const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: item.to,
									"aria-current": active ? "page" : void 0,
									className: cn("btn", active && "btn-active"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "btn-text-one",
										children: item.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "btn-text-two",
										children: item.hover
									})]
								}, item.to);
							})
						})]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-24 sm:h-28" }),
			offline ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "border-b border-border-light bg-warn-bg px-4 py-3 text-center text-sm text-warn",
				role: "status",
				children: "You are offline. Saved reports and history still open. Live answer generation and web verification do not run offline."
			}) : null,
			breakDue ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex flex-wrap items-center justify-center gap-3 border-b border-border-light bg-accent px-4 py-3 text-center text-sm text-fg",
				role: "status",
				children: ["You have been using TrustLens for a while. Consider a break from the screen.", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-9 rounded-xl border border-border-light bg-surface px-4 font-semibold text-sm nm-raised-sm hover:border-primary/20 transition-all",
					onClick: () => {
						sessionStorage.setItem(SNOOZE_KEY, String(Date.now() + 18e5));
						setBreakDue(false);
					},
					children: "Remind me later"
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				id: "content",
				className: "mx-auto max-w-6xl px-4 py-4 pb-32",
				children
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var styles_default = "/assets/styles-auHigRf_.css";
var Route$12 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "TrustLens" },
			{
				name: "description",
				content: "TrustLens checks AI answers against retrieved evidence and calculates a transparent trust score."
			},
			{
				name: "theme-color",
				content: "#4338ca"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,640&family=Source+Sans+3:wght@400;500;600;700&display=swap"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthProvider, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssistantDock, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, { position: "top-center" })
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var $$splitComponentImporter$7 = () => import("./routes-BOBPvk-S.mjs");
var Route$11 = createFileRoute("/")({
	head: () => ({ meta: [{ title: "Analyze · TrustLens" }] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./compare-B9TkK60-.mjs");
var Route$10 = createFileRoute("/compare")({
	head: () => ({ meta: [{ title: "Compare · TrustLens" }] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./history-PnJ5lyjK.mjs");
var Route$9 = createFileRoute("/history")({
	head: () => ({ meta: [{ title: "History · TrustLens" }] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./multi-H6Oj94lA.mjs");
var Route$8 = createFileRoute("/multi")({
	head: () => ({ meta: [{ title: "Multi-AI · TrustLens" }] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./settings-NKk92tJp.mjs");
var Route$7 = createFileRoute("/settings")({
	head: () => ({ meta: [{ title: "Settings & AI Model · TrustLens" }] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./verify-q18Obqz8.mjs");
var Route$6 = createFileRoute("/verify")({
	head: () => ({ meta: [{ title: "Web Verify · TrustLens" }] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./wellbeing-CqaangMT.mjs");
var Route$5 = createFileRoute("/wellbeing")({
	head: () => ({ meta: [{ title: "Wellbeing · TrustLens" }] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var Route$4 = createFileRoute("/api/analyze")({ server: { handlers: { POST: async ({ request }) => {
	const text = await request.text();
	if (text.length > 2e5) return Response.json({
		ok: false,
		error: "Request is too large."
	}, { status: 413 });
	let body;
	try {
		body = JSON.parse(text);
	} catch {
		return Response.json({
			ok: false,
			error: "Request body must be JSON."
		}, { status: 400 });
	}
	const { runAnalysis } = await import("./pipeline.server-EHTn9Zcz.mjs");
	const result = await runAnalysis(body);
	return Response.json(result, { status: result.ok ? 200 : 400 });
} } } });
var Route$3 = createFileRoute("/api/improve-answer")({ server: { handlers: { POST: async ({ request }) => {
	const text = await request.text();
	if (text.length > 2e5) return Response.json({
		ok: false,
		error: "Request is too large."
	}, { status: 413 });
	let body;
	try {
		body = JSON.parse(text);
	} catch {
		return Response.json({
			ok: false,
			error: "Request body must be JSON."
		}, { status: 400 });
	}
	const { improveDraft } = await import("./pipeline.server-EHTn9Zcz.mjs");
	const result = await improveDraft(body);
	return Response.json(result, { status: result.ok ? 200 : 400 });
} } } });
var Route$2 = createFileRoute("/api/settings")({ server: { handlers: {
	GET: async () => {
		const { getActiveServerSettings, maskApiKey } = await import("./settings.server-CTS_aY1P.mjs").then((n) => n.n);
		const settings = getActiveServerSettings();
		return Response.json({
			ok: true,
			settings: {
				...settings,
				apiKey: maskApiKey(settings.apiKey),
				hasCustomKey: Boolean(settings.apiKey),
				hasEnvKey: Boolean(process.env.XAI_API_KEY)
			}
		});
	},
	POST: async ({ request }) => {
		const text = await request.text();
		let body = {};
		try {
			body = text ? JSON.parse(text) : {};
		} catch {
			return Response.json({
				ok: false,
				error: "Request body must be JSON."
			}, { status: 400 });
		}
		const action = typeof body.action === "string" ? body.action : "save";
		if (action === "test") {
			const { grokChat } = await import("./grok.server-D-EFT4GT.mjs").then((n) => n.n);
			const targetSettings = body.settings && typeof body.settings === "object" ? body.settings : body;
			const startTime = Date.now();
			const result = await grokChat({
				config: targetSettings,
				model: typeof targetSettings.primaryModel === "string" ? targetSettings.primaryModel : void 0,
				system: "You are an AI connectivity tester. Reply strictly with the test phrase.",
				user: "Respond with exactly: 'TrustLens connected successfully.'",
				maxTokens: 50,
				temperature: 0,
				timeoutMs: 3e4
			});
			const latencyMs = Date.now() - startTime;
			if (!result.ok) return Response.json({
				ok: false,
				error: result.error,
				latencyMs
			}, { status: 400 });
			return Response.json({
				ok: true,
				text: result.text,
				model: result.model,
				latencyMs
			});
		}
		if (action === "reset") {
			const { setActiveServerSettings } = await import("./settings.server-CTS_aY1P.mjs").then((n) => n.n);
			const { DEFAULT_MODEL_SETTINGS } = await import("./settings.server-CTS_aY1P.mjs").then((n) => n.a);
			const reset = setActiveServerSettings(DEFAULT_MODEL_SETTINGS);
			return Response.json({
				ok: true,
				settings: reset
			});
		}
		const { setActiveServerSettings } = await import("./settings.server-CTS_aY1P.mjs").then((n) => n.n);
		const saved = setActiveServerSettings(body.settings && typeof body.settings === "object" ? body.settings : body);
		return Response.json({
			ok: true,
			settings: saved
		});
	}
} } });
var EVIDENCE_DISCLAIMER = "TrustLens provides evidence-based verification assistance. A source being retrieved does not automatically mean a claim is true; source quality, relevance, date, and agreement with the claim are considered.";
var AGREEMENT_DISCLAIMER = "Agreement between AI models is not evidence. Models can share training data, biases, and the same mistake. External sources are what TrustLens uses to check claims.";
var ASSISTANT_SCOPE = "I can explain TrustLens and the open report, or search the web for other questions.";
var MISSING_CONTEXT = "I don't have that information in the current TrustLens context.";
var RANK = {
	PRIMARY_OFFICIAL: 4,
	SECONDARY_REPUTABLE: 3,
	GENERAL: 2,
	LOW_CONFIDENCE: 1
};
function count(record, status) {
	return record.claims.filter((claim) => claim.status === status).length;
}
function whyScore(record) {
	const bits = [`The trust score is ${record.scores.trustScore} (${record.scores.riskLevel} risk) under formula ${record.scores.formulaVersion}.`];
	if (record.scores.factuality != null) bits.push(`Factuality is ${record.scores.factuality}.`);
	if (record.scores.evidenceSupport != null) bits.push(`Evidence support is ${record.scores.evidenceSupport}.`);
	if (record.scores.hallucinationRisk != null) bits.push(`Hallucination risk is ${record.scores.hallucinationRisk}.`);
	bits.push(`Logical consistency is ${record.scores.logicalConsistency}. Alignment is ${record.scores.semanticAlignment}.`);
	const contradicted = record.claims.filter((claim) => claim.status === "CONTRADICTED");
	if (contradicted.length) bits.push(`Contradicted claims: ${contradicted.map((claim) => claim.text).join(" ")}`);
	const unverified = record.claims.filter((claim) => claim.status === "UNVERIFIED");
	if (unverified.length) bits.push(`${unverified.length} claim(s) are unverified, which lowers confidence without marking them false.`);
	if (record.scores.notes[0]) bits.push(record.scores.notes[0]);
	return bits.join(" ");
}
function evidenceAnswer(record) {
	if (record.evidenceMode === "unavailable" || record.evidence.length === 0) return record.evidenceNote ? `External evidence verification unavailable. ${record.evidenceNote}` : "External evidence verification unavailable.";
	const lines = record.evidence.slice(0, 6).map((item) => {
		const kind = item.snippetKind === "extract" ? "extract" : item.snippetKind;
		return `${item.title} (${item.domain}, ${item.quality}, ${kind})${item.pageUpdatedAt ? `, page updated ${item.pageUpdatedAt}` : ""}: ${item.url}`;
	});
	return `Retrieved ${record.evidence.length} source(s). ${lines.join(" ")}`;
}
function strongest(record) {
	if (record.evidence.length === 0) return MISSING_CONTEXT;
	const best = [...record.evidence].sort((a, b) => RANK[b.quality] - RANK[a.quality] || b.snippet.length - a.snippet.length)[0];
	return `The strongest retrieved source by the quality label is ${best.title} at ${best.domain} (${best.quality}). URL: ${best.url}. Quality is a signal, not proof.`;
}
function claimsOf(record, status, label) {
	const rows = record.claims.filter((claim) => claim.status === status);
	if (rows.length === 0) return `No claims are marked ${label}.`;
	return `${label}: ${rows.map((claim) => claim.text).join(" ")}`;
}
function productAnswer(message) {
	if (/\bfuzzy\b/i.test(message)) return "The fuzzy trust score is a separate soft-computing view. It runs support, contradiction, and coverage through membership functions and centroid defuzzification. It does not replace the deterministic trust score.";
	if (/\btcs\b/i.test(message)) return "TCS is Trust, Confidence, and Stability. Trust comes from the fuzzy score. Confidence is an interval from claim confidence and source mix. Stability drops when time-sensitive claims lack fresh dates. Nothing here trains a model.";
	if (/how (is|does).*(score|trust)|scoring|formula|weights/i.test(message)) return METHODOLOGY;
	if (/what is trustlens|how does trustlens|what do you do|who are you/i.test(message)) return "TrustLens checks an AI answer by extracting claims, retrieving external sources, comparing claims with that text, and calculating a trust score in code. The model does not choose the score. I can explain the report that is open.";
	return null;
}
function aboutAnalysis(message, record) {
	const text = message.toLowerCase();
	if (/trust score|my score|the score/.test(text)) {
		if (/why|low|high|explain/.test(text)) return whyScore(record);
		return `Your trust score is ${record.scores.trustScore} out of 100. Risk is ${record.scores.riskLevel}. Formula ${record.scores.formulaVersion}.`;
	}
	if (/why/.test(text) && /low|high|score|risk/.test(text)) return whyScore(record);
	if (/hallucination/.test(text)) return record.scores.hallucinationRisk == null ? "Hallucination risk is not applicable because this answer had no verifiable factual claims." : `Hallucination risk is ${record.scores.hallucinationRisk} out of 100. Higher means more unsupported or contradicted material. It is not 100 minus the trust score.`;
	if (/factual/.test(text)) return record.scores.factuality == null ? MISSING_CONTEXT.replace("that information", "a factuality score") : `Factuality is ${record.scores.factuality}. That is the weighted claim-support index, not the final trust score.`;
	if (/logical/.test(text)) return `Logical consistency is ${record.scores.logicalConsistency}.`;
	if (/semantic|alignment/.test(text)) return `Semantic alignment is ${record.scores.semanticAlignment}.`;
	if (/evidence support/.test(text)) return record.scores.evidenceSupport == null ? "Evidence support is not applicable for this analysis." : `Evidence support is ${record.scores.evidenceSupport}. Coverage is ${record.scores.evidenceCoverage}. Source reliability is ${record.scores.sourceReliability}.`;
	if (/strongest source|which source/.test(text)) return strongest(record);
	if (/source|evidence|url/.test(text)) return evidenceAnswer(record);
	if (/contradict/.test(text)) return claimsOf(record, "CONTRADICTED", "Contradicted claims");
	if (/supported|which claims are support/.test(text)) return claimsOf(record, "SUPPORTED", "Supported claims");
	if (/unverified|why is this claim unverified/.test(text)) {
		const rows = record.claims.filter((claim) => claim.status === "UNVERIFIED");
		if (rows.length === 0) return "No claims are marked UNVERIFIED.";
		return rows.map((claim) => `${claim.text} — ${claim.rationale}`).join(" ");
	}
	if (/how many/.test(text)) return `Supported claims: ${count(record, "SUPPORTED")}. I don't count partial, contradicted, or unverified claims as verified. Partially supported: ${count(record, "PARTIALLY_SUPPORTED")}. Contradicted: ${count(record, "CONTRADICTED")}. Unverified: ${count(record, "UNVERIFIED")}. Not applicable: ${count(record, "NOT_APPLICABLE")}.`;
	if (/fuzzy/.test(text)) return `The fuzzy trust score for this analysis is ${record.fuzzy.score}. Inputs were support ${record.fuzzy.support}, contradiction ${record.fuzzy.contradiction}, coverage ${record.fuzzy.coverage}.`;
	if (/\btcs\b/.test(text)) return record.tcs.narrative.join(" ");
	if (/improv/.test(text)) {
		if (!record.improvement) return "This analysis is not an improved answer, or the improvement record is not on this report.";
		const delta = record.scores.trustScore - record.improvement.originalTrustScore;
		return `Original trust score ${record.improvement.originalTrustScore}. This improved answer scores ${record.scores.trustScore} (${delta >= 0 ? "+" : ""}${delta}). The change was not forced toward 85. Uncertainties: ${record.improvement.uncertainties.join(" ") || "none recorded"}.`;
	}
	if (/summar|explain this report|explain the report|explain this analysis/.test(text)) return `Question: ${record.question} Trust score ${record.scores.trustScore}, risk ${record.scores.riskLevel}. ${whyScore(record)} ${evidenceAnswer(record)}`;
	return null;
}
function isFollowUp(message) {
	return /^(why|why\??|and why\??|explain|go on|what about that)\??$/i.test(message.trim());
}
function looksGeneralKnowledge(message) {
	return /\b(capital of|who (is|was)|weather|recipe|write (me )?a poem|tell me a joke|population of|define )\b/i.test(message);
}
function answerAssistant(input) {
	const message = input.message.trim();
	if (!message) return { text: "Say or type a question about this TrustLens report." };
	let effective = message;
	if (isFollowUp(message)) {
		const previous = [...input.history].reverse().find((turn) => turn.role === "user" && !isFollowUp(turn.text));
		if (!previous) return { text: MISSING_CONTEXT };
		if (/score|trust/.test(previous.text.toLowerCase())) effective = "why is my trust score what it is";
		else if (/evidence|source/.test(previous.text.toLowerCase())) effective = "which source is strongest";
		else effective = previous.text;
	}
	if (looksGeneralKnowledge(effective) && !/trustlens|this report|my score|this analysis/i.test(effective)) return {
		text: ASSISTANT_SCOPE,
		searchWeb: true
	};
	if (/my score|trust score|hallucination|factual|logical|alignment|evidence|source|claim|contradict|unverified|fuzzy|tcs|summar|this report|this analysis|improv/i.test(effective)) {
		if (!input.analysis) return { text: MISSING_CONTEXT };
		const answer = aboutAnalysis(effective, input.analysis);
		if (answer) return { text: answer };
		if (/\b(my|this)\b/i.test(effective)) return { text: MISSING_CONTEXT };
	}
	const product = productAnswer(effective);
	if (product) return { text: product };
	if (input.page && /what page|where am i/.test(effective.toLowerCase())) return { text: `You are on ${input.page}.` };
	return {
		text: ASSISTANT_SCOPE,
		searchWeb: true
	};
}
var Body = object({
	message: string().max(1e3),
	page: string().max(200).optional(),
	history: array(object({
		role: _enum(["user", "assistant"]),
		text: string().max(2e3)
	})).max(20).optional(),
	analysis: unknown().optional()
});
var Route$1 = createFileRoute("/api/voice-assistant")({ server: { handlers: { POST: async ({ request }) => {
	const text = await request.text();
	if (text.length > 2e5) return Response.json({
		ok: false,
		error: "Request is too large."
	}, { status: 413 });
	let json;
	try {
		json = JSON.parse(text);
	} catch {
		return Response.json({
			ok: false,
			error: "Request body must be JSON."
		}, { status: 400 });
	}
	const parsed = Body.safeParse(json);
	if (!parsed.success) return Response.json({
		ok: false,
		error: "Invalid assistant request."
	}, { status: 400 });
	const analysis = parsed.data.analysis && typeof parsed.data.analysis === "object" && "scores" in parsed.data.analysis ? parsed.data.analysis : null;
	const result = answerAssistant({
		message: parsed.data.message,
		history: parsed.data.history ?? [],
		analysis,
		page: parsed.data.page ?? ""
	});
	if (result.searchWeb) {
		if (!takeRateToken(8, 6e4)) return Response.json({
			ok: false,
			error: "Too many assistant searches. Please wait a moment and try again."
		}, { status: 429 });
		try {
			const { searchEvidence } = await import("./webSearch.server-BxpE-Quy.mjs");
			const useful = (await searchEvidence([parsed.data.message])).hits.slice(0, 4);
			if (useful.length === 0) return Response.json({
				ok: true,
				text: `I couldn't find useful web results for “${parsed.data.message}”. Try rephrasing it or ask me about TrustLens and the report that's open.`
			});
			const sources = useful.map((hit) => ({
				title: hit.title,
				snippet: hit.snippet || "No preview text was retrieved. Open the source to review it.",
				url: hit.url,
				domain: hit.domain
			}));
			return Response.json({
				ok: true,
				text: `I searched the web for “${parsed.data.message}”. These results may help; open the original pages to check their details.`,
				sources
			});
		} catch {
			return Response.json({
				ok: true,
				text: "I couldn't reach web search just now. You can still ask me about TrustLens or the report that's open."
			});
		}
	}
	return Response.json({
		ok: true,
		text: result.text
	});
} } } });
var $$splitComponentImporter = () => import("./report._id-YK7LfH-K.mjs");
var Route = createFileRoute("/report/$id")({
	head: () => ({ meta: [{ title: "Report · TrustLens" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var rootRouteChildren = {
	IndexRoute: Route$11.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$12
	}),
	CompareRoute: Route$10.update({
		id: "/compare",
		path: "/compare",
		getParentRoute: () => Route$12
	}),
	HistoryRoute: Route$9.update({
		id: "/history",
		path: "/history",
		getParentRoute: () => Route$12
	}),
	MultiRoute: Route$8.update({
		id: "/multi",
		path: "/multi",
		getParentRoute: () => Route$12
	}),
	SettingsRoute: Route$7.update({
		id: "/settings",
		path: "/settings",
		getParentRoute: () => Route$12
	}),
	VerifyRoute: Route$6.update({
		id: "/verify",
		path: "/verify",
		getParentRoute: () => Route$12
	}),
	WellbeingRoute: Route$5.update({
		id: "/wellbeing",
		path: "/wellbeing",
		getParentRoute: () => Route$12
	}),
	ApiAnalyzeRoute: Route$4.update({
		id: "/api/analyze",
		path: "/api/analyze",
		getParentRoute: () => Route$12
	}),
	ApiImproveAnswerRoute: Route$3.update({
		id: "/api/improve-answer",
		path: "/api/improve-answer",
		getParentRoute: () => Route$12
	}),
	ApiSettingsRoute: Route$2.update({
		id: "/api/settings",
		path: "/api/settings",
		getParentRoute: () => Route$12
	}),
	ApiVoiceAssistantRoute: Route$1.update({
		id: "/api/voice-assistant",
		path: "/api/voice-assistant",
		getParentRoute: () => Route$12
	}),
	ReportIdRoute: Route.update({
		id: "/report/$id",
		path: "/report/$id",
		getParentRoute: () => Route$12
	})
};
var routeTree = Route$12._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		rewrite: previewPathRewrite(),
		defaultErrorComponent: AppErrorComponent,
		scrollRestoration: true
	});
}
//#endregion
export { cn as C, TextArea as S, Card as _, buildEvaluationDataset as a, Notice as b, getApiSettings as c, resetApiSettings as d, saveAnalysis as f, Button as g, updateWellbeing as h, EVIDENCE_DISCLAIMER as i, getWellbeing as l, saveFeedback as m, Route as n, deleteAnalysis as o, saveApiSettings as p, AGREEMENT_DISCLAIMER as r, getAnalysis as s, router_exports as t, listAnalyses as u, FeatureChip as v, StepIndicator as x, Field as y };
