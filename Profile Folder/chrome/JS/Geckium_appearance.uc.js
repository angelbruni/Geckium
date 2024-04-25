// ==UserScript==
// @name        Geckium - Appearance
// @author		AngelBruni
// @description	Settings the desired appearance chosen by the user accordingly.
// @loadorder   2
// ==/UserScript==

var { AppConstants } = ChromeUtils.importESModule("resource://gre/modules/AppConstants.sys.mjs");

const forkName = AppConstants.MOZ_APP_NAME;
const unsupportedForks = {
	"superfox": true,
	"r3dfox": true
}

const appearanceChanged = new CustomEvent("appearanceChanged");

const appearanceMap = {
	0: "five",
	1: "six",
	2: "eleven",
	3: "twentyone",
	4: "twentyfive",
	5: "fortyseven",
	6: "seventy",
};

let previousChoice;

if (unsupportedForks[forkName]) {
	_ucUtils.showNotification(
		{
		  	label : "The " + forkName.charAt(0).toUpperCase() + forkName.slice(1) + " browser will receive no support from the Geckium team. Please download a recommended fork.",  // text shown in the notification
		  	type : "unsupported-fork",         // opt identifier for this notification
		  	priority: "critical",           // opt one of ["system","critical","warning","info"]
		  	buttons: [{
				label: "Recommended forks",
				callback: (notification) => {
				  	notification.ownerGlobal.openWebLinkIn(
						"https://github.com/MrOtherGuy/fx-autoconfig#startup-error",
						"tab"
				  	);
				  	return false
				}
		  	}],
		}
	);

	docElm.setAttribute("unsupported-fork", true);
}

function applyApperance(choice) {
	if (unsupportedForks[forkName])
		return;
	
	let prefChoice = pref("Geckium.appearance.choice").tryGet.int();

	if (document.URL == "about:newtab" || document.URL == "about:home" || document.url == "about:apps") {
		switch (pref("Geckium.newTabHome.styleMode").tryGet.string()) {
			case "forced":
				prefChoice = pref("Geckium.newTabHome.style").tryGet.int();
				break;
			default:
				prefChoice = pref("Geckium.appearance.choice").tryGet.int();
				break;
		}
	} else {
		prefChoice = pref("Geckium.appearance.choice").tryGet.int();
	}

	if (!prefChoice)
		prefChoice = 0;

	if (isBrowserWindow) {
		if (prefChoice == previousChoice) {
			console.log("Choice same as previous choice, ignoring.", prefChoice, previousChoice)
			return;
		} else {
			console.log("Choice not the same as previous choice, continuing.", prefChoice, previousChoice)
		}
	}

	// bruni: We get the first and last available keys so
	//		  we don't hardcode the values in the code.
	const mapKeys = Object.keys(appearanceMap).map(Number);
	const firstKey = Math.min(...mapKeys);
	const lastKey = Math.max(...mapKeys);

	// bruni: Let's remove all appearance attributes first.
	const pastAttrs = docElm.getAttributeNames();
	pastAttrs.forEach((attr) => {
		if (attr.startsWith("geckium-") && !attr.includes("crflag"))
			docElm.removeAttribute(attr);
	});

	// bruni: Let's apply the correct appearance attributes.
	
	if (typeof choice === "number") {
		if (prefChoice > lastKey) {
			choice = lastKey;
		} else if (prefChoice < firstKey || prefChoice == null) {
			choice = firstKey;
		}
		console.log(choice)
	} else {
		choice = prefChoice;
	}

	for (let i = 0; i <= choice; i++) {
		if (appearanceMap[i]) {
			const attr = "geckium-" + appearanceMap[i];
			docElm.setAttribute(attr, "");
		}
	}

	// bruni: Let's also apply the attribute specific to the
	//		  user choice so we can make unique styles for it.
	docElm.setAttribute("geckium-choice", appearanceMap[choice]);

	previousChoice = prefChoice;
	
	if (isBrowserWindow)
		dispatchEvent(appearanceChanged);	
}

window.addEventListener("load", applyApperance);

// FIXME: Find the correct event instead of using a timeout initially.
setTimeout(() => {
	applyApperance();
}, 50);

