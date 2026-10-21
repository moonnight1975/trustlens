import { t as getActiveServerSettings } from "./settings.server-CTS_aY1P.mjs";
import { i as takeRateToken, r as parseJsonObject, t as grokChat } from "./grok.server-D-EFT4GT.mjs";
import { a as SCORE_WEIGHTS, c as safeHttpUrl, i as QUALITY_RELIABILITY, l as sameUrl, o as STATUS_POINTS, r as QUALITY_FACTOR, t as FORMULA_VERSION } from "./config-RgztULDg.mjs";
import { a as object, i as number, n as array, o as string, t as _enum } from "../_libs/zod.mjs";
import { a as overlapRatio, c as sentencesOf, i as numbersClose, n as contentWords, o as phraseConflict, r as extractNumbers, s as relationValue, t as alignmentOf } from "./text-D5qHDV4b.mjs";
import { t as MULTI_MODELS } from "./models-q1rDXYPb.mjs";
import { searchEvidence, toEvidence } from "./webSearch.server-BxpE-Quy.mjs";
import { n as fuzzyTrust, r as tcsAnalysis } from "./tcs-OvYwSWBw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pipeline.server-EHTn9Zcz.js
var CLAIM_STATUSES = [
	"SUPPORTED",
	"PARTIALLY_SUPPORTED",
	"CONTRADICTED",
	"UNVERIFIED",
	"NOT_APPLICABLE"
];
var CLAIM_CATEGORIES = [
	"factual",
	"numerical",
	"historical",
	"scientific",
	"financial",
	"statistical",
	"geographical",
	"temporal",
	"opinion",
	"subjective"
];
function clamp(n, lo = 0, hi = 100) {
	return Math.min(hi, Math.max(lo, n));
}
function round(n) {
	return Math.round(clamp(n));
}
function bestQuality(claim, evidence) {
	const linked = evidence.filter((e) => claim.evidenceIds.includes(e.id) && e.snippet.trim().length > 0);
	if (linked.length === 0) return null;
	const rank = {
		PRIMARY_OFFICIAL: 4,
		SECONDARY_REPUTABLE: 3,
		GENERAL: 2,
		LOW_CONFIDENCE: 1
	};
	return linked.sort((a, b) => rank[b.quality] - rank[a.quality])[0].quality;
}
function riskFromTrust(trust) {
	if (trust >= 80) return "low";
	if (trust >= 60) return "moderate";
	if (trust >= 40) return "high";
	return "critical";
}
function scoreAnalysis(input) {
	const notes = [];
	const verifiable = input.claims.filter((c) => c.status !== "NOT_APPLICABLE" && c.verifiability !== "none");
	const weightSum = verifiable.reduce((s, c) => s + c.importance, 0);
	const logicalConsistency = round(100 - 15 * Math.min(4, input.logicalIssueCount));
	const alignment = round(input.alignment);
	if (!input.evidenceAvailable) notes.push("External evidence verification unavailable. Unverified claims were not treated as false.");
	if (verifiable.length === 0 || weightSum === 0) {
		const trustScore = Math.min(55, round(.5 * logicalConsistency + .5 * alignment));
		notes.push("No externally verifiable factual claims were scored. The trust score is capped because factual support was not established.");
		return {
			formulaVersion: FORMULA_VERSION,
			trustScore,
			riskLevel: trustScore >= 45 ? "moderate" : "high",
			factuality: null,
			logicalConsistency,
			evidenceSupport: null,
			semanticAlignment: alignment,
			hallucinationRisk: null,
			evidenceCoverage: null,
			sourceReliability: null,
			weights: { ...SCORE_WEIGHTS },
			notes
		};
	}
	let supportAcc = 0;
	let contradictedW = 0;
	let unverifiedW = 0;
	let covered = 0;
	const qualities = [];
	const importantPoints = [];
	for (const claim of verifiable) {
		const quality = bestQuality(claim, input.evidence);
		let status = claim.status;
		if ((status === "SUPPORTED" || status === "PARTIALLY_SUPPORTED" || status === "CONTRADICTED") && !quality) {
			status = "UNVERIFIED";
			notes.push(`Claim ${claim.id} had no usable retrieved text, so it was scored as unverified.`);
		}
		const qf = quality ? QUALITY_FACTOR[quality] : 1;
		const points = STATUS_POINTS[status] * (status === "SUPPORTED" || status === "PARTIALLY_SUPPORTED" ? qf : 1);
		supportAcc += claim.importance * points;
		if (status === "CONTRADICTED") contradictedW += claim.importance;
		if (status === "UNVERIFIED") unverifiedW += claim.importance;
		if (quality) {
			covered += 1;
			qualities.push(quality);
		}
		if (claim.importance >= 4) importantPoints.push(points * 100);
	}
	const claimSupport = 100 * supportAcc / weightSum;
	const contradictionPenalty = 100 * contradictedW / weightSum;
	const unverifiedDrag = 100 * unverifiedW / weightSum;
	const evidenceCoverage = 100 * covered / verifiable.length;
	const sourceReliability = qualities.length === 0 ? 0 : qualities.reduce((s, q) => s + QUALITY_RELIABILITY[q], 0) / qualities.length;
	const evidenceSupport = evidenceCoverage === 0 ? Math.min(claimSupport, 20) : .6 * claimSupport + .4 * evidenceCoverage;
	const w = SCORE_WEIGHTS;
	const base = w.claimSupport * claimSupport + w.lowContradiction * (100 - contradictionPenalty) + w.lowUnverified * (100 - unverifiedDrag) + w.sourceQuality * sourceReliability + w.evidenceCoverage * evidenceCoverage + w.logicalConsistency * logicalConsistency + w.alignment * alignment;
	let trust = base;
	if (importantPoints.length > 0) {
		const worst = Math.min(...importantPoints);
		trust = .65 * base + .35 * worst;
		notes.push("The weakest important claim pulled the trust score (65% weighted sum, 35% that claim).");
	}
	const hallucinationRisk = round(.55 * (100 - claimSupport) + .3 * contradictionPenalty + .15 * (100 - logicalConsistency));
	if (contradictedW > 0) notes.push("Contradicted claims lowered support and added a contradiction penalty.");
	if (unverifiedW > 0) notes.push("Unverified claims reduced confidence without being scored as false.");
	const trustScore = round(trust);
	return {
		formulaVersion: FORMULA_VERSION,
		trustScore,
		riskLevel: riskFromTrust(trustScore),
		factuality: round(claimSupport),
		logicalConsistency,
		evidenceSupport: round(evidenceSupport),
		semanticAlignment: alignment,
		hallucinationRisk,
		evidenceCoverage: round(evidenceCoverage),
		sourceReliability: round(sourceReliability),
		weights: { ...SCORE_WEIGHTS },
		notes
	};
}
var OPINION = /* @__PURE__ */ new RegExp("\\b(i think|i believe|in my opinion|in my view|my favorite|my favourite)\\b", "i");
function looksLikeOpinion(text) {
	return OPINION.test(text);
}
function salient(nums) {
	return nums.filter((n) => Math.abs(n) >= 3);
}
function bestSentence(claim, blob) {
	let best = {
		sentence: blob.slice(0, 500),
		overlap: overlapRatio(claim, blob)
	};
	for (const sentence of sentencesOf(blob)) {
		const overlap = overlapRatio(claim, sentence);
		if (overlap > best.overlap) best = {
			sentence,
			overlap
		};
	}
	return best;
}
function judgeOne(claim, evidence) {
	const { sentence, overlap } = bestSentence(claim, evidence.text);
	const claimRel = relationValue(claim);
	const evRel = relationValue(sentence) || relationValue(evidence.text);
	if (claimRel && evRel && claimRel.rel === evRel.rel && claimRel.value !== evRel.value) return {
		status: "CONTRADICTED",
		confidence: .72,
		evidenceIds: [evidence.id],
		rationale: `Retrieved text names a different ${claimRel.rel} (${evRel.value}) than the claim (${claimRel.value}).`,
		rule: "relation",
		overlap
	};
	if (phraseConflict(claim, sentence) && overlap >= .3) return {
		status: "CONTRADICTED",
		confidence: .66,
		evidenceIds: [evidence.id],
		rationale: "Retrieved text overlaps this claim but names a conflicting place or body.",
		rule: "phrase",
		overlap
	};
	const claimNums = salient(extractNumbers(claim));
	const evNums = salient(extractNumbers(sentence));
	if (claimNums.length > 0 && evNums.length > 0 && overlap >= .4 && claimNums.every((n) => !evNums.some((e) => numbersClose(n, e)))) return {
		status: "CONTRADICTED",
		confidence: .74,
		evidenceIds: [evidence.id],
		rationale: "A retrieved sentence overlaps this claim and contains a different number.",
		rule: "number-conflict",
		overlap
	};
	if (claimNums.length > 0 && claimNums.every((n) => evNums.some((e) => numbersClose(n, e))) && overlap >= .35) return {
		status: "SUPPORTED",
		confidence: .78,
		evidenceIds: [evidence.id],
		rationale: "The distinctive numbers in the claim appear in the retrieved text, along with overlapping wording.",
		rule: "number-agree",
		overlap
	};
	if (overlap >= .62 && claimNums.every((n) => evNums.some((e) => numbersClose(n, e)) || evNums.length === 0)) {
		if (claimNums.length > 0 && evNums.length === 0) return {
			status: "PARTIALLY_SUPPORTED",
			confidence: .48,
			evidenceIds: [evidence.id],
			rationale: "Retrieved text overlaps the claim, but it does not contain the claim's number.",
			rule: "partial",
			overlap
		};
		return {
			status: "SUPPORTED",
			confidence: .64,
			evidenceIds: [evidence.id],
			rationale: "Most of the claim's distinctive words appear in the retrieved text. This is overlap, not proof.",
			rule: "overlap",
			overlap
		};
	}
	if (overlap >= .38) return {
		status: "PARTIALLY_SUPPORTED",
		confidence: .46,
		evidenceIds: [evidence.id],
		rationale: "Retrieved text overlaps this claim but does not confirm every detail.",
		rule: "partial",
		overlap
	};
	return {
		status: "UNVERIFIED",
		confidence: .3,
		evidenceIds: [],
		rationale: "No retrieved extract overlapped this claim enough to verify it.",
		rule: "none",
		overlap
	};
}
function judgeClaim(claim, evidence) {
	if (looksLikeOpinion(claim)) return {
		status: "NOT_APPLICABLE",
		confidence: 1,
		evidenceIds: [],
		rationale: "Opinion or subjective statement; not scored as a factual claim.",
		rule: "opinion"
	};
	const usable = evidence.filter((e) => e.text.trim().length > 0);
	if (usable.length === 0) return {
		status: "UNVERIFIED",
		confidence: .3,
		evidenceIds: [],
		rationale: "No retrieved text was available for this claim.",
		rule: "none"
	};
	const judged = usable.map((item) => ({
		item,
		judgment: judgeOne(claim, item)
	}));
	const contradicted = judged.filter((j) => j.judgment.status === "CONTRADICTED");
	const supported = judged.filter((j) => j.judgment.status === "SUPPORTED");
	if (contradicted.length > 0 && supported.length > 0) return {
		status: "PARTIALLY_SUPPORTED",
		confidence: .44,
		evidenceIds: [...supported, ...contradicted].map((j) => j.item.id),
		rationale: "Retrieved sources disagree: at least one overlaps in support and another conflicts.",
		rule: "disagree"
	};
	if (contradicted.length > 0) return contradicted.sort((a, b) => b.judgment.overlap - a.judgment.overlap)[0].judgment;
	if (supported.length > 0) return supported.sort((a, b) => b.judgment.overlap - a.judgment.overlap)[0].judgment;
	const partial = judged.filter((j) => j.judgment.status === "PARTIALLY_SUPPORTED");
	if (partial.length > 0) return partial.sort((a, b) => b.judgment.overlap - a.judgment.overlap)[0].judgment;
	return {
		status: "UNVERIFIED",
		confidence: .3,
		evidenceIds: [],
		rationale: "No retrieved extract overlapped this claim enough to verify it.",
		rule: "none"
	};
}
function searchQueryFor(text) {
	const query = contentWords(text).slice(0, 8).join(" ");
	return query.length >= 3 ? query : text.replace(/* @__PURE__ */ new RegExp("\\s+", "g"), " ").trim().slice(0, 120);
}
var TIME_SENSITIVE = /* @__PURE__ */ new RegExp("\\b(current|currently|today|this year|as of|price|president|prime minister|ceo|law)\\b", "i");
function isTimeSensitive(text, category) {
	return category === "financial" || category === "statistical" || category === "temporal" || TIME_SENSITIVE.test(text);
}
function monthsOld(iso, now) {
	if (!iso) return null;
	const then = new Date(iso);
	if (Number.isNaN(then.getTime())) return null;
	return (now.getTime() - then.getTime()) / 2630016e3;
}
var VALID_STATUS = /* @__PURE__ */ new Set([
	"SUPPORTED",
	"PARTIALLY_SUPPORTED",
	"CONTRADICTED",
	"UNVERIFIED",
	"NOT_APPLICABLE"
]);
function allowedEvidence(ids, evidence) {
	const known = new Set(evidence.filter((e) => e.snippet.trim().length > 0).map((e) => e.id));
	return ids.filter((id) => known.has(id));
}
function assembleVerification(input) {
	const now = input.now ?? /* @__PURE__ */ new Date();
	const modelById = new Map((input.modelJudgments ?? []).map((j) => [j.id, j]));
	const evidenceById = new Map(input.evidence.map((e) => [e.id, e]));
	const claims = input.drafts.map((draft) => {
		if (draft.verifiability === "none" || draft.category === "opinion" || draft.category === "subjective") return {
			...draft,
			status: "NOT_APPLICABLE",
			confidence: 1,
			evidenceIds: [],
			rationale: "Opinion or subjective statement; not scored as a factual claim.",
			auditor: "lexical",
			temporalNote: null
		};
		if (input.evidenceMode === "unavailable") return {
			...draft,
			status: "UNVERIFIED",
			confidence: .3,
			evidenceIds: [],
			rationale: "External evidence verification unavailable.",
			auditor: "lexical",
			temporalNote: null
		};
		const lexical = judgeClaim(draft.text, input.evidence.map((e) => ({
			id: e.id,
			text: e.snippetKind === "citation-only" ? "" : e.snippet,
			quality: e.quality,
			pageUpdatedAt: e.pageUpdatedAt
		})));
		let status = lexical.status;
		let evidenceIds = lexical.evidenceIds;
		let rationale = lexical.rationale;
		let auditor = "lexical";
		let confidence = lexical.confidence;
		const model = modelById.get(draft.id);
		if (model && VALID_STATUS.has(model.status)) {
			const ids = allowedEvidence(model.evidenceIds, input.evidence);
			const modelNeedsEvidence = model.status === "SUPPORTED" || model.status === "PARTIALLY_SUPPORTED" || model.status === "CONTRADICTED";
			const lexicalHardConflict = lexical.rule === "number-conflict" || lexical.rule === "relation";
			if (modelNeedsEvidence && ids.length === 0) rationale = `${rationale} The model status was ignored because it did not cite retrieved evidence.`;
			else if (lexicalHardConflict && model.status === "SUPPORTED") rationale = `${lexical.rationale} A numeric or relational conflict in the retrieved text overrides a model status of SUPPORTED.`;
			else if (model.status === "NOT_APPLICABLE") {
				status = "NOT_APPLICABLE";
				evidenceIds = [];
				rationale = model.rationale.slice(0, 500);
				auditor = "model";
				confidence = 1;
			} else {
				status = model.status;
				evidenceIds = ids;
				rationale = model.rationale.slice(0, 500);
				auditor = "model";
				confidence = model.status === "SUPPORTED" ? .7 : model.status === "CONTRADICTED" ? .66 : .45;
			}
		}
		let temporalNote = null;
		if (isTimeSensitive(draft.text, draft.category) && status === "SUPPORTED") {
			const dates = evidenceIds.map((id) => evidenceById.get(id)).map((e) => e?.publishedAt || e?.pageUpdatedAt || null).filter((d) => Boolean(d));
			const ages = dates.map((d) => monthsOld(d, now)).filter((m) => m != null);
			if (ages.length === 0) {
				temporalNote = "This claim looks time-sensitive and the retrieved sources have no date.";
				status = "PARTIALLY_SUPPORTED";
				rationale = `${rationale} ${temporalNote}`;
			} else if (Math.min(...ages) > 18) {
				temporalNote = `The newest linked source date is over 18 months old (${dates[0]}).`;
				status = "PARTIALLY_SUPPORTED";
				rationale = `${rationale} ${temporalNote} Supported was downgraded to partially supported.`;
			}
		}
		return {
			...draft,
			status,
			confidence,
			evidenceIds,
			rationale,
			auditor,
			temporalNote
		};
	});
	const issues = [];
	for (let i = 0; i < claims.length; i++) for (let j = i + 1; j < claims.length; j++) {
		const a = claims[i];
		const b = claims[j];
		if (a.status === "NOT_APPLICABLE" || b.status === "NOT_APPLICABLE") continue;
		if (overlapRatio(a.text, b.text) < .5) continue;
		const na = extractNumbers(a.text).filter((n) => Math.abs(n) >= 3);
		const nb = extractNumbers(b.text).filter((n) => Math.abs(n) >= 3);
		if (na.length > 0 && nb.length > 0 && na.every((n) => !nb.some((m) => numbersClose(n, m)))) issues.push({
			claimIds: [a.id, b.id],
			text: "These claims cover similar ground but use numbers that do not agree.",
			source: "heuristic"
		});
	}
	const knownIds = new Set(claims.map((c) => c.id));
	for (const issue of input.modelIssues ?? []) {
		const ids = issue.claimIds.filter((id) => knownIds.has(id));
		if (ids.length === 0 || !issue.text.trim()) continue;
		const key = [...ids].sort().join(",");
		if (issues.some((existing) => [...existing.claimIds].sort().join(",") === key)) continue;
		issues.push({
			claimIds: ids,
			text: issue.text.slice(0, 400),
			source: "model"
		});
		if (issues.length >= 4) break;
	}
	const claimIds = /* @__PURE__ */ new Map();
	for (const claim of claims) for (const id of claim.evidenceIds) {
		const list = claimIds.get(id) ?? [];
		list.push(claim.id);
		claimIds.set(id, list);
	}
	const evidence = input.evidence.map((item) => ({
		...item,
		claimIds: claimIds.get(item.id) ?? item.claimIds
	}));
	const alignment = alignmentOf(input.question, input.answer);
	const scores = scoreAnalysis({
		claims,
		evidence,
		logicalIssueCount: Math.min(4, issues.length),
		alignment: alignment.score,
		evidenceAvailable: input.evidenceMode === "external"
	});
	const verifiable = claims.filter((c) => c.status !== "NOT_APPLICABLE");
	const weight = verifiable.reduce((s, c) => s + c.importance, 0) || 1;
	const contradiction = verifiable.length === 0 ? 0 : 100 * verifiable.filter((c) => c.status === "CONTRADICTED").reduce((s, c) => s + c.importance, 0) / weight;
	const fuzzy = fuzzyTrust({
		support: scores.factuality ?? 0,
		contradiction,
		coverage: scores.evidenceCoverage ?? 0
	});
	const tcs = tcsAnalysis({
		fuzzyTrust: fuzzy.score,
		claims,
		evidence,
		now
	});
	return {
		id: input.id,
		createdAt: now.toISOString(),
		question: input.question,
		answer: input.answer,
		answerSource: input.answerSource,
		generatorModel: input.generatorModel,
		evidenceMode: input.evidenceMode,
		evidenceNote: input.evidenceNote,
		extraction: input.extraction,
		claims,
		evidence,
		logicalIssues: issues.slice(0, 4),
		scores: {
			...scores,
			notes: [...scores.notes, `Alignment: ${alignment.reason}`]
		},
		fuzzy,
		tcs,
		pipelineLog: input.pipelineLog,
		improvement: null,
		improvedChildId: null
	};
}
function categoryFor(text) {
	if (looksLikeOpinion(text)) return "opinion";
	if (/\b(i feel|seems|arguably|beautiful|ugly)\b/i.test(text)) return "subjective";
	if (/[$€£]|percent|%|\b(revenue|profit|stock|gdp|inflation|price)\b/i.test(text)) return "financial";
	if (/\b(percent|percentage|average|median|rate|statistics|survey)\b/i.test(text)) return "statistical";
	if (/\b(1[0-9]{3}|20[0-9]{2})\b/.test(text) && /\b(in|on|year|century|founded|born)\b/i.test(text)) return "historical";
	if (/\b(today|currently|as of|this year|since)\b/i.test(text)) return "temporal";
	if (/\b(city|country|capital|river|mountain|located|continent)\b/i.test(text)) return "geographical";
	if (/\b(atom|species|planet|chemical|physics|disease|vaccine|gene|light|energy)\b/i.test(text)) return "scientific";
	if (extractNumbers(text).some((n) => Math.abs(n) >= 3)) return "numerical";
	return "factual";
}
function heuristicClaims(answer, limit = 5) {
	const sentences = answer.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter((s) => s.length >= 24 && !s.endsWith("?"));
	const drafts = [];
	let n = 1;
	for (const text of sentences) {
		const category = categoryFor(text);
		const opinion = category === "opinion" || category === "subjective";
		const nums = extractNumbers(text).filter((x) => Math.abs(x) >= 3);
		const importance = opinion ? 1 : nums.length > 0 ? 5 : text.length > 90 ? 4 : 3;
		const verifiability = opinion ? "none" : nums.length > 0 || /[A-Z][a-z]/.test(text) ? "high" : "medium";
		drafts.push({
			id: `c${n++}`,
			text: text.slice(0, 500),
			category,
			importance,
			verifiability,
			searchQuery: searchQueryFor(text)
		});
	}
	drafts.sort((a, b) => b.importance - a.importance || b.text.length - a.text.length);
	const seen = /* @__PURE__ */ new Set();
	const unique = [];
	for (const draft of drafts) {
		const key = draft.text.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		unique.push({
			...draft,
			id: `c${unique.length + 1}`
		});
		if (unique.length >= limit) break;
	}
	return unique;
}
var limit = 5;
var AnalyzeInput = object({
	question: string().trim().min(3).max(4e3),
	answer: string().trim().min(1).max(16e3),
	answerSource: _enum([
		"user",
		"generated",
		"improved"
	]).optional(),
	generatorModel: string().max(80).nullable().optional()
});
var VerifyClaimInput = object({ claim: string().trim().min(3).max(4e3) });
var GenerateInput = object({ question: string().trim().min(3).max(4e3) });
var MultiInput = object({
	question: string().trim().min(3).max(4e3),
	models: array(string()).min(1).max(3)
});
var EvidenceInput = object({
	id: string().max(40),
	title: string().max(300),
	url: string().max(500),
	snippet: string().max(1500),
	snippetKind: _enum([
		"extract",
		"search-snippet",
		"page-excerpt",
		"citation-only"
	]),
	pageUpdatedAt: string().max(40).nullable(),
	publishedAt: string().max(40).nullable(),
	quality: _enum([
		"PRIMARY_OFFICIAL",
		"SECONDARY_REPUTABLE",
		"GENERAL",
		"LOW_CONFIDENCE"
	])
});
var ImproveInput = object({
	question: string().trim().min(3).max(4e3),
	answer: string().trim().min(1).max(16e3),
	trustScore: number().min(0).max(100),
	riskLevel: string().max(20),
	claims: array(object({
		text: string().max(500),
		status: _enum(CLAIM_STATUSES),
		rationale: string().max(500)
	})).max(8),
	evidence: array(EvidenceInput).max(12),
	auditNotes: array(string().max(400)).max(8)
});
var ExtractSchema = object({ claims: array(object({
	text: string().min(8).max(500),
	category: _enum(CLAIM_CATEGORIES),
	importance: number().min(1).max(5),
	verifiability: _enum([
		"high",
		"medium",
		"low",
		"none"
	]),
	searchQuery: string().min(2).max(180)
})).max(8) });
var AuditSchema = object({
	claims: array(object({
		id: string(),
		status: _enum(CLAIM_STATUSES),
		evidenceIds: array(string()).max(6),
		rationale: string().max(500)
	})).max(8),
	logicalIssues: array(object({
		claimIds: array(string()).max(4),
		text: string().max(400)
	})).max(6).optional()
});
var ImproveSchema = object({
	improvedAnswer: string().min(20).max(8e3),
	corrections: array(object({
		originalClaim: string().max(500),
		correction: string().max(500),
		reason: string().max(500)
	})).max(12),
	sourcesUsed: array(object({
		title: string().max(300),
		url: string().max(500)
	})).max(12),
	uncertainties: array(string().max(400)).max(8)
});
function fail(error) {
	return {
		ok: false,
		error
	};
}
function allowedUrls(evidence) {
	const set = /* @__PURE__ */ new Set();
	for (const item of evidence) {
		const safe = safeHttpUrl(item.url);
		if (safe) set.add(safe.replace(/\/$/, ""));
	}
	return set;
}
function stripUnknownUrls(text, allowed) {
	let removed = 0;
	return {
		text: text.replace(/https?:\/\/[^\s)]+/g, (url) => {
			const safe = safeHttpUrl(url.replace(/[.,;]+$/, ""));
			if (safe && allowed.has(safe.replace(/\/$/, ""))) return url;
			removed += 1;
			return "";
		}).replace(/\s{2,}/g, " ").trim(),
		removed
	};
}
async function extractClaims(question, answer, log) {
	const model = await grokChat({
		system: "Extract externally checkable claims from an AI answer. Return JSON only with key claims. Do not score. Do not invent claims that are not in the answer. Prefer 3 to 5 factual claims. Mark opinions with category opinion and verifiability none. searchQuery is a short query with no assumed result.",
		user: JSON.stringify({
			question,
			answer: answer.slice(0, 8e3)
		}),
		maxTokens: 900,
		json: true
	});
	if (!model.ok) {
		log.push(`Claim extraction used the heuristic splitter because the model was unavailable. ${model.error}`);
		return {
			drafts: heuristicClaims(answer, limit),
			extraction: "heuristic"
		};
	}
	try {
		const drafts = ExtractSchema.parse(parseJsonObject(model.text)).claims.slice(0, limit).map((claim, index) => ({
			id: `c${index + 1}`,
			text: claim.text,
			category: claim.category,
			importance: Math.round(claim.importance),
			verifiability: claim.verifiability,
			searchQuery: claim.searchQuery
		}));
		if (drafts.length === 0) throw new Error("no claims");
		log.push("Claim extraction: model.");
		return {
			drafts,
			extraction: "model"
		};
	} catch {
		log.push("Claim extraction fell back to the heuristic splitter because the model JSON was invalid.");
		return {
			drafts: heuristicClaims(answer, limit),
			extraction: "heuristic"
		};
	}
}
async function auditClaims(question, drafts, evidence, log) {
	if (evidence.length === 0) return {
		judgments: [],
		issues: []
	};
	const model = await grokChat({
		system: "Compare claims ONLY to the evidence objects provided. Return JSON only. status is SUPPORTED, PARTIALLY_SUPPORTED, CONTRADICTED, UNVERIFIED, or NOT_APPLICABLE. Use CONTRADICTED only when the provided text conflicts. If evidence is missing, use UNVERIFIED. evidenceIds must come from the input. Do not invent ids, urls, quotations, or a numeric trust score. logicalIssues are contradictions inside the answer; claimIds must be real. rationale must not add new facts.",
		user: JSON.stringify({
			question,
			claims: drafts.map((claim) => ({
				id: claim.id,
				text: claim.text,
				category: claim.category
			})),
			evidence: evidence.map((item) => ({
				id: item.id,
				title: item.title,
				url: item.url,
				snippet: item.snippet.slice(0, 900),
				snippetKind: item.snippetKind,
				quality: item.quality,
				pageUpdatedAt: item.pageUpdatedAt
			}))
		}),
		maxTokens: 1e3,
		json: true,
		timeoutMs: 45e3
	});
	if (!model.ok) {
		log.push(`Model auditor unavailable. Lexical comparison was used. ${model.error}`);
		return {
			judgments: [],
			issues: []
		};
	}
	try {
		const parsed = AuditSchema.parse(parseJsonObject(model.text));
		const allowed = new Set(evidence.map((item) => item.url));
		log.push("Model auditor returned claim statuses. The trust score is still calculated in code.");
		return {
			judgments: parsed.claims.map((claim) => ({
				id: claim.id,
				status: claim.status,
				evidenceIds: claim.evidenceIds,
				rationale: stripUnknownUrls(claim.rationale, new Set([...allowed].map((url) => url.replace(/\/$/, "")))).text
			})),
			issues: parsed.logicalIssues ?? []
		};
	} catch {
		log.push("Model auditor JSON was invalid. Lexical comparison was used.");
		return {
			judgments: [],
			issues: []
		};
	}
}
async function runClaimVerification(raw) {
	const parsed = VerifyClaimInput.safeParse(raw);
	if (!parsed.success) return fail("Enter a claim of at least 3 characters.");
	const claim = parsed.data.claim;
	return runAnalysis({
		question: claim,
		answer: claim,
		answerSource: "user",
		generatorModel: null
	}, claim);
}
async function runAnalysis(raw, directClaim) {
	const parsed = AnalyzeInput.safeParse(raw);
	if (!parsed.success) return fail("Enter a question and an answer. Text length limits apply.");
	if (!takeRateToken()) return fail("Too many verification requests. Wait a minute and try again.");
	const { question, answer } = parsed.data;
	const log = [];
	const { drafts, extraction } = directClaim ? {
		drafts: [{
			id: "c1",
			text: directClaim,
			category: "factual",
			importance: 4,
			verifiability: "high",
			searchQuery: directClaim
		}],
		extraction: "heuristic"
	} : await extractClaims(question, answer, log);
	if (directClaim) log.push("Web Verify searched the submitted question or claim directly.");
	let evidence = [];
	let evidenceMode = "unavailable";
	let evidenceNote = "External evidence verification unavailable.";
	if (drafts.some((claim) => claim.verifiability !== "none")) {
		const queries = drafts.filter((claim) => claim.verifiability !== "none").map((claim) => claim.searchQuery);
		try {
			const searched = await searchEvidence(queries);
			evidenceMode = searched.mode;
			evidenceNote = searched.note;
			evidence = toEvidence(searched.hits, (/* @__PURE__ */ new Date()).toISOString());
			log.push(searched.mode === "external" ? `Retrieved ${evidence.length} source(s). Snippets are labeled as extracts, search snippets, or page excerpts.` : evidenceNote || "External evidence verification unavailable.");
		} catch {
			log.push("External evidence verification unavailable. Search failed.");
		}
	} else {
		evidenceNote = "No verifiable factual claims were extracted.";
		log.push(evidenceNote);
	}
	const audit = evidenceMode === "external" ? await auditClaims(question, drafts, evidence, log) : {
		judgments: [],
		issues: []
	};
	if (evidenceMode !== "external") log.push("Statuses are unverified because external evidence was not available.");
	return {
		ok: true,
		record: assembleVerification({
			id: crypto.randomUUID(),
			question,
			answer,
			answerSource: parsed.data.answerSource ?? "user",
			generatorModel: parsed.data.generatorModel ?? null,
			drafts,
			evidence,
			evidenceMode,
			evidenceNote,
			extraction,
			modelJudgments: audit.judgments,
			modelIssues: audit.issues,
			pipelineLog: log
		})
	};
}
async function generateAnswer(raw) {
	const parsed = GenerateInput.safeParse(raw);
	if (!parsed.success) return fail("Enter a question of at least 3 characters.");
	if (!takeRateToken()) return fail("Too many requests. Wait a minute and try again.");
	const activeConfig = getActiveServerSettings();
	const result = await grokChat({
		model: activeConfig.primaryModel || "grok-4.5",
		system: "Answer the question directly and concisely. If you are unsure, say so. Do not claim you searched the live web. This answer will be verified separately and is not itself a verification.",
		user: parsed.data.question,
		maxTokens: 700,
		temperature: activeConfig.temperature ?? .3
	});
	if (!result.ok) return fail(result.error);
	return {
		ok: true,
		answer: result.text,
		model: result.model
	};
}
async function askOne(raw) {
	const parsed = object({
		question: string().trim().min(3).max(4e3),
		model: string().max(80)
	}).safeParse(raw);
	if (!parsed.success) return fail("Enter a question and a configured model.");
	const activeConfig = getActiveServerSettings();
	const isPrimary = parsed.data.model === activeConfig.primaryModel;
	const known = MULTI_MODELS.find((model) => model.id === parsed.data.model);
	if (!known && !isPrimary) return fail("That model is not configured.");
	const label = isPrimary ? activeConfig.modelLabel || activeConfig.primaryModel : known?.label || parsed.data.model;
	if (!takeRateToken()) return fail("Too many requests. Wait a minute and try again.");
	const result = await grokChat({
		model: parsed.data.model,
		system: "Answer the question directly. If you are unsure, say so. Do not invent citations.",
		user: parsed.data.question,
		maxTokens: 600,
		temperature: .3,
		timeoutMs: 4e4
	});
	if (!result.ok) return {
		ok: true,
		result: {
			model: parsed.data.model,
			label,
			ok: false,
			text: "",
			error: result.error
		}
	};
	return {
		ok: true,
		result: {
			model: parsed.data.model,
			label,
			ok: true,
			text: result.text,
			error: null
		}
	};
}
async function askModels(raw) {
	const parsed = MultiInput.safeParse(raw);
	if (!parsed.success) return fail("Enter a question and at least one model.");
	if (!takeRateToken()) return fail("Too many requests. Wait a minute and try again.");
	const activeConfig = getActiveServerSettings();
	const allowed = new Map(MULTI_MODELS.map((model) => [model.id, model.label]));
	if (activeConfig.primaryModel && !allowed.has(activeConfig.primaryModel)) allowed.set(activeConfig.primaryModel, `${activeConfig.modelLabel || activeConfig.primaryModel} (Primary)`);
	const chosen = parsed.data.models.filter((id) => allowed.has(id));
	if (chosen.length === 0) return fail("None of the selected models are configured.");
	return {
		ok: true,
		results: await Promise.all(chosen.map(async (id) => {
			const label = allowed.get(id) || id;
			const result = await grokChat({
				model: id,
				system: "Answer the question directly. If you are unsure, say so. Do not invent citations.",
				user: parsed.data.question,
				maxTokens: 600,
				temperature: .3,
				timeoutMs: 4e4
			});
			if (!result.ok) return {
				model: id,
				label,
				ok: false,
				text: "",
				error: result.error
			};
			return {
				model: id,
				label,
				ok: true,
				text: result.text,
				error: null
			};
		}))
	};
}
async function improveDraft(raw) {
	const parsed = ImproveInput.safeParse(raw);
	if (!parsed.success) return fail("The improvement request was missing claim or evidence details.");
	if (parsed.data.trustScore >= 85) return fail("This answer already meets the 85 trust threshold, so improvement is not offered.");
	if (!takeRateToken()) return fail("Too many requests. Wait a minute and try again.");
	const gaps = parsed.data.claims.filter((claim) => claim.status === "UNVERIFIED" || claim.status === "CONTRADICTED");
	let evidence = parsed.data.evidence.filter((item) => safeHttpUrl(item.url));
	if (gaps.length > 0) try {
		const extra = await searchEvidence(gaps.slice(0, 2).map((claim) => claim.text.slice(0, 160)));
		const retrievedAt = (/* @__PURE__ */ new Date()).toISOString();
		const mapped = toEvidence(extra.hits, retrievedAt).filter((item) => !evidence.some((existing) => sameUrl(existing.url, item.url)));
		evidence = [...evidence, ...mapped].slice(0, 12);
	} catch {}
	const allowed = allowedUrls(evidence);
	const model = await grokChat({
		system: "Revise the answer so it is more accurate using ONLY the evidence JSON. Return JSON with improvedAnswer, corrections, sourcesUsed, uncertainties. Do not invent facts, numbers, quotations, or urls. Every url must be copied from the evidence list. If evidence is insufficient, say so. Do not try to maximize a score. Preserve accurate parts of the original answer. Answer the original question.",
		user: JSON.stringify({
			question: parsed.data.question,
			originalAnswer: parsed.data.answer,
			originalTrustScore: parsed.data.trustScore,
			riskLevel: parsed.data.riskLevel,
			claims: parsed.data.claims,
			evidence,
			auditNotes: parsed.data.auditNotes
		}),
		maxTokens: 1200,
		json: true,
		timeoutMs: 5e4
	});
	if (!model.ok) return fail(model.error);
	let draft;
	try {
		draft = ImproveSchema.parse(parseJsonObject(model.text));
	} catch {
		return fail("The improvement model returned malformed JSON. Nothing was saved.");
	}
	const cleaned = stripUnknownUrls(draft.improvedAnswer, allowed);
	const sourcesUsed = draft.sourcesUsed.filter((source) => {
		const safe = safeHttpUrl(source.url);
		return Boolean(safe && [...allowed].some((url) => sameUrl(url, safe)));
	});
	const uncertainties = [...draft.uncertainties];
	if (cleaned.removed > 0 || sourcesUsed.length < draft.sourcesUsed.length) uncertainties.push("A cited source was removed because it was not in the retrieved evidence.");
	if (!cleaned.text || cleaned.text.length < 20) return fail("The improved answer was empty after removing unsupported source links.");
	return {
		ok: true,
		improvedAnswer: cleaned.text,
		corrections: draft.corrections,
		sourcesUsed: sourcesUsed.map((source) => ({
			title: source.title,
			url: safeHttpUrl(source.url) || source.url
		})),
		uncertainties
	};
}
//#endregion
export { askModels, askOne, generateAnswer, improveDraft, runAnalysis, runClaimVerification };
