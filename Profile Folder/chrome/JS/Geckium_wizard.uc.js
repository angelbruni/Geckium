// ==UserScript==
// @name        Geckium - Wizard
// @author		AngelBruni
// @loadorder   3
// ==/UserScript==

window.addEventListener("load", () => {
	// Open Geckium Wizard
	if (!gkPrefUtils.tryGet("Geckium.firstRun.complete").bool)
		openGSplash();
});