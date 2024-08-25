// ==UserScript==
// @name        Geckium - Branding
// @author		AngelBruni
// @description Code for FAKE branding.
// @loadorder   2
// @include		main
// @include		about:preferences*
// @include		about:addons*
// ==/UserScript==

class gkBranding {
	static OSQualifiers = ["chromiumos"];
	static branding = {
		"geckium": {
			"fullName": "Geckium",
			"productName": "Geckium",
			"vendorName": ""
		},
		"firefox": {
			"fullName": "Mozilla Firefox",
			"productName": "Firefox",
			"vendorName": "Mozilla"
		},
		"chromium": {
			"fullName": "Chromium",
			"fullNameOS": "Chromium OS",
			"productName": "Chromium",
			"productNameOS": "Chromium OS",
			"vendorName": ""
		},
		"chrome": {
			"name": "chrome",
			"fullName": "Google Chrome",
			"fullNameOS": "Google Chrome OS",
			"productName": "Chrome",
			"productNameOS": "Chrome OS",
			"vendorName": "Google"
		}
	};

    /** getIsOS: Returns True if the current titlebar style is Chromium OS
     */
	static getIsOS() {
		let titChoice = gkTitlebars.getTitlebar(gkEras.getBrowserEra());
		return gkBranding.OSQualifiers.includes(titChoice);
	}

    /** getCurrentBranding: Returns the current branding choice
     */
	static getCurrentBranding() {
		let prefChoice = gkPrefUtils.tryGet("Geckium.branding.choice").string;
		if (Object.keys(gkBranding.branding).includes(prefChoice)) {
			return prefChoice;
		} else {
			return "geckium"; //Fallback
		}
	}

    /** getBrandingKey: Gets an aspect of your current branding
	 * 
	 * key: The aspect of the branding to get
	 * useOSValue: Redirects to the OS equivalent whenever appropriate to if True
     */
	static getBrandingKey(key, useOSValue) {
		let prefChoice = gkBranding.getCurrentBranding();
		if (useOSValue) { // Use the 'OS' branding, if present, instead
			if (gkBranding.getIsOS() && Object.keys(gkBranding.branding[prefChoice]).includes(key + "OS")) {
				return gkBranding.branding[prefChoice][key + "OS"];
			}
		}
		return gkBranding.branding[prefChoice][key];
	}

    /** load: Replaces Mozilla Firefox branding with appropriate Geckium branding in the current window
     */
	static load() {
		const prefChoice = gkBranding.getCurrentBranding();
		const fullName = gkBranding.branding[prefChoice]["fullName"];

		// Set branding attribute.
		document.documentElement.setAttribute("gkbranding", prefChoice);

		if (isBrowserWindow) {
			// Set attributes for future tabs.
			gkSetAttributes(document.documentElement, {
				"data-title-default": fullName,
				"data-title-private": fullName,
				"data-content-title-default": `CONTENTTITLE - ${fullName}`,
				"data-content-title-private": `CONTENTTITLE - ${fullName}`
			});
	
			// Replace title of just loaded window.
			const windowTitle = document.head.querySelector("title");
			if (!windowTitle.textContent.includes(fullName))
				windowTitle.textContent = fullName;
		}
	}
}
window.addEventListener("load", gkBranding.load);
const gkBrandingObs = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed")
			gkBranding.load();
	},
};
Services.prefs.addObserver("Geckium.branding.choice", gkBrandingObs, false);