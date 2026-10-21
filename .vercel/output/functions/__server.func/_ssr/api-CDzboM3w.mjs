import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-CDzboM3w.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var analyzeAnswer = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("15c4f1c53cd00de5f1eb646ca776ba5a7a398209a23d861e1523e731dda0c072"));
var verifyClaim = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("80fee5372d3a9bec5bf0eb3dca3919e4a356c0e563cbe6a3610f1377749f90f1"));
var generateOnScreen = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("4178f05ad860cf0189a743d655797fabb7fc71bf36f51cb9ff08e022e74e4462"));
createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("2191bc1ff24ea9a9abf510f72ef8ee0dfb8828f4fe2fccf4770ee8bddf37cc9e"));
var askOneModel = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("593491e798adc02276ab1b498ae083566f1215f131f965f5cf9f4f9e9db02bbe"));
var improveAnswer = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("a24ca759d707968ccbaa8b85d32886c4b1778c5c96ec2e2d1aacb338366d0839"));
createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("63a8a8ec9ae4454c7d1ff282e86c2931bdad753da2396a95fe3a7ae30ff23cf4"));
createServerFn({ method: "GET" }).handler(createSsrRpc("9b0e8a32083f8a7d920d7de8d7d98f9a4d198103244346901b70d85377fc45ae"));
createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("93d265ff00b75451b0b20c349dc2d2cc30bbfbfbf23a1a738ccada75e2d3d6d1"));
//#endregion
export { verifyClaim as a, improveAnswer as i, askOneModel as n, generateOnScreen as r, analyzeAnswer as t };
