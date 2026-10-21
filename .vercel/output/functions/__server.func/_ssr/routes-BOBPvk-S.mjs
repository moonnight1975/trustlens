import { i as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, Y as require_react, b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as CircleCheck, C as Eye, E as Database, F as Bot, L as ArrowRight, O as ClipboardPaste, _ as LoaderCircle, a as Trash2, b as Globe, c as Shield, l as ShieldCheck, n as X, s as Sparkles, t as Zap, v as Layers, x as FlaskConical } from "../_libs/lucide-react.mjs";
import { C as cn, _ as Card, c as getApiSettings, f as saveAnalysis, l as getWellbeing, v as FeatureChip, x as StepIndicator } from "./router-LBGi2OpZ.mjs";
import { r as generateOnScreen, t as analyzeAnswer } from "./api-CDzboM3w.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BOBPvk-S.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var EXAMPLES = [{
	label: "Established constant",
	question: "What is the speed of light in a vacuum?",
	answer: "The speed of light in a vacuum is exactly 299,792,458 metres per second. It is a defined constant in the SI system."
}, {
	label: "Incorrect number",
	question: "What is the speed of light in a vacuum?",
	answer: "The speed of light in a vacuum is 50 metres per second, which is why sunlight takes several years to reach Earth."
}];
var MODES = [
	{
		id: "manual",
		label: "Manual Input",
		subtitle: "Paste your own question and answer",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardPaste, {
			className: "size-4",
			"aria-hidden": "true"
		})
	},
	{
		id: "generate",
		label: "Generate with AI",
		subtitle: "Let TrustLens generate an answer first",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, {
			className: "size-4",
			"aria-hidden": "true"
		})
	},
	{
		id: "examples",
		label: "Load Examples",
		subtitle: "Try a sample question",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlaskConical, {
			className: "size-4",
			"aria-hidden": "true"
		})
	}
];
var WORKFLOW = [
	{
		n: 1,
		title: "Claims are extracted",
		desc: "TrustLens identifies factual claims. Opinions are not scored as facts.",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, {
			className: "size-5",
			"aria-hidden": "true"
		})
	},
	{
		n: 2,
		title: "Search for external sources",
		desc: "Search queries hit Wikipedia, Brave or web search only when those providers are configured and respond.",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, {
			className: "size-5",
			"aria-hidden": "true"
		})
	},
	{
		n: 3,
		title: "Compare claims with evidence",
		desc: "Claims are matched with retrieved text. Missing evidence stays unverified.",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, {
			className: "size-5",
			"aria-hidden": "true"
		})
	},
	{
		n: 4,
		title: "Calculate trust score",
		desc: "A transparent formula is used. Changing it means changing the scoring module.",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Database, {
			className: "size-5",
			"aria-hidden": "true"
		})
	}
];
var WHY = [
	{
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
			className: "size-5 text-primary",
			"aria-hidden": "true"
		}),
		title: "Fact-based insights",
		desc: "See what is supported, contradicted or unverified."
	},
	{
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, {
			className: "size-5 text-primary",
			"aria-hidden": "true"
		}),
		title: "Transparent sources",
		desc: "View the actual sources and evidence used."
	},
	{
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {
			className: "size-5 text-primary",
			"aria-hidden": "true"
		}),
		title: "Reduce AI hallucinations",
		desc: "Catch unsupported or misleading claims."
	},
	{
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, {
			className: "size-5 text-primary",
			"aria-hidden": "true"
		}),
		title: "Make better decisions",
		desc: "Use reliable information from trusted sources."
	}
];
function AnalyzePage() {
	const navigate = useNavigate();
	const [question, setQuestion] = (0, import_react.useState)("");
	const [answer, setAnswer] = (0, import_react.useState)("");
	const [stage, setStage] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [reminders, setReminders] = (0, import_react.useState)(true);
	const [mode, setMode] = (0, import_react.useState)("manual");
	const [apiSettings, setApiSettings] = (0, import_react.useState)(getApiSettings());
	const request = (0, import_react.useRef)(0);
	const questionRef = (0, import_react.useRef)(null);
	const answerRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		setReminders(getWellbeing().verificationReminders);
		setApiSettings(getApiSettings());
	}, []);
	const pasteInto = (0, import_react.useCallback)(async (setter) => {
		try {
			setter(await navigator.clipboard.readText());
		} catch {}
	}, []);
	async function verify(text, source, model) {
		if (!navigator.onLine) {
			setError("You are offline. Live verification needs a connection. Saved reports are still available in History.");
			return;
		}
		const mine = ++request.current;
		setStage("Checking claims against retrieved sources…");
		setError(null);
		try {
			const result = await analyzeAnswer({ data: {
				question,
				answer: text,
				answerSource: source,
				generatorModel: model
			} });
			if (request.current !== mine) return;
			if (!result.ok) {
				setError(result.error);
				setStage(null);
				return;
			}
			saveAnalysis(result.record);
			setStage(null);
			await navigate({
				to: "/report/$id",
				params: { id: result.record.id }
			});
		} catch {
			if (request.current === mine) {
				setStage(null);
				setError("Verification failed before a report could be saved.");
			}
		}
	}
	async function generate(andVerify) {
		if (!navigator.onLine) {
			setError("You are offline. Answer generation needs a connection.");
			return;
		}
		const mine = ++request.current;
		setStage("Generating an answer…");
		setError(null);
		try {
			const generated = await generateOnScreen({ data: { question } });
			if (request.current !== mine) return;
			if (!generated.ok) {
				setStage(null);
				setError(generated.error);
				return;
			}
			setAnswer(generated.answer);
			if (!andVerify) {
				setStage(null);
				return;
			}
			setStage("Checking claims against retrieved sources…");
			const result = await analyzeAnswer({ data: {
				question,
				answer: generated.answer,
				answerSource: "generated",
				generatorModel: generated.model
			} });
			if (request.current !== mine) return;
			if (!result.ok) {
				setError(result.error);
				setStage(null);
				return;
			}
			saveAnalysis(result.record);
			setStage(null);
			await navigate({
				to: "/report/$id",
				params: { id: result.record.id }
			});
		} catch {
			if (request.current === mine) {
				setStage(null);
				setError("Answer generation failed.");
			}
		}
	}
	const busy = !!stage;
	const canVerify = !busy && question.trim().length >= 3 && answer.trim().length >= 1;
	const canGenerate = !busy && question.trim().length >= 3;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "grid gap-6 lg:grid-cols-[1fr_auto]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "font-serif text-4xl sm:text-5xl leading-tight text-fg",
						children: [
							"Check an answer against",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-gradient-primary",
								children: "real sources"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-2xl text-base text-muted leading-relaxed",
						children: "Paste a question and an AI answer, or generate one here. TrustLens extracts claims, retrieves external evidence, and calculates a transparent trust score."
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureChip, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "size-3.5" }),
								label: "Real web sources"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureChip, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-3.5" }),
								label: "Claim-by-claim analysis"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureChip, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3.5" }),
								label: "Transparent scoring"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureChip, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-3.5" }),
								label: "No invented facts"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/settings",
								className: "nm-raised-sm inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 border border-primary/25 text-xs font-semibold text-primary hover:glow-primary transition-all duration-200",
								title: "Configure in Settings",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
									className: "size-3.5 text-primary",
									"aria-hidden": "true"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Primary Engine: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									className: "text-fg",
									children: apiSettings.modelLabel || apiSettings.primaryModel
								})] })]
							})
						]
					}),
					reminders ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-3 rounded-2xl border border-blue-200 bg-info-bg px-4 py-3 text-sm text-info",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
							className: "mt-0.5 size-4 flex-shrink-0",
							"aria-hidden": "true"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Important decisions need sources outside any chatbot, including this one. A high score is not a substitute for the underlying documents." })]
					}) : null
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hidden lg:flex items-start justify-center pt-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldIllustration, {})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 lg:grid-cols-[1fr_340px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "nm-inset rounded-2xl border border-border-light p-1.5 flex gap-1",
					role: "tablist",
					"aria-label": "Input mode",
					children: MODES.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						role: "tab",
						type: "button",
						"aria-selected": mode === m.id,
						onClick: () => setMode(m.id),
						className: cn("flex-1 flex flex-col items-center gap-0.5 rounded-xl px-2 py-2.5 text-xs font-semibold transition-all duration-200 min-h-0", "sm:flex-row sm:gap-2 sm:px-3 sm:py-2", mode === m.id ? "nm-raised-sm text-primary border border-primary/15 gradient-primary-soft shadow-glow" : "text-muted hover:text-fg"),
						children: [
							m.icon,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden sm:inline",
								children: m.label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "sm:hidden text-[10px]",
								children: m.label.split(" ")[0]
							})
						]
					}, m.id))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-5 sm:p-6 grid gap-6",
					children: [
						mode === "examples" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4",
							role: "tabpanel",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-semibold text-fg mb-1",
									children: "Try a sample question"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: "Select an example to populate the question and answer fields, then verify."
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid sm:grid-cols-2 gap-3",
									children: EXAMPLES.map((ex) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => {
											setQuestion(ex.question);
											setAnswer(ex.answer);
											setError(null);
											setMode("manual");
										},
										className: cn("nm-raised-sm border border-border-light rounded-2xl p-4 text-left transition-all duration-200", "hover:border-primary/25 hover:shadow-glow", "focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-semibold text-primary mb-1",
											children: ex.label
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted leading-relaxed line-clamp-3",
											children: ex.answer
										})]
									}, ex.label))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => {
										setQuestion("");
										setAnswer("");
										setError(null);
									},
									className: "flex items-center gap-2 text-sm text-muted hover:text-bad transition-colors w-fit",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
										className: "size-3.5",
										"aria-hidden": "true"
									}), "Clear All"]
								})
							]
						}),
						mode !== "examples" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3",
								role: "tabpanel",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepIndicator, {
										number: 1,
										label: "Question"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-muted -mt-2",
										children: "What should the answer address?"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
											id: "question-input",
											"aria-label": "Question",
											value: question,
											onChange: (e) => setQuestion(e.target.value),
											maxLength: 4e3,
											ref: questionRef,
											placeholder: "Type your question here… (e.g. a factual question about current events, science, technology, etc.)",
											className: cn("min-h-28 w-full resize-y px-4 py-3 text-base text-fg leading-relaxed pr-16", "nm-inset border border-border-light rounded-2xl", "placeholder:text-subtle", "focus:outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1", "transition-all duration-150")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "absolute top-2 right-2 flex flex-col gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												"aria-label": "Paste from clipboard",
												title: "Paste",
												onClick: () => pasteInto(setQuestion),
												className: "size-7 flex items-center justify-center rounded-lg text-muted hover:text-primary nm-raised-sm border border-border-light transition-all",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardPaste, {
													className: "size-3.5",
													"aria-hidden": "true"
												})
											}), question && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												"aria-label": "Clear question",
												title: "Clear",
												onClick: () => setQuestion(""),
												className: "size-7 flex items-center justify-center rounded-lg text-muted hover:text-bad nm-raised-sm border border-border-light transition-all",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
													className: "size-3.5",
													"aria-hidden": "true"
												})
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-subtle text-right",
										children: [question.length, " / 4000"]
									})
								]
							}),
							mode === "manual" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepIndicator, {
										number: 2,
										label: "AI answer"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-muted -mt-2",
										children: "Paste the answer you want checked. Leave this blank if you want TrustLens to generate an answer first."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
											id: "answer-input",
											"aria-label": "AI answer",
											value: answer,
											onChange: (e) => setAnswer(e.target.value),
											maxLength: 2e4,
											ref: answerRef,
											placeholder: "Paste the AI answer here… (from ChatGPT, Gemini, Claude, etc.)",
											className: cn("min-h-40 w-full resize-y px-4 py-3 text-base text-fg leading-relaxed pr-16", "nm-inset border border-border-light rounded-2xl", "placeholder:text-subtle", "focus:outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1", "transition-all duration-150")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "absolute top-2 right-2 flex flex-col gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												"aria-label": "Paste from clipboard",
												title: "Paste",
												onClick: () => pasteInto(setAnswer),
												className: "size-7 flex items-center justify-center rounded-lg text-muted hover:text-primary nm-raised-sm border border-border-light transition-all",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardPaste, {
													className: "size-3.5",
													"aria-hidden": "true"
												})
											}), answer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												"aria-label": "Clear answer",
												title: "Clear",
												onClick: () => setAnswer(""),
												className: "size-7 flex items-center justify-center rounded-lg text-muted hover:text-bad nm-raised-sm border border-border-light transition-all",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
													className: "size-3.5",
													"aria-hidden": "true"
												})
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-subtle text-right",
										children: [answer.length, " / 20000"]
									})
								]
							}),
							(question || answer) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-center justify-end",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => {
										setQuestion("");
										setAnswer("");
										setError(null);
									},
									className: "flex items-center gap-1.5 text-xs text-muted hover:text-bad transition-colors",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
										className: "size-3.5",
										"aria-hidden": "true"
									}), "Clear All"]
								})
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 pt-1",
							children: [
								mode === "manual" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrimaryButton, {
									disabled: !canVerify,
									busy,
									stage,
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
										className: "size-5",
										"aria-hidden": "true"
									}),
									label: "Verify pasted answer",
									subtitle: "Analyze and check against real sources",
									onClick: () => verify(answer, "user", null)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: cn("grid gap-3", mode === "manual" ? "sm:grid-cols-2" : "sm:grid-cols-1"),
									children: [
										mode !== "manual" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrimaryButton, {
											disabled: !canGenerate,
											busy,
											stage,
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
												className: "size-5",
												"aria-hidden": "true"
											}),
											label: "Generate and verify",
											subtitle: "Generate then analyze",
											onClick: () => generate(true)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SecondaryButton, {
											disabled: !canGenerate,
											busy,
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, {
												className: "size-4",
												"aria-hidden": "true"
											}),
											label: "Generate answer",
											subtitle: "Get AI answer first",
											onClick: () => generate(false)
										}),
										mode === "manual" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SecondaryButton, {
											disabled: !canGenerate,
											busy,
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
												className: "size-4",
												"aria-hidden": "true"
											}),
											label: "Generate and verify",
											subtitle: "Generate then analyze",
											onClick: () => generate(true)
										})
									]
								}),
								busy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => {
										request.current += 1;
										setStage(null);
									},
									className: "text-sm text-muted hover:text-bad transition-colors flex items-center gap-1.5 w-fit mx-auto",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
										className: "size-3.5",
										"aria-hidden": "true"
									}), "Cancel"]
								}),
								stage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-center gap-2 py-2",
									"aria-live": "polite",
									role: "status",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
										className: "size-4 text-primary animate-spin",
										"aria-hidden": "true"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-semibold text-primary",
										children: stage
									})]
								}),
								error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start gap-3 rounded-2xl border border-red-200 bg-bad-bg px-4 py-3 text-sm text-bad",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
										className: "mt-0.5 size-4 flex-shrink-0",
										"aria-hidden": "true"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: error })]
								})
							]
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "grid gap-5 content-start",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-serif text-xl mb-4",
							children: "What happens"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "grid gap-4",
							children: WORKFLOW.map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-0.5 flex-shrink-0 size-8 rounded-xl gradient-primary flex items-center justify-center text-white shadow-nm-raised-sm",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-bold",
										children: step.n
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-semibold text-fg",
									children: step.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted mt-0.5 leading-relaxed",
									children: step.desc
								})] })]
							}, step.n))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-serif text-xl mb-4",
							children: "Why it matters"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-2 gap-2",
							children: WHY.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "nm-inset rounded-xl border border-border-light p-3 grid gap-1.5",
								children: [
									w.icon,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-semibold text-fg leading-snug",
										children: w.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-muted leading-snug",
										children: w.desc
									})
								]
							}, w.title))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border-light px-4 py-3 text-xs text-muted nm-inset",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold text-fg mb-0.5",
							children: "If search or the model is unavailable"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "The report says so. TrustLens does not invent sources." })]
					})
				]
			})]
		})]
	});
}
function PrimaryButton({ disabled, busy, stage, icon, label, subtitle, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		disabled,
		onClick,
		"aria-disabled": disabled,
		className: cn("w-full rounded-2xl px-5 py-4 text-left transition-all duration-200 select-none", "gradient-primary text-white border border-primary/20", "disabled:opacity-50 disabled:cursor-not-allowed", !disabled && "hover:glow-primary-strong active:scale-[0.99]", "focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "size-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0",
					children: busy && stage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
						className: "size-5 animate-spin",
						"aria-hidden": "true"
					}) : icon
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-semibold text-base",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-white/70 mt-0.5",
					children: subtitle
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
				className: "size-5 text-white/60 flex-shrink-0",
				"aria-hidden": "true"
			})]
		})
	});
}
function SecondaryButton({ disabled, busy, icon, label, subtitle, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		disabled,
		onClick,
		"aria-disabled": disabled,
		className: cn("rounded-2xl px-4 py-3.5 text-left transition-all duration-200 select-none", "nm-raised-sm border border-border-light bg-surface", "disabled:opacity-50 disabled:cursor-not-allowed", !disabled && "hover:border-primary/25 hover:shadow-glow active:shadow-nm-inset active:scale-[0.99]", "focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "size-9 rounded-xl gradient-primary-soft border border-primary/10 flex items-center justify-center flex-shrink-0 text-primary",
				children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
					className: "size-4 animate-spin",
					"aria-hidden": "true"
				}) : icon
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-semibold text-sm text-fg",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted mt-0.5",
				children: subtitle
			})] })]
		})
	});
}
function ShieldIllustration() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative size-48 flex items-center justify-center select-none",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 rounded-full opacity-30",
				style: { background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative size-32 flex items-center justify-center rounded-3xl nm-raised border border-primary/15",
				style: { background: "linear-gradient(140deg, #f8f9ff 0%, #eef0fc 100%)" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {
					className: "size-14",
					style: {
						color: "#4338ca",
						opacity: .85
					}
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute -bottom-2 -right-2 size-9 rounded-full gradient-primary flex items-center justify-center nm-raised-sm border-2 border-white",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 text-white" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloatingLabel, {
				text: "Claims",
				style: {
					top: "2px",
					left: "4px"
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloatingLabel, {
				text: "Evidence",
				style: {
					top: "2px",
					right: "0px"
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloatingLabel, {
				text: "Sources",
				style: {
					bottom: "28px",
					left: "0px"
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloatingLabel, {
				text: "Trust Score",
				style: {
					bottom: "8px",
					right: "0px"
				}
			})
		]
	});
}
function FloatingLabel({ text, style }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute nm-raised-sm border border-primary/15 rounded-full px-2 py-0.5",
		style,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[10px] font-semibold text-primary",
			children: text
		})
	});
}
//#endregion
export { AnalyzePage as component };