class gkLWTheme {
	static get classicWindowFrame() {
		return {
			enable: function() {
				if (isBrowserWindow) {
					if (!window.matchMedia("(-moz-windows-compositor: 1)").matches) {
						docElm.setAttribute("chromemargin", "0,0,0,0");
					} else {
						docElm.setAttribute("chromemargin", "0,0,0,0");
					}
				}
			},
			disable: function() {
				if (isBrowserWindow) {
					if (!window.matchMedia("(-moz-windows-compositor: 1)").matches) {
						docElm.setAttribute("chromemargin", "0,0,0,0");
					} else {
						docElm.setAttribute("chromemargin", "0,3,3,3");
					}
				}
			}
		}
	}

	static get getCustomThemeMode() {
		const customThemeModePref = pref("Geckium.customtheme.mode").tryGet.int();
		let customThemeMode;

		if (customThemeModePref <= 0)
			customThemeMode = 0;
		else if (customThemeModePref == 1)
			customThemeMode = 1;
		else if (customThemeModePref >= 2)
			customThemeMode = 2;

		return customThemeMode;
	}

	static setCustomThemeModeAttrs() {
		const isChromeTheme = pref("Geckium.chrTheme.status").tryGet.bool();
		if (typeof docElm !== "undefined") {
			docElm.setAttribute("lwtheme-id", pref("extensions.activeThemeID").tryGet.string());

			if (!isChromeTheme) {
				const customThemeModePref = gkLWTheme.getCustomThemeMode;

				switch (customThemeModePref) {
					case 0:
						gkLWTheme.classicWindowFrame.enable();
						break;
					case 1:
						gkLWTheme.classicWindowFrame.disable();
						break;
					case 2:
						gkLWTheme.classicWindowFrame.enable();
						break;
				}
	
				docElm.setAttribute("customthememode", customThemeModePref);
			}
		}
	}
}

function setThemeAttr() {
	if (unsupportedForks[forkName])
		return;

	if (typeof docElm !== "undefined") {
		gkLWTheme.setCustomThemeModeAttrs();

		const isDefaultLWTheme = pref("extensions.activeThemeID").tryGet.string().includes("default-theme");
		const isDefaultLightDarkLWTheme = pref("extensions.activeThemeID").tryGet.string().includes("firefox-compact");
		const isGTKPlus = pref("extensions.activeThemeID").tryGet.string().includes("{9fe1471f-0c20-4756-bb5d-6e857a74cf9e}");
		const isChromeTheme = pref("Geckium.chrTheme.status").tryGet.bool();

		if (!isChromeTheme) {
			if (isDefaultLWTheme || isDefaultLightDarkLWTheme || isGTKPlus) {
				gkLWTheme.classicWindowFrame.disable();
			}
		}
	}
}

window.addEventListener("load", setThemeAttr);
Services.obs.addObserver(setThemeAttr, "lightweight-theme-styling-update");

/* bruni: Automatically apply appearance and theme
		  attributes when it detecs changes in the pref. */
const appearanceObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			applyApperance();
			setThemeAttr();
		}
	},
};
Services.prefs.addObserver(appearanceMap.appearance, appearanceObserver, false);

function changePrivateBadgePos() {
	if (typeof docElm !== "undefined") {
		if (docElm.hasAttribute("privatebrowsingmode")) {
			const privateBrowsingIndicatorWithLabel = document.getElementById("private-browsing-indicator-with-label");
			const titlebarSpacer = document.querySelector(".titlebar-spacer");
	
			insertBefore(privateBrowsingIndicatorWithLabel, titlebarSpacer);
		}
	}
}
window.addEventListener("load", changePrivateBadgePos);

function customThemeColorizeTabGlare() {
	docElm.setAttribute("customthemecolorizetabglare", pref("Geckium.appearance.customThemeColorizeTabGlare").tryGet.bool())
}
const customThemeModeObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			setThemeAttr();
			customThemeColorizeTabGlare();
		}
	},
};
window.addEventListener("load", setThemeAttr);
window.addEventListener("load", customThemeColorizeTabGlare);
Services.prefs.addObserver(
	"Geckium.customtheme.mode",
	customThemeModeObserver,
	false
);
Services.prefs.addObserver(
	"Geckium.appearance.customThemeColorizeTabGlare",
	customThemeModeObserver,
	false
);

function enableMoreGTKIcons() {
	docElm.setAttribute("moregtkicons", pref("Geckium.appearance.moreGTKIcons").tryGet.bool());
}
window.addEventListener("load", enableMoreGTKIcons);
const moreGTKIconsObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			enableMoreGTKIcons();
		}
	},
};
Services.prefs.addObserver(
	"Geckium.appearance.moreGTKIcons",
	moreGTKIconsObserver,
	false
);