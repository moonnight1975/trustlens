import { i as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, Y as require_react, b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as safeHttpUrl, n as METHODOLOGY } from "./config-RgztULDg.mjs";
import { I as Ban, M as ChevronUp, N as ChevronDown, P as Check, T as ExternalLink, h as Minus, k as CircleHelp, s as Sparkles } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { _ as Card, b as Notice, f as saveAnalysis, g as Button, i as EVIDENCE_DISCLAIMER, m as saveFeedback, n as Route, s as getAnalysis } from "./router-LBGi2OpZ.mjs";
import { t as format } from "../_libs/date-fns.mjs";
import { i as improveAnswer, t as analyzeAnswer } from "./api-CDzboM3w.mjs";
import { n as fuzzyTrust, r as tcsAnalysis, t as FUZZY_RULES } from "./tcs-OvYwSWBw.mjs";
import { a as ResponsiveContainer, i as PolarGrid, n as Radar, r as PolarAngleAxis, t as RadarChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/report._id-YK7LfH-K.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ScoreRadar({ points }) {
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setMounted(true), []);
	if (!mounted || points.length < 3) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-72 w-full min-w-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadarChart, {
				data: points,
				outerRadius: "70%",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolarGrid, { stroke: "#d5dced" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolarAngleAxis, {
						dataKey: "metric",
						tick: {
							fill: "#1b2340",
							fontSize: 12
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radar, {
						dataKey: "value",
						stroke: "#4338ca",
						fill: "#4338ca",
						fillOpacity: .25
					})
				]
			})
		})
	});
}
var STATUS = {
	SUPPORTED: {
		label: "Supported",
		tone: "bg-ok-bg text-ok",
		icon: Check
	},
	PARTIALLY_SUPPORTED: {
		label: "Partially supported",
		tone: "bg-warn-bg text-warn",
		icon: Minus
	},
	CONTRADICTED: {
		label: "Contradicted",
		tone: "bg-bad-bg text-bad",
		icon: Ban
	},
	UNVERIFIED: {
		label: "Unverified",
		tone: "bg-info-bg text-info",
		icon: CircleHelp
	},
	NOT_APPLICABLE: {
		label: "Not applicable",
		tone: "bg-accent text-fg",
		icon: Minus
	}
};
function Pill({ status }) {
	const meta = STATUS[status];
	const Icon = meta.icon;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: `inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${meta.tone}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			className: "size-3.5",
			"aria-hidden": "true"
		}), meta.label]
	});
}
function Metric({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border px-3 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-semibold uppercase tracking-wide text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-serif text-2xl",
			children: value == null ? "n/a" : value
		})]
	});
}
function ReportView({ record, stage, error, draft, onImprove, onCancel }) {
	const score = record.scores.trustScore;
	const showImprove = score < 85 && !stage;
	const points = [
		record.scores.factuality != null ? {
			metric: "Factuality",
			value: record.scores.factuality
		} : null,
		{
			metric: "Logic",
			value: record.scores.logicalConsistency
		},
		record.scores.evidenceSupport != null ? {
			metric: "Evidence",
			value: record.scores.evidenceSupport
		} : null,
		{
			metric: "Alignment",
			value: record.scores.semanticAlignment
		},
		record.scores.hallucinationRisk != null ? {
			metric: "Groundedness",
			value: 100 - record.scores.hallucinationRisk
		} : null,
		record.scores.evidenceCoverage != null ? {
			metric: "Coverage",
			value: record.scores.evidenceCoverage
		} : null
	].filter((point) => Boolean(point));
	const delta = record.improvement ? score - record.improvement.originalTrustScore : null;
	function sendFeedback(kind) {
		try {
			if (saveFeedback({
				analysisId: record.id,
				kind,
				note: ""
			}).status === "saved") toast.success("Feedback saved on this device.");
		} catch {
			toast.error("Feedback could not be saved.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-[18rem_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold text-muted",
							children: "Trust score"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-serif text-6xl text-primary",
							children: score
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm font-semibold capitalize",
							children: ["Risk: ", record.scores.riskLevel]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-xs text-muted",
							children: [
								"Formula ",
								record.scores.formulaVersion,
								". Calculated in code, not chosen by a model."
							]
						}),
						record.improvement ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 text-sm",
							children: [
								"Original ",
								record.improvement.originalTrustScore,
								". Change ",
								delta != null && delta > 0 ? "+" : "",
								delta,
								". The revised score is not forced to 85."
							]
						}) : null,
						score >= 85 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 flex items-center gap-2 text-sm font-semibold text-ok",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
								className: "size-4",
								"aria-hidden": "true"
							}), "Answer meets the 85+ trust threshold."]
						}) : null,
						showImprove ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "mt-4 w-full",
							onClick: onImprove,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
								className: "size-4",
								"aria-hidden": "true"
							}), "Improve Answer"]
						}) : null,
						stage ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4",
							"aria-live": "polite",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold",
								children: stage
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								className: "mt-2 w-full",
								onClick: onCancel,
								children: "Cancel"
							})]
						}) : null,
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
								tone: "bad",
								children: error
							})
						}) : null
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: format(new Date(record.createdAt), "d MMM yyyy, HH:mm")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-1 font-serif text-3xl",
							children: record.question
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 whitespace-pre-wrap text-base",
							children: record.answer
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap gap-3 text-sm",
							children: [record.improvement ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								className: "font-semibold text-primary",
								to: "/report/$id",
								params: { id: record.improvement.ofId },
								children: "Original analysis"
							}) : null, record.improvedChildId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								className: "font-semibold text-primary",
								to: "/report/$id",
								params: { id: record.improvedChildId },
								children: "Improved analysis"
							}) : null]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "grid gap-3 p-5 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Factuality",
						value: record.scores.factuality
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Logical consistency",
						value: record.scores.logicalConsistency
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Evidence support",
						value: record.scores.evidenceSupport
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Semantic alignment",
						value: record.scores.semanticAlignment
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Hallucination risk",
						value: record.scores.hallucinationRisk
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Evidence coverage",
						value: record.scores.evidenceCoverage
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Source reliability",
						value: record.scores.sourceReliability
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "Fuzzy trust",
						value: record.fuzzy.score
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						label: "TCS composite",
						value: record.tcs.composite
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-2xl",
						children: "Score shape"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Groundedness is 100 minus hallucination risk, so every axis is better when higher. Axes that do not apply are omitted."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreRadar, { points })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-2xl",
						children: "Claims"
					}),
					record.claims.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, { children: "No claims were extracted." }) : null,
					record.claims.map((claim) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { status: claim.status }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-semibold uppercase text-muted",
										children: claim.category
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs text-muted",
										children: ["Importance ", claim.importance]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs text-muted",
										children: ["Auditor: ", claim.auditor]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2",
								children: claim.text
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-sm text-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-fg",
									children: "Interpretation. "
								}), claim.rationale]
							}),
							claim.temporalNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-warn",
								children: claim.temporalNote
							}) : null
						]
					}, claim.id))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-2xl",
						children: "Evidence and sources"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: record.evidence.length > 0 ? `${record.evidence.length} source${record.evidence.length === 1 ? "" : "s"} found for this search. Open each link to review the original page.` : "No sources were found for this search."
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, { children: EVIDENCE_DISCLAIMER }),
					record.evidenceMode === "unavailable" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
						tone: "warn",
						children: record.evidenceNote || "External evidence verification unavailable."
					}) : null,
					record.evidence.map((item) => {
						const href = safeHttpUrl(item.url);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2 text-xs font-semibold uppercase text-muted",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.quality.replaceAll("_", " ") }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.snippetKind }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.provider })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 font-semibold",
									children: item.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: item.domain
								}),
								item.pageUpdatedAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-muted",
									children: [
										"Page updated ",
										item.pageUpdatedAt,
										". This is not necessarily the event date."
									]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: "No publication date was retrieved."
								}),
								item.snippet ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm",
									children: item.snippet
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted",
									children: "No excerpt was retrieved. This citation is not used as supporting text."
								}),
								href ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									className: "mt-2 inline-flex min-h-11 items-center gap-1 font-semibold text-primary",
									href,
									target: "_blank",
									rel: "noopener noreferrer",
									children: ["Open source ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, {
										className: "size-4",
										"aria-hidden": "true"
									})]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-bad",
									children: "Source URL was rejected as unsafe and is not linked."
								})
							]
						}, item.id);
					})
				]
			}),
			record.improvement ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "grid gap-3 p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-2xl",
						children: "What changed"
					}),
					record.improvement.corrections.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm",
						children: "No structured corrections were returned."
					}) : null,
					record.improvement.corrections.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-t border-border pt-3 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold",
								children: "Original claim. "
							}), item.originalClaim] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold",
									children: "Correction. "
								}), item.correction]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-fg",
									children: "Reason. "
								}), item.reason]
							})
						]
					}, `${item.originalClaim}-${index}`)),
					record.improvement.uncertainties.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold",
						children: "Remaining uncertainties"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-1 list-disc pl-5 text-sm",
						children: record.improvement.uncertainties.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: item }, item))
					})] }) : null
				]
			}) : null,
			draft && error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-2xl",
						children: "Unverified draft"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "This text was not saved because re-verification did not finish. It is not a TrustLens score."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 whitespace-pre-wrap text-sm",
						children: draft
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-2xl",
						children: "How this score was calculated"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm",
						children: METHODOLOGY
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-3 list-disc pl-5 text-sm text-muted",
						children: [record.scores.notes.map((note) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: note }, note)), record.pipelineLog.map((note) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: note }, note))]
					}),
					record.logicalIssues.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold",
							children: "Logical issues"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-1 list-disc pl-5 text-sm",
							children: record.logicalIssues.map((issue) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: issue.text }, issue.text))
						})]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SoftComputingSection, { record }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TcsSection, { record }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-2xl",
						children: "Feedback"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Saved on this device only. It is not treated as ground truth and does not train a model."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [
							["correct", "Correct"],
							["incorrect", "Incorrect"],
							["helpful", "Helpful"],
							["not-helpful", "Not helpful"],
							["issue", "Report an issue"]
						].map(([kind, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => sendFeedback(kind),
							children: label
						}, kind))
					})
				]
			})
		]
	});
}
function Bar({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-1 flex justify-between text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-semibold",
			children: value
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-2 rounded-full bg-accent",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-2 rounded-full gradient-primary transition-all duration-500",
			style: { width: `${Math.max(0, Math.min(100, value))}%` }
		})
	})] });
}
function SoftComputingSection({ record }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const recomputed = fuzzyTrust({
		support: record.scores.factuality ?? 0,
		contradiction: record.fuzzy.contradiction,
		coverage: record.scores.evidenceCoverage ?? 0
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "flex w-full items-center justify-between text-left",
			onClick: () => setOpen(!open),
			"aria-expanded": open,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-serif text-2xl",
				children: "Soft Computing"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-muted",
				children: ["Fuzzy trust score: ", record.fuzzy.score]
			})] }), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, {
				className: "size-5 text-muted shrink-0",
				"aria-hidden": "true"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
				className: "size-5 text-muted shrink-0",
				"aria-hidden": "true"
			})]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-serif text-5xl text-primary",
					children: record.fuzzy.score
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm",
					children: [
						"Stored fuzzy score. Recomputed now: ",
						recomputed.score,
						". Support",
						" ",
						record.fuzzy.support,
						", contradiction ",
						record.fuzzy.contradiction,
						", coverage",
						" ",
						record.fuzzy.coverage,
						"."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm",
					children: [
						"Deterministic trust score for the same report:",
						" ",
						record.scores.trustScore,
						"."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "The fuzzy trust score is a separate soft-computing view. It runs support, contradiction, and coverage through membership functions and centroid defuzzification. It does not replace the deterministic trust score and it does not train a model."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "list-disc pl-5 text-sm",
					children: FUZZY_RULES.map((rule) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: rule }, rule))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: [
						"Rules that fired:",
						" ",
						record.fuzzy.rulesFired.join("; ") || "none above the firing threshold."
					]
				})
			]
		})]
	});
}
function TcsSection({ record }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const fresh = tcsAnalysis({
		fuzzyTrust: record.fuzzy.score,
		claims: record.claims,
		evidence: record.evidence,
		now: new Date(record.createdAt)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "flex w-full items-center justify-between text-left",
			onClick: () => setOpen(!open),
			"aria-expanded": open,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-serif text-2xl",
				children: "TCS — Trust · Confidence · Stability"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-muted",
				children: ["Composite: ", fresh.composite]
			})] }), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, {
				className: "size-5 text-muted shrink-0",
				"aria-hidden": "true"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
				className: "size-5 text-muted shrink-0",
				"aria-hidden": "true"
			})]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
					label: "Trust (fuzzy)",
					value: fresh.trust
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
					label: "Confidence",
					value: fresh.confidence
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm",
					children: [
						"Confidence interval ",
						fresh.confidenceLow,
						"–",
						fresh.confidenceHigh,
						". The width grows when evidence is thin or low-quality."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
					label: "Stability",
					value: fresh.stability
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
					label: "Composite",
					value: fresh.composite
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Trust, confidence, and stability. Confidence is an interval. Stability watches time-sensitive claims and source dates. This is not a psychological assessment and it does not update a model."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "list-disc pl-5 text-sm",
					children: fresh.narrative.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: line }, line))
				})
			]
		})]
	});
}
function ReportPage() {
	const { id } = Route.useParams();
	const navigate = useNavigate();
	const [record, setRecord] = (0, import_react.useState)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [stage, setStage] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [draft, setDraft] = (0, import_react.useState)(null);
	const token = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		setRecord(getAnalysis(id));
		setReady(true);
		setStage(null);
		setError(null);
		setDraft(null);
	}, [id]);
	async function onImprove() {
		if (!record) return;
		if (!navigator.onLine) {
			setError("You are offline. Answer improvement needs a connection.");
			return;
		}
		const mine = ++token.current;
		setError(null);
		setDraft(null);
		setStage("Reviewing claims and evidence...");
		try {
			const improved = await improveAnswer({ data: {
				question: record.question,
				answer: record.answer,
				trustScore: record.scores.trustScore,
				riskLevel: record.scores.riskLevel,
				claims: record.claims.map((claim) => ({
					text: claim.text,
					status: claim.status,
					rationale: claim.rationale
				})),
				evidence: record.evidence.map((item) => ({
					id: item.id,
					title: item.title,
					url: item.url,
					snippet: item.snippet,
					snippetKind: item.snippetKind,
					pageUpdatedAt: item.pageUpdatedAt,
					publishedAt: item.publishedAt,
					quality: item.quality
				})),
				auditNotes: record.scores.notes
			} });
			if (token.current !== mine) return;
			if (!improved.ok) {
				setStage(null);
				setError(improved.error);
				return;
			}
			setDraft(improved.improvedAnswer);
			setStage("Re-verifying improved answer...");
			const verified = await analyzeAnswer({ data: {
				question: record.question,
				answer: improved.improvedAnswer,
				answerSource: "improved",
				generatorModel: null
			} });
			if (token.current !== mine) return;
			setStage(null);
			if (!verified.ok) {
				setError(`${verified.error} The draft was not saved because it was not re-verified.`);
				return;
			}
			const next = {
				...verified.record,
				improvement: {
					ofId: record.id,
					corrections: improved.corrections,
					sourcesUsed: improved.sourcesUsed,
					uncertainties: improved.uncertainties,
					originalTrustScore: record.scores.trustScore
				}
			};
			saveAnalysis(next);
			setDraft(null);
			await navigate({
				to: "/report/$id",
				params: { id: next.id }
			});
		} catch {
			if (token.current !== mine) return;
			setStage(null);
			setError("Improvement failed before a new report could be saved. The original analysis was not changed.");
		}
	}
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Loading the saved report…"
	});
	if (!record) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
		tone: "warn",
		children: "This report is not in this browser's history. It may have been saved on another device."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportView, {
		record,
		stage,
		error,
		draft,
		onImprove,
		onCancel: () => {
			token.current += 1;
			setStage(null);
		}
	});
}
//#endregion
export { ReportPage as component };
