// ==UserScript==
// @name        Geckium - URL bar
// @author		AngelBruni
// @loadorder   3
// ==/UserScript==

function loadWizard() {
	if (unsupportedForks[forkName])
		return;

	if (!pref("Geckium.firstRun.complete").tryGet.bool())
		openGSplash();
}

window.addEventListener("load", loadWizard);