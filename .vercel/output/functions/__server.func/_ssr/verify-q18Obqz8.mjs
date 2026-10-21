import { i as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, Y as require_react, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { S as FileSearch, b as Globe, f as Search, l as ShieldCheck, t as Zap } from "../_libs/lucide-react.mjs";
import { S as TextArea, _ as Card, b as Notice, f as saveAnalysis, g as Button, y as Field } from "./router-LBGi2OpZ.mjs";
import { a as verifyClaim } from "./api-CDzboM3w.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/verify-q18Obqz8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MESSAGES = [
	"Scanning web sources...",
	"Querying Wikipedia...",
	"Checking Brave Search...",
	"Analyzing evidence snippets...",
	"Calculating trust score...",
	"Finalizing report..."
];
function SearchAnimation() {
	const [msgIndex, setMsgIndex] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const timer = setInterval(() => {
			setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
		}, 2e3);
		return () => clearInterval(timer);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center justify-center gap-8 py-12 px-6 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex items-center justify-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute size-32 animate-ping rounded-full bg-primary/20" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute size-24 animate-pulse rounded-full bg-primary/30" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute size-16 animate-bounce rounded-full bg-primary/40" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative z-10 nm-raised-sm gradient-primary size-16 rounded-full flex items-center justify-center text-white shadow-glow",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-8 animate-pulse" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute size-48 animate-spin-slow",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute -top-4 left-1/2 -translate-x-1/2 nm-raised-sm bg-white p-2 rounded-full text-primary shadow-sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute top-1/2 -right-4 -translate-y-1/2 nm-raised-sm bg-white p-2 rounded-full text-primary shadow-sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute -bottom-4 left-1/2 -translate-x-1/2 nm-raised-sm bg-white p-2 rounded-full text-primary shadow-sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSearch, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute top-1/2 -left-4 -translate-y-1/2 nm-raised-sm bg-white p-2 rounded-full text-primary shadow-sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-4" })
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center gap-2 max-w-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-serif text-2xl text-fg",
					children: "Verifying Claim"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-6 overflow-hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted text-sm animate-fade-in-up",
						children: MESSAGES[msgIndex]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { dangerouslySetInnerHTML: { __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(10px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 2s ease-in-out infinite;
        }
      ` } })
		]
	});
}
function VerifyPage() {
	const navigate = useNavigate();
	const [claim, setClaim] = (0, import_react.useState)("");
	const [stage, setStage] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
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
			await navigate({
				to: "/report/$id",
				params: { id: result.record.id }
			});
		} catch {
			setStage(null);
			setError("Verification failed.");
		}
	}
	if (stage) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchAnimation, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid max-w-3xl gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center mb-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-5xl mb-4",
				children: "Web Verify"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted text-lg max-w-xl mx-auto",
				children: "Search a question or claim across the web, review the retrieved sources, and see how closely they support it."
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "grid gap-6 p-8 shadow-glow",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Question or claim",
					hint: "We search this wording directly and list every source we retrieve.",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
						value: claim,
						onChange: (event) => setClaim(event.target.value),
						placeholder: "Is UPI India's instant payment system?"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "px-12 py-4 text-lg rounded-full",
						disabled: claim.trim().length < 3,
						onClick: run,
						children: "Search and verify"
					})
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
					tone: "bad",
					children: error
				}) : null
			]
		})]
	});
}
//#endregion
export { VerifyPage as component };
