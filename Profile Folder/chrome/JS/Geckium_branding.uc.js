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
	static get getBrandingPrefName() {
		return "Geckium.branding.choice";
	}

	static getCurrentBranding(method) {
		const branding = {
			0: {
				"name": "geckium",
				"fullName": "Geckium",
				"productName": "Geckium",
				"vendorName": ""
			},
			1: {
				"name": "firefox",
				"fullName": "Mozilla Firefox",
				"productName": "Firefox",
				"vendorName": "Mozilla"
			},
			2: {
				"name": "chromium",
				"fullName": "Chromium",
				"productName": "Chromium",
				"vendorName": ""
			},
			3: {
				"name": "chrome",
				"fullName": "Google Chrome",
				"productName": "Chrome",
				"vendorName": "Google"
			},
			4: {
				"name": "canary",
				"fullName": "Google Chrome",
				"productName": "Chrome",
				"vendorName": ""
			},
			5: {
				"name": "chromeos",
				"fullName": "Chrome OS",
				"productName": "Chrome OS",
				"vendorName": "Google"
			}
		};

		let currentChoice = gkPrefUtils.tryGet(this.getBrandingPrefName).int;

		if (currentChoice < 0 || !currentChoice)
			currentChoice == 0;
		else if (currentChoice > 4)
			currentChoice == 4;

		if (method)
			return branding[currentChoice][method];
		else
			return currentChoice;
	}

	static setBranding(choice) {
		gkPrefUtils.set(this.getBrandingPrefName).int(choice);

		console.log(`Branding set: ${this.getBrandingKeyValue("name")}`);
	}

	static getBrandingKeyValue(key) {
		return this.getCurrentBranding(key);
	}

	static load() {
		const brandingName = gkBranding.getBrandingKeyValue("name");
		const fullName = gkBranding.getBrandingKeyValue("fullName");

		// Set branding attribute.
		document.documentElement.setAttribute("gkbranding", brandingName);

		if (isBrowserWindow) {
			// Set attributes for future tabs.
			gkSetAttributes(document.documentElement, {
				"data-title-default": brandingName,
				"data-title-private": brandingName,
				"data-content-title-default": `CONTENTTITLE — ${brandingName}`,
				"data-content-title-private": `CONTENTTITLE — ${brandingName}`
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
Services.prefs.addObserver(gkBranding.getBrandingPrefName, gkBrandingObs, false);