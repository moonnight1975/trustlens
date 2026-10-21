import { i as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, Y as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as MODEL_PRESETS } from "./settings.server-CTS_aY1P.mjs";
import { A as CircleCheck, C as Eye, D as Cpu, F as Bot, P as Check, R as Activity, _ as LoaderCircle, b as Globe, j as CircleAlert, l as ShieldCheck, m as RotateCcw, p as Save, s as Sparkles, t as Zap, u as Server, v as Layers, w as EyeOff, y as KeyRound } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as cn, _ as Card, b as Notice, c as getApiSettings, d as resetApiSettings, g as Button, p as saveApiSettings } from "./router-LBGi2OpZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-NKk92tJp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SettingsPage() {
	const [settings, setSettings] = (0, import_react.useState)(() => getApiSettings());
	const [showKey, setShowKey] = (0, import_react.useState)(false);
	const [testing, setTesting] = (0, import_react.useState)(false);
	const [testResult, setTestResult] = (0, import_react.useState)(null);
	const [serverStatus, setServerStatus] = (0, import_react.useState)(null);
	const [isSaved, setIsSaved] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const local = getApiSettings();
		setSettings(local);
		fetch("/api/settings").then((r) => r.json()).then((res) => {
			if (res.ok) setServerStatus({
				hasCustomKey: res.settings.hasCustomKey,
				hasEnvKey: res.settings.hasEnvKey,
				primaryModel: res.settings.primaryModel
			});
		}).catch(() => void 0);
	}, []);
	const activePreset = MODEL_PRESETS[settings.provider] || MODEL_PRESETS.custom;
	function handleSelectPreset(presetKey) {
		const preset = MODEL_PRESETS[presetKey];
		setSettings((prev) => ({
			...prev,
			provider: presetKey,
			baseUrl: preset.defaultBaseUrl,
			primaryModel: preset.defaultModel,
			modelLabel: preset.name
		}));
		setTestResult(null);
		setIsSaved(false);
	}
	async function handleTest() {
		setTesting(true);
		setTestResult(null);
		try {
			const data = await (await fetch("/api/settings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "test",
					settings
				})
			})).json();
			if (data.ok) {
				setTestResult({
					ok: true,
					text: data.text,
					model: data.model,
					latencyMs: data.latencyMs
				});
				toast.success(`Connected to ${data.model} successfully!`);
			} else {
				setTestResult({
					ok: false,
					error: data.error,
					latencyMs: data.latencyMs
				});
				toast.error("Connection failed: " + (data.error || "Unknown error"));
			}
		} catch (err) {
			setTestResult({
				ok: false,
				error: err instanceof Error ? err.message : "Failed to run test"
			});
			toast.error("Test request failed");
		} finally {
			setTesting(false);
		}
	}
	async function handleSave() {
		try {
			saveApiSettings(settings);
			await fetch("/api/settings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "save",
					settings
				})
			});
			setIsSaved(true);
			toast.success(`Primary model set to ${settings.primaryModel}! Whole website will now answer with this model.`);
			setTimeout(() => setIsSaved(false), 3e3);
		} catch {
			toast.error("Failed to save settings to server.");
		}
	}
	async function handleReset() {
		const def = resetApiSettings();
		setSettings(def);
		setTestResult(null);
		await fetch("/api/settings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ action: "reset" })
		});
		toast.info("Settings reset to default xAI Grok 4.5.");
	}
	const isKeyConfigured = Boolean(settings.apiKey || settings.provider === "xai" && serverStatus?.hasEnvKey || settings.provider === "ollama");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-4xl text-fg",
				children: "Settings & AI Model"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-2xl text-base text-muted leading-relaxed",
				children: "Configure the primary AI model and API credentials. Once saved, TrustLens uses this model across the entire website for answering questions, extracting claims, auditing against sources, and improving drafts."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "p-5 sm:p-6 grid gap-4 border border-border-light",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "size-11 rounded-2xl gradient-primary flex items-center justify-center text-white shadow-nm-raised-sm flex-shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
								className: "size-5",
								"aria-hidden": "true"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold uppercase tracking-wider text-muted",
							children: "Active Primary Model"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 mt-0.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-serif text-2xl font-bold text-fg",
								children: settings.primaryModel
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "nm-raised-sm text-xs font-semibold px-2.5 py-0.5 rounded-full text-primary border border-primary/20",
								children: settings.modelLabel || activePreset.name
							})]
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2.5",
						children: [isKeyConfigured ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5 rounded-full bg-ok-bg text-ok px-3 py-1 text-xs font-semibold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
								className: "size-3.5",
								"aria-hidden": "true"
							}), "API Key Configured"]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5 rounded-full bg-bad-bg text-bad px-3 py-1 text-xs font-semibold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
								className: "size-3.5",
								"aria-hidden": "true"
							}), "No Key Provided"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5 rounded-full bg-accent text-primary px-3 py-1 text-xs font-semibold truncate max-w-[220px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Server, {
								className: "size-3.5 flex-shrink-0",
								"aria-hidden": "true"
							}), new URL(settings.baseUrl || "https://api.x.ai/v1").hostname]
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-[1.4fr_0.8fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-5 sm:p-6 grid gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-serif text-xl text-fg",
								children: "1. Choose AI Provider"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted mt-1",
								children: "Select a popular provider or connect any custom OpenAI-compatible endpoint."
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-2 sm:grid-cols-4 gap-2.5",
								children: Object.keys(MODEL_PRESETS).map((key) => {
									const preset = MODEL_PRESETS[key];
									const active = settings.provider === key;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => handleSelectPreset(key),
										className: cn("p-3 rounded-2xl text-left border transition-all duration-150 flex flex-col justify-between min-h-[92px]", active ? "nm-raised-sm gradient-primary-soft text-primary border-primary/30 shadow-glow" : "nm-raised-sm bg-surface text-fg border-border-light hover:border-primary/20"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between gap-1 mb-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] font-bold uppercase tracking-wider text-muted opacity-80",
												children: preset.badge
											}), active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5 text-primary flex-shrink-0" })]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold text-xs leading-snug text-fg",
											children: preset.name
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] text-muted truncate mt-1",
											children: preset.defaultModel
										})]
									}, key);
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted leading-relaxed",
								children: activePreset.description
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-5 sm:p-6 grid gap-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-serif text-xl text-fg",
								children: "2. API Credentials & Model"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted mt-1",
								children: [
									"Configure your credentials and model name for ",
									activePreset.name,
									"."
								]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											htmlFor: "base-url-input",
											className: "text-sm font-semibold text-fg flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, {
												className: "size-4 text-primary",
												"aria-hidden": "true"
											}), "API Base URL"]
										}), settings.baseUrl !== activePreset.defaultBaseUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setSettings((p) => ({
												...p,
												baseUrl: activePreset.defaultBaseUrl
											})),
											className: "text-xs text-primary hover:underline",
											children: "Reset to default"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "base-url-input",
										type: "text",
										value: settings.baseUrl,
										onChange: (e) => {
											setSettings((p) => ({
												...p,
												baseUrl: e.target.value
											}));
											setIsSaved(false);
										},
										placeholder: activePreset.defaultBaseUrl,
										className: "nm-inset w-full rounded-xl border border-border-light px-4 py-2.5 text-sm text-fg placeholder:text-subtle focus:outline-none focus-visible:outline-2 focus-visible:outline-primary"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs text-muted",
										children: [
											"Endpoint where chat requests are sent (e.g. ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: activePreset.defaultBaseUrl }),
											")"
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										htmlFor: "api-key-input",
										className: "text-sm font-semibold text-fg flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, {
											className: "size-4 text-primary",
											"aria-hidden": "true"
										}), "API Key"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											id: "api-key-input",
											type: showKey ? "text" : "password",
											value: settings.apiKey,
											onChange: (e) => {
												setSettings((p) => ({
													...p,
													apiKey: e.target.value
												}));
												setIsSaved(false);
											},
											placeholder: activePreset.placeholderKey,
											className: "nm-inset w-full rounded-xl border border-border-light px-4 py-2.5 pr-12 text-sm text-fg placeholder:text-subtle focus:outline-none focus-visible:outline-2 focus-visible:outline-primary"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setShowKey(!showKey),
											className: "absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-fg rounded-lg transition-colors",
											"aria-label": showKey ? "Hide API key" : "Show API key",
											children: showKey ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" })
										})]
									}),
									settings.provider === "xai" && !settings.apiKey && serverStatus?.hasEnvKey ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs text-ok flex items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5" }), "Using environment XAI_API_KEY from server. Enter a custom key above to override."]
									}) : settings.provider === "ollama" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted",
										children: "Local Ollama does not require an API key."
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted",
										children: "Your key is stored in your browser session and never shared."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										htmlFor: "model-name-input",
										className: "text-sm font-semibold text-fg flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, {
											className: "size-4 text-primary",
											"aria-hidden": "true"
										}), "Primary Model Name"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "model-name-input",
										type: "text",
										value: settings.primaryModel,
										onChange: (e) => {
											setSettings((p) => ({
												...p,
												primaryModel: e.target.value
											}));
											setIsSaved(false);
										},
										placeholder: activePreset.defaultModel,
										className: "nm-inset w-full rounded-xl border border-border-light px-4 py-2.5 text-sm text-fg placeholder:text-subtle focus:outline-none focus-visible:outline-2 focus-visible:outline-primary font-mono text-xs"
									}),
									activePreset.suggestedModels.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center gap-1.5 mt-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted mr-1",
											children: "Suggestions:"
										}), activePreset.suggestedModels.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => {
												setSettings((p) => ({
													...p,
													primaryModel: s.id,
													modelLabel: s.label
												}));
												setIsSaved(false);
											},
											className: cn("text-xs px-2.5 py-1 rounded-lg border transition-all", settings.primaryModel === s.id ? "gradient-primary text-white border-primary/20 shadow-sm" : "nm-raised-sm bg-surface text-fg border-border-light hover:border-primary/30"),
											children: s.label
										}, s.id))]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										htmlFor: "model-label-input",
										className: "text-sm font-semibold text-fg flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, {
											className: "size-4 text-primary",
											"aria-hidden": "true"
										}), "Display Label"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "model-label-input",
										type: "text",
										value: settings.modelLabel,
										onChange: (e) => {
											setSettings((p) => ({
												...p,
												modelLabel: e.target.value
											}));
											setIsSaved(false);
										},
										placeholder: "e.g. GPT-4o Omni",
										className: "nm-inset w-full rounded-xl border border-border-light px-4 py-2.5 text-sm text-fg placeholder:text-subtle focus:outline-none focus-visible:outline-2 focus-visible:outline-primary"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted",
										children: "Friendly name shown across the UI."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-fg",
											children: "Temperature (Factual Precision)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-mono text-xs text-primary font-bold",
											children: settings.temperature
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "range",
										min: "0",
										max: "1",
										step: "0.05",
										value: settings.temperature,
										onChange: (e) => {
											setSettings((p) => ({
												...p,
												temperature: parseFloat(e.target.value)
											}));
											setIsSaved(false);
										},
										className: "w-full accent-primary"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between text-[11px] text-muted",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "0.0 (Strict / Deterministic)" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "0.3 (Recommended for Verification)" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "1.0 (Creative)" })
										]
									})
								]
							}),
							testResult && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: cn("p-4 rounded-2xl border text-sm grid gap-1.5", testResult.ok ? "bg-ok-bg text-ok border-ok/20" : "bg-bad-bg text-bad border-bad/20"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 font-semibold",
										children: [testResult.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: testResult.ok ? "Connection Successful" : "Connection Failed" })]
									}), testResult.latencyMs !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs opacity-80",
										children: [testResult.latencyMs, " ms"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs leading-relaxed opacity-90",
									children: testResult.ok ? testResult.text : testResult.error
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-3 pt-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "primary",
										onClick: handleSave,
										disabled: testing,
										className: "flex-1 min-h-12 shadow-glow",
										children: isSaved ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }), "Saved!"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "size-4" }), "Save as Primary Model"] })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "secondary",
										onClick: handleTest,
										disabled: testing,
										className: "min-h-12 px-5",
										children: testing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin text-primary" }), "Testing…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "size-4 text-primary" }), "Test Connection"] })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: handleReset,
										title: "Reset to default xAI Grok",
										className: "nm-raised-sm size-12 rounded-xl flex items-center justify-center text-muted hover:text-bad border border-border-light transition-all",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" })
									})
								]
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "grid gap-5 content-start",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-5 grid gap-3.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "font-serif text-lg text-fg flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-5 text-primary" }), "Where is this model used?"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted leading-relaxed",
								children: "When you configure a primary model, it replaces the default engine everywhere in TrustLens:"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "grid gap-3 text-xs text-muted",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex items-start gap-2.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "size-6 rounded-lg gradient-primary flex items-center justify-center text-white flex-shrink-0 mt-0.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-3.5" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "text-fg block",
											children: "Answer Generation"
										}), "Generates answers in the Analyze page when you click \"Generate answer\" or \"Generate and verify\"."] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex items-start gap-2.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "size-6 rounded-lg gradient-primary flex items-center justify-center text-white flex-shrink-0 mt-0.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-3.5" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "text-fg block",
											children: "Claim Extraction"
										}), "Analyzes long input texts and breaks them down into individual, verifiable factual claims."] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex items-start gap-2.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "size-6 rounded-lg gradient-primary flex items-center justify-center text-white flex-shrink-0 mt-0.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cpu, { className: "size-3.5" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "text-fg block",
											children: "Evidence Auditing"
										}), "Compares each claim against retrieved external web sources to mark claims as supported or contradicted."] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex items-start gap-2.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "size-6 rounded-lg gradient-primary flex items-center justify-center text-white flex-shrink-0 mt-0.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "text-fg block",
											children: "Answer Improvement"
										}), "Powers the \"Improve Answer\" tool in reports when an answer scores below the 85 trust threshold."] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex items-start gap-2.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "size-6 rounded-lg gradient-primary flex items-center justify-center text-white flex-shrink-0 mt-0.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-3.5" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "text-fg block",
											children: "Multi-AI Comparison"
										}), "Automatically listed as a primary choice in the Multi-AI comparison tab alongside Grok 4.5 and Grok 4."] })]
									})
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-5 grid gap-2.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-serif text-lg text-fg",
								children: "Privacy & Keys"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted leading-relaxed",
								children: "API keys you enter are stored only in your browser storage and passed directly to your chosen AI provider endpoint. They are never sent to third parties or logged."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
								tone: "info",
								children: "The deterministic Trust Score and TCS composite calculations always remain mathematically computed in code — AI models never invent or manipulate the final numeric score."
							})
						]
					})]
				})]
			})
		]
	});
}
//#endregion
export { SettingsPage as component };
