// ==UserScript==
// @name           	Geckium - About Addons
// @author         	AngelBruni
// @description    	Adds About pane to about:preferences
// @include			about:addons*
// ==/UserScript==

function addProductName() {
	let sidebarHeader = document.getElementById("sidebarHeader");

	if (!sidebarHeader) {
		sidebarHeader = document.createElement("h1");
		sidebarHeader.id = "sidebarHeader";
	}
	sidebarHeader.textContent = gkBranding.getBrandingKeyValue("productName");

	gkInsertElm.before(sidebarHeader, document.getElementById("categories"));
}

document.addEventListener("DOMContentLoaded", addProductName);

const appearanceObs = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			addProductName();
		}
	},
};
Services.prefs.addObserver("Geckium.branding.choice", appearanceObs, false);