import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-4U2TfOeN.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var analyzeAnswer_createServerFn_handler = createServerRpc({
	id: "15c4f1c53cd00de5f1eb646ca776ba5a7a398209a23d861e1523e731dda0c072",
	name: "analyzeAnswer",
	filename: "src/lib/verify/api.ts"
}, (opts) => analyzeAnswer.__executeServer(opts));
var analyzeAnswer = createServerFn({ method: "POST" }).validator((data) => data).handler(analyzeAnswer_createServerFn_handler, async ({ data }) => {
	const { runAnalysis } = await import("./pipeline.server-EHTn9Zcz.mjs");
	return runAnalysis(data);
});
var verifyClaim_createServerFn_handler = createServerRpc({
	id: "80fee5372d3a9bec5bf0eb3dca3919e4a356c0e563cbe6a3610f1377749f90f1",
	name: "verifyClaim",
	filename: "src/lib/verify/api.ts"
}, (opts) => verifyClaim.__executeServer(opts));
var verifyClaim = createServerFn({ method: "POST" }).validator((data) => data).handler(verifyClaim_createServerFn_handler, async ({ data }) => {
	const { runClaimVerification } = await import("./pipeline.server-EHTn9Zcz.mjs");
	return runClaimVerification(data);
});
var generateOnScreen_createServerFn_handler = createServerRpc({
	id: "4178f05ad860cf0189a743d655797fabb7fc71bf36f51cb9ff08e022e74e4462",
	name: "generateOnScreen",
	filename: "src/lib/verify/api.ts"
}, (opts) => generateOnScreen.__executeServer(opts));
var generateOnScreen = createServerFn({ method: "POST" }).validator((data) => data).handler(generateOnScreen_createServerFn_handler, async ({ data }) => {
	const { generateAnswer } = await import("./pipeline.server-EHTn9Zcz.mjs");
	return generateAnswer(data);
});
var askMulti_createServerFn_handler = createServerRpc({
	id: "2191bc1ff24ea9a9abf510f72ef8ee0dfb8828f4fe2fccf4770ee8bddf37cc9e",
	name: "askMulti",
	filename: "src/lib/verify/api.ts"
}, (opts) => askMulti.__executeServer(opts));
var askMulti = createServerFn({ method: "POST" }).validator((data) => data).handler(askMulti_createServerFn_handler, async ({ data }) => {
	const { askModels } = await import("./pipeline.server-EHTn9Zcz.mjs");
	return askModels(data);
});
var askOneModel_createServerFn_handler = createServerRpc({
	id: "593491e798adc02276ab1b498ae083566f1215f131f965f5cf9f4f9e9db02bbe",
	name: "askOneModel",
	filename: "src/lib/verify/api.ts"
}, (opts) => askOneModel.__executeServer(opts));
var askOneModel = createServerFn({ method: "POST" }).validator((data) => data).handler(askOneModel_createServerFn_handler, async ({ data }) => {
	const { askOne } = await import("./pipeline.server-EHTn9Zcz.mjs");
	return askOne(data);
});
var improveAnswer_createServerFn_handler = createServerRpc({
	id: "a24ca759d707968ccbaa8b85d32886c4b1778c5c96ec2e2d1aacb338366d0839",
	name: "improveAnswer",
	filename: "src/lib/verify/api.ts"
}, (opts) => improveAnswer.__executeServer(opts));
var improveAnswer = createServerFn({ method: "POST" }).validator((data) => data).handler(improveAnswer_createServerFn_handler, async ({ data }) => {
	const { improveDraft } = await import("./pipeline.server-EHTn9Zcz.mjs");
	return improveDraft(data);
});
var saveModelSettingsServerFn_createServerFn_handler = createServerRpc({
	id: "63a8a8ec9ae4454c7d1ff282e86c2931bdad753da2396a95fe3a7ae30ff23cf4",
	name: "saveModelSettingsServerFn",
	filename: "src/lib/verify/api.ts"
}, (opts) => saveModelSettingsServerFn.__executeServer(opts));
var saveModelSettingsServerFn = createServerFn({ method: "POST" }).validator((data) => data).handler(saveModelSettingsServerFn_createServerFn_handler, async ({ data }) => {
	const { setActiveServerSettings } = await import("./settings.server-CTS_aY1P.mjs").then((n) => n.n);
	return {
		ok: true,
		settings: setActiveServerSettings(data && typeof data === "object" ? data : {})
	};
});
var getModelSettingsServerFn_createServerFn_handler = createServerRpc({
	id: "9b0e8a32083f8a7d920d7de8d7d98f9a4d198103244346901b70d85377fc45ae",
	name: "getModelSettingsServerFn",
	filename: "src/lib/verify/api.ts"
}, (opts) => getModelSettingsServerFn.__executeServer(opts));
var getModelSettingsServerFn = createServerFn({ method: "GET" }).handler(getModelSettingsServerFn_createServerFn_handler, async () => {
	const { getActiveServerSettings, maskApiKey } = await import("./settings.server-CTS_aY1P.mjs").then((n) => n.n);
	const settings = getActiveServerSettings();
	return {
		ok: true,
		settings: {
			...settings,
			apiKey: maskApiKey(settings.apiKey),
			hasCustomKey: Boolean(settings.apiKey),
			hasEnvKey: Boolean(process.env.XAI_API_KEY)
		}
	};
});
var testModelConnectionServerFn_createServerFn_handler = createServerRpc({
	id: "93d265ff00b75451b0b20c349dc2d2cc30bbfbfbf23a1a738ccada75e2d3d6d1",
	name: "testModelConnectionServerFn",
	filename: "src/lib/verify/api.ts"
}, (opts) => testModelConnectionServerFn.__executeServer(opts));
var testModelConnectionServerFn = createServerFn({ method: "POST" }).validator((data) => data).handler(testModelConnectionServerFn_createServerFn_handler, async ({ data }) => {
	const { grokChat } = await import("./grok.server-D-EFT4GT.mjs").then((n) => n.n);
	const input = data && typeof data === "object" ? data : {};
	const startTime = Date.now();
	const result = await grokChat({
		config: input.settings,
		model: input.settings?.primaryModel,
		system: "You are an AI connectivity tester for TrustLens. Keep your answer brief.",
		user: "Respond with exactly: 'TrustLens connected successfully.'",
		maxTokens: 50,
		temperature: 0,
		timeoutMs: 3e4
	});
	const latencyMs = Date.now() - startTime;
	if (!result.ok) return {
		ok: false,
		error: result.error,
		latencyMs
	};
	return {
		ok: true,
		text: result.text,
		model: result.model,
		latencyMs
	};
});
//#endregion
export { analyzeAnswer_createServerFn_handler, askMulti_createServerFn_handler, askOneModel_createServerFn_handler, generateOnScreen_createServerFn_handler, getModelSettingsServerFn_createServerFn_handler, improveAnswer_createServerFn_handler, saveModelSettingsServerFn_createServerFn_handler, testModelConnectionServerFn_createServerFn_handler, verifyClaim_createServerFn_handler };
