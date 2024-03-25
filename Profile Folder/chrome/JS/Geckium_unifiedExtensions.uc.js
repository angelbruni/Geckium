function hideUnifiedExtensionsButton() {
	const navBar = document.getElementById("nav-bar");
	const unifiedExtensionsButton = document.getElementById("unified-extensions-button");
	//const navBarCustomizationTarget = document.getElementById("nav-bar-customization-target");
	const urlbarBackground = document.getElementById("urlbar-background");

	if (pref("Geckium.unifiedExtensions.hide").tryGet.bool()) {
		navBar.setAttribute("unifiedextensions", "hide");
		insertAfter(unifiedExtensionsButton, urlbarBackground);
		
	} else {
		navBar.removeAttribute("unifiedextensions");
		insertBefore(unifiedExtensionsButton, document.getElementById("page-button"))
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