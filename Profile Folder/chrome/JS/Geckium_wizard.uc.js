// ==UserScript==
// @name        Geckium - URL bar
// @author		AngelBruni
// @loadorder   3
// ==/UserScript==

function loadWizard() {
	if (unsupportedForks[forkName])
		return;

	if (!gkPrefUtils.tryGet("Geckium.firstRun.complete").bool)
		openGSplash();
}

window.addEventListener("load", loadWizard);