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
	6: "fifty",
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

function setThemeAttr() {
	if (unsupportedForks[forkName])
		return;

	if (typeof docElm !== "undefined") {
		docElm.setAttribute("lwtheme-id", pref("extensions.activeThemeID").tryGet.string());

		if (pref("extensions.activeThemeID").tryGet.string().includes("default-theme")) {
			docElm.setAttribute("chromemargin", "0,3,3,3");
		} else if (pref("extensions.activeThemeID").tryGet.string().includes("firefox-compact") || pref("extensions.activeThemeID").tryGet.string().includes("#{$gtkplus}")) {
			docElm.setAttribute("chromemargin", "0,3,3,3");

			if (pref("extensions.activeThemeID").tryGet.string().includes("#{$gtkplus}")) {
				docElm.style.removeProperty("--lwt-accent-color")
				docElm.style.removeProperty("--lwt-text-color")
				docElm.style.removeProperty("--lwt-additional-images")
				docElm.style.removeProperty("--lwt-background-alignment")
				docElm.style.removeProperty("--lwt-background-tiling")
			}
		} else {
			let customThemeMode;

			if (pref("Geckium.customtheme.mode").tryGet.int() <= 0) {
				customThemeMode = 0;
				docElm.setAttribute("chromemargin", "0,0,0,0");
			} else if (pref("Geckium.customtheme.mode").tryGet.int() == 1) {
				customThemeMode = 1;
				docElm.setAttribute("chromemargin", "0,0,0,0");
			} else if (pref("Geckium.customtheme.mode").tryGet.int() >= 2) {
				customThemeMode = 2;
				docElm.setAttribute("chromemargin", "0,3,3,3");
			}

			docElm.setAttribute("customthememode", customThemeMode);
		}

		if (navigator.userAgent.includes("Windows NT 10.0") && !window.matchMedia("(-moz-ev-native-controls-patch)").matches) {
			docElm.setAttribute("chromemargin", "0,0,0,0");
		}

		if (!window.matchMedia("(-moz-windows-compositor: 1)").matches) {
			docElm.setAttribute("chromemargin", "0,0,0,0");
		}
	}
}

window.addEventListener("load", setThemeAttr);
Services.obs.addObserver(setThemeAttr, "lightweight-theme-styling-update");

const customThemeModeObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			setThemeAttr();
		}
	},
};
window.addEventListener("load", setThemeAttr);
Services.prefs.addObserver(
	"Geckium.customtheme.mode",
	customThemeModeObserver,
	false
);

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