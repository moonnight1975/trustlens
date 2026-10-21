import { i as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, Y as require_react, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { S as TextArea, _ as Card, b as Notice, c as getApiSettings, f as saveAnalysis, g as Button, r as AGREEMENT_DISCLAIMER, y as Field } from "./router-LBGi2OpZ.mjs";
import { c as sentencesOf, r as extractNumbers } from "./text-D5qHDV4b.mjs";
import { t as MULTI_MODELS } from "./models-q1rDXYPb.mjs";
import { n as askOneModel, t as analyzeAnswer } from "./api-CDzboM3w.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/multi-H6Oj94lA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function tokens(text) {
	return new Set(text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((word) => word.length > 3));
}
function jaccard(a, b) {
	if (a.size === 0 || b.size === 0) return 0;
	let inter = 0;
	for (const word of a) if (b.has(word)) inter += 1;
	return inter / (a.size + b.size - inter);
}
function compareModelTexts(items) {
	const available = items.filter((item) => item.text.trim().length > 0);
	const shared = [];
	const unique = [];
	const numbers = available.map((item) => ({
		id: item.id,
		values: [...new Set(extractNumbers(item.text).filter((n) => Math.abs(n) >= 3))]
	}));
	const numericalDifferences = [];
	for (let i = 0; i < numbers.length; i++) for (let j = i + 1; j < numbers.length; j++) {
		const left = numbers[i];
		const right = numbers[j];
		if (left.values.length === 0 || right.values.length === 0) continue;
		const onlyLeft = left.values.filter((n) => !right.values.some((m) => Math.abs(n - m) / Math.max(Math.abs(n), Math.abs(m), 1) <= .02));
		if (onlyLeft.length) numericalDifferences.push(`${left.id} and ${right.id} mention different numbers (${onlyLeft.slice(0, 4).join(", ")} appears in ${left.id}).`);
	}
	if (available.length >= 2) {
		const first = available[0];
		for (const sentence of sentencesOf(first.text)) {
			const bag = tokens(sentence);
			if (available.slice(1).some((other) => sentencesOf(other.text).some((s) => jaccard(bag, tokens(s)) >= .55)) && sentence.length > 30) shared.push(sentence);
			else if (sentence.length > 30) unique.push({
				id: first.id,
				text: sentence
			});
		}
		for (const other of available.slice(1)) for (const sentence of sentencesOf(other.text)) {
			const bag = tokens(sentence);
			if (!sentencesOf(first.text).some((s) => jaccard(bag, tokens(s)) >= .55) && sentence.length > 30) unique.push({
				id: other.id,
				text: sentence
			});
		}
	}
	return {
		shared: shared.slice(0, 6),
		unique: unique.slice(0, 8),
		numericalDifferences: numericalDifferences.slice(0, 6)
	};
}
function MultiPage() {
	const navigate = useNavigate();
	const [question, setQuestion] = (0, import_react.useState)("");
	const [availableModels, setAvailableModels] = (0, import_react.useState)([...MULTI_MODELS]);
	const [selected, setSelected] = (0, import_react.useState)(MULTI_MODELS.map((model) => model.id));
	const [results, setResults] = (0, import_react.useState)([]);
	const [running, setRunning] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [busyId, setBusyId] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const settings = getApiSettings();
		if (settings.primaryModel && !MULTI_MODELS.some((m) => m.id === settings.primaryModel)) {
			const custom = {
				id: settings.primaryModel,
				label: `${settings.modelLabel || settings.primaryModel} (Primary)`
			};
			setAvailableModels([custom, ...MULTI_MODELS]);
			setSelected((prev) => Array.from(/* @__PURE__ */ new Set([settings.primaryModel, ...prev])));
		}
	}, []);
	async function run() {
		if (!navigator.onLine) {
			setError("You are offline. Model requests need a connection.");
			return;
		}
		setRunning(true);
		setError(null);
		setResults(selected.map((id) => {
			return {
				model: id,
				label: availableModels.find((model) => model.id === id)?.label || id,
				ok: false,
				text: "",
				error: "Waiting…"
			};
		}));
		await Promise.all(selected.map(async (model) => {
			try {
				const response = await askOneModel({ data: {
					question,
					model
				} });
				setResults((current) => current.map((item) => {
					if (item.model !== model) return item;
					if (!response.ok) return {
						...item,
						error: response.error
					};
					return response.result;
				}));
			} catch {
				setResults((current) => current.map((item) => item.model === model ? {
					...item,
					error: "The request failed."
				} : item));
			}
		}));
		setRunning(false);
	}
	async function verify(result) {
		if (!result.ok) return;
		setBusyId(result.model);
		setError(null);
		try {
			const verified = await analyzeAnswer({ data: {
				question,
				answer: result.text,
				answerSource: "generated",
				generatorModel: result.model
			} });
			if (!verified.ok) {
				setError(verified.error);
				setBusyId(null);
				return;
			}
			saveAnalysis(verified.record);
			await navigate({
				to: "/report/$id",
				params: { id: verified.record.id }
			});
		} catch {
			setError("Verification failed.");
			setBusyId(null);
		}
	}
	const diff = compareModelTexts(results.filter((item) => item.ok).map((item) => ({
		id: item.label,
		text: item.text
	})));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-4xl",
				children: "Multi-AI"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-3xl text-muted",
				children: "The same question goes to each configured model. One failure does not hide the others. Agreement is not treated as truth."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, { children: AGREEMENT_DISCLAIMER }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "grid gap-3 p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Question",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
							value: question,
							onChange: (event) => setQuestion(event.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
							className: "text-sm font-semibold",
							children: "Models"
						}), availableModels.map((model) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex min-h-11 items-center gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: selected.includes(model.id),
								onChange: (event) => {
									setSelected((current) => event.target.checked ? [...current, model.id] : current.filter((id) => id !== model.id));
								}
							}), model.label]
						}, model.id))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: running || question.trim().length < 3 || selected.length === 0,
						onClick: run,
						children: running ? "Asking models…" : "Ask models"
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
						tone: "bad",
						children: error
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 lg:grid-cols-2",
				children: results.map((result) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold",
							children: result.label
						}),
						result.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 whitespace-pre-wrap text-sm",
							children: result.text
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-bad",
							children: result.error || "Unavailable"
						}),
						result.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-3",
							variant: "ghost",
							disabled: busyId === result.model,
							onClick: () => verify(result),
							children: busyId === result.model ? "Verifying…" : "Verify this response"
						}) : null
					]
				}, result.model))
			}),
			results.some((item) => item.ok) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "grid gap-2 p-5 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-2xl",
						children: "Textual comparison"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted",
						children: "This only compares wording. It does not verify either answer."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold",
						children: "Similar sentences"
					}),
					diff.shared.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "No strongly overlapping sentences." }) : diff.shared.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: line }, line)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold",
						children: "Sentences that don't overlap"
					}),
					diff.unique.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "None flagged." }) : diff.unique.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-semibold",
						children: [line.id, ". "]
					}), line.text] }, `${line.id}-${line.text}`)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold",
						children: "Numerical differences"
					}),
					diff.numericalDifferences.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "No differing numbers were extracted." }) : diff.numericalDifferences.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: line }, line))
				]
			}) : null
		]
	});
}
//#endregion
export { MultiPage as component };
