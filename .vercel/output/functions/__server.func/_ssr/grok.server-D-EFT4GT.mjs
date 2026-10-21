import { o as __exportAll, t as getActiveServerSettings } from "./settings.server-CTS_aY1P.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/grok.server-D-EFT4GT.js
var grok_server_exports = /* @__PURE__ */ __exportAll({
	grokChat: () => grokChat,
	parseJsonObject: () => parseJsonObject,
	takeRateToken: () => takeRateToken
});
var hits = [];
function takeRateToken(limit = 15, windowMs = 6e4) {
	const now = Date.now();
	while (hits.length > 0 && hits[0] < now - windowMs) hits.shift();
	if (hits.length >= limit) return false;
	hits.push(now);
	return true;
}
function parseJsonObject(text) {
	const trimmed = text.trim();
	const body = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1] ?? trimmed;
	const start = body.indexOf("{");
	const end = body.lastIndexOf("}");
	if (start < 0 || end <= start) throw new Error("The model did not return JSON.");
	return JSON.parse(body.slice(start, end + 1));
}
function friendlyStatus(status, body, providerName) {
	if (status === 401 || status === 403) return `The AI provider (${providerName}) authentication failed. Please verify your API key in the Settings tab.`;
	if (status === 404) return `The AI provider returned 404 Not Found. Please check the model name or API base URL in Settings.`;
	if (status === 429) return `The AI provider (${providerName}) rate-limited this request. Please wait a moment or check your quota.`;
	return `The AI provider (${providerName}) returned ${status}: ${body.slice(0, 180)}`;
}
async function grokChat(options) {
	const activeConfig = {
		...getActiveServerSettings(),
		...options.config || {}
	};
	const provider = activeConfig.provider || "xai";
	const model = options.model || activeConfig.primaryModel || "grok-4.5";
	let baseUrl = (activeConfig.baseUrl || "https://api.x.ai/v1").trim().replace(/\/+$/, "");
	let apiKey = (activeConfig.apiKey || "").trim();
	if (!apiKey && provider === "xai") apiKey = (process.env.XAI_API_KEY || "").trim();
	const isLocal = baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1") || provider === "ollama";
	if (!apiKey && !isLocal) return {
		ok: false,
		error: `API key is missing for ${activeConfig.modelLabel || provider}. Please configure it in the Settings tab.`
	};
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 45e3);
	const isAnthropic = provider === "anthropic" || baseUrl.includes("anthropic.com");
	try {
		let endpoint = "";
		let headers = { "Content-Type": "application/json" };
		let requestBody = "";
		if (isAnthropic) {
			endpoint = baseUrl.endsWith("/messages") ? baseUrl : `${baseUrl}/messages`;
			headers["x-api-key"] = apiKey;
			headers["anthropic-version"] = "2023-06-01";
			requestBody = JSON.stringify({
				model,
				max_tokens: options.maxTokens,
				system: options.system,
				messages: [{
					role: "user",
					content: options.user
				}],
				temperature: options.temperature ?? activeConfig.temperature ?? 0
			});
		} else {
			endpoint = baseUrl.endsWith("/chat/completions") ? baseUrl : `${baseUrl}/chat/completions`;
			if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
			if (provider === "openrouter" || baseUrl.includes("openrouter.ai")) {
				headers["HTTP-Referer"] = "https://trustlens.app";
				headers["X-Title"] = "TrustLens";
			}
			const payload = {
				model,
				temperature: options.temperature ?? activeConfig.temperature ?? 0,
				max_tokens: options.maxTokens,
				messages: [{
					role: "system",
					content: options.system
				}, {
					role: "user",
					content: options.user
				}]
			};
			if (options.json) payload.response_format = { type: "json_object" };
			requestBody = JSON.stringify(payload);
		}
		const response = await fetch(endpoint, {
			method: "POST",
			signal: controller.signal,
			headers,
			body: requestBody
		});
		if (!response.ok) {
			const body = await response.text();
			if (options.json && response.status === 400 && !options.retried && !isAnthropic) return grokChat({
				...options,
				json: false,
				retried: true
			});
			return {
				ok: false,
				error: friendlyStatus(response.status, body, activeConfig.modelLabel || provider)
			};
		}
		const json = await response.json();
		let text = "";
		if (isAnthropic) text = json.content?.[0]?.text?.trim() ?? "";
		else text = json.choices?.[0]?.message?.content?.trim() ?? "";
		if (!text) return {
			ok: false,
			error: "The AI provider returned an empty response."
		};
		return {
			ok: true,
			text,
			model
		};
	} catch (error) {
		if (error instanceof Error && error.name === "AbortError") return {
			ok: false,
			error: "The AI provider timed out."
		};
		const message = error instanceof Error ? error.message : "Unknown connection error";
		return {
			ok: false,
			error: `Connection to ${activeConfig.modelLabel || provider} failed: ${message}`
		};
	} finally {
		clearTimeout(timer);
	}
}
//#endregion
export { takeRateToken as i, grok_server_exports as n, parseJsonObject as r, grokChat as t };
