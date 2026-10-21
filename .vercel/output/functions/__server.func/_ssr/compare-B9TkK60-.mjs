import { i as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, Y as require_react, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as Card, b as Notice, u as listAnalyses } from "./router-LBGi2OpZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/compare-B9TkK60-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function count(record, status) {
	return record.claims.filter((claim) => claim.status === status).length;
}
function cell(value) {
	return value == null ? "n/a" : String(value);
}
function ComparePage() {
	const [rows, setRows] = (0, import_react.useState)(null);
	const [picked, setPicked] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => setRows(listAnalyses()), []);
	if (!rows) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Loading reports…"
	});
	const selected = rows.filter((row) => picked.includes(row.id)).slice(0, 3);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-4xl",
				children: "Compare"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-muted",
				children: "Same formula on every report. A higher score is not assumed to be the truer one without looking at the claims."
			})] }),
			rows.length < 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, { children: "Verify at least two answers to compare them." }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-2",
				children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex min-h-11 items-center gap-3 rounded-xl border border-border bg-surface px-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: picked.includes(row.id),
						onChange: (event) => {
							setPicked((current) => {
								if (event.target.checked) return [...current, row.id].slice(-3);
								return current.filter((id) => id !== row.id);
							});
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-sm",
						children: [
							row.scores.trustScore,
							" · ",
							row.question
						]
					})]
				}, row.id))
			}),
			selected.length >= 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "overflow-x-auto p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[40rem] text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-2 pr-3 font-semibold",
							children: "Metric"
						}), selected.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-2 pr-3 font-semibold",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								className: "text-primary",
								to: "/report/$id",
								params: { id: row.id },
								children: row.question.slice(0, 42)
							})
						}, row.id))]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: [
						["Trust score", (row) => String(row.scores.trustScore)],
						["Factuality", (row) => cell(row.scores.factuality)],
						["Evidence support", (row) => cell(row.scores.evidenceSupport)],
						["Source reliability", (row) => cell(row.scores.sourceReliability)],
						["Hallucination risk", (row) => cell(row.scores.hallucinationRisk)],
						["Supported claims", (row) => String(count(row, "SUPPORTED"))],
						["Contradicted claims", (row) => String(count(row, "CONTRADICTED"))],
						["Unverified claims", (row) => String(count(row, "UNVERIFIED"))]
					].map(([label, read]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-2 pr-3 font-medium",
							children: label
						}), selected.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-2 pr-3",
							children: read(row)
						}, row.id))]
					}, label)) })]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Select two or three reports."
			})
		]
	});
}
//#endregion
export { ComparePage as component };
