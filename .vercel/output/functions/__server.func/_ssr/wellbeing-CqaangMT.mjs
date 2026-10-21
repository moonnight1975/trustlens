import { i as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, Y as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as Card, h as updateWellbeing, l as getWellbeing, u as listAnalyses } from "./router-LBGi2OpZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/wellbeing-CqaangMT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SESSION_KEY = "trustlens.sessionStart";
function WellbeingPage() {
	const [settings, setSettings] = (0, import_react.useState)(null);
	const [counts, setCounts] = (0, import_react.useState)({
		today: 0,
		total: 0
	});
	const [minutes, setMinutes] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		setSettings(getWellbeing());
		const rows = listAnalyses();
		const startOfDay = /* @__PURE__ */ new Date();
		startOfDay.setHours(0, 0, 0, 0);
		setCounts({
			total: rows.length,
			today: rows.filter((row) => new Date(row.createdAt).getTime() >= startOfDay.getTime()).length
		});
		const tick = () => {
			const start = Number(sessionStorage.getItem(SESSION_KEY) || Date.now());
			setMinutes(Math.max(0, Math.round((Date.now() - start) / 6e4)));
		};
		tick();
		const timer = window.setInterval(tick, 15e3);
		return () => window.clearInterval(timer);
	}, []);
	if (!settings) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Loading settings…"
	});
	function patch(next) {
		const saved = updateWellbeing(next);
		setSettings(saved);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-4xl",
				children: "Digital wellbeing"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-3xl text-muted",
				children: "AI systems can be wrong, including this one. These controls stay on this device. TrustLens does not diagnose focus, stress, or health, and it does not track you across sites."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Reports today"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-serif text-4xl",
							children: counts.today
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Reports saved here"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-serif text-4xl",
							children: counts.total
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Minutes this session"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-serif text-4xl",
							children: minutes
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "grid gap-4 p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-h-11 items-center justify-between gap-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Verification reminder on the Analyze page" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: settings.verificationReminders,
							onChange: (event) => patch({ verificationReminders: event.target.checked })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-h-11 items-center justify-between gap-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Optional break reminder" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: settings.breakReminders,
							onChange: (event) => patch({ breakReminders: event.target.checked })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-sm font-semibold",
						children: ["Remind after (minutes)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							min: 10,
							max: 120,
							value: settings.breakMinutes,
							onChange: (event) => patch({ breakMinutes: Number(event.target.value) }),
							className: "mt-1 min-h-11 w-full rounded-xl border border-border px-3"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Break reminders are off until you turn them on. Dismissing one snoozes it for 30 minutes."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "grid gap-2 p-5 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-2xl",
						children: "Checking an important claim"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Read the source, not only the snippet. Note whether the page date matches the time the claim is about." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Treat agreement between chatbots as a hint to look harder, not as confirmation." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "If a claim stays unverified, leave it uncertain. Missing evidence is not the same thing as a false claim." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Step away if you have been at it for a long stretch. The reminder above is a timer, not a health judgment." })
				]
			})
		]
	});
}
//#endregion
export { WellbeingPage as component };
