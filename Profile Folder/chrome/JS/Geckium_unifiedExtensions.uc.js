// ==UserScript==
// @name        Geckium - Unified Extensions
// @author      AngelBruni
// @loadorder   3
// ==/UserScript==

function hideUnifiedExtensionsButton() {
	const navBar = document.getElementById("nav-bar");
	const unifiedExtensionsButton = document.getElementById("unified-extensions-button");
	//const navBarCustomizationTarget = document.getElementById("nav-bar-customization-target");
	const urlbarBackground = document.getElementById("urlbar-background");

	if (gkPrefUtils.tryGet("Geckium.unifiedExtensions.hide").bool) {
		navBar.setAttribute("unifiedextensions", "hide");
		gkInsertElm.after(unifiedExtensionsButton, urlbarBackground);
		
	} else {
		navBar.removeAttribute("unifiedextensions");
		gkInsertElm.after(unifiedExtensionsButton, document.getElementById("page-button"))
	}
}

window.addEventListener("load", hideUnifiedExtensionsButton);

// FIXME: Find the correct event instead of using a timeout initially.
setTimeout(() => {
	hideUnifiedExtensionsButton();
}, 50);

/* bruni: Automatically apply appearance and theme
		  attributes when it detecs changes in the pref. */
const unifiedExtensionsObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			hideUnifiedExtensionsButton();
		}
	},
};
Services.prefs.addObserver("Geckium.unifiedExtensions.hide", unifiedExtensionsObserver, false);