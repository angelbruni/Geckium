// ==UserScript==
// @name        Geckium - Appearance
// @author		AngelBruni
// @description	Settings the desired appearance chosen by the user accordingly.
// @loadorder   2
// @include		main
// @include		about:preferences*
// @include		about:addons*
// ==/UserScript==

class gkLWTheme {
	static get getCustomThemeMode() {
		const customThemeModePref = gkPrefUtils.tryGet("Geckium.customtheme.mode").int;
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
		if (typeof document.documentElement !== "undefined") {	
			setTimeout(async () => {
				document.documentElement.setAttribute("lwtheme-id", gkPrefUtils.tryGet("extensions.activeThemeID").string);
				document.documentElement.setAttribute("customthememode", gkLWTheme.getCustomThemeMode);

				const toolbarBgColor = getComputedStyle(document.documentElement).getPropertyValue('--toolbar-bgcolor'); 

				// if color is rgba
				if (toolbarBgColor.includes("rgba")) {
					document.documentElement.setAttribute("toolbar-bgcolor-transparent", true);

					const toolbarBgColorClean = toolbarBgColor.replace("rgba(", "").replace(")", "");
					const toolbarBgColorToArray = toolbarBgColorClean.replace(" ", "").split(",");

					// if alpha is not opaque
					if (toolbarBgColorToArray[3] == 0 || toolbarBgColorToArray[3].includes(".")) {
						document.documentElement.style.setProperty("--gktoolbar-bgcolor", `rgb(${toolbarBgColorToArray[0]}, ${toolbarBgColorToArray[1]}, ${toolbarBgColorToArray[2]})`);
					} else {
						document.documentElement.style.setProperty("--toolbar-bgcolor", `rgb(${toolbarBgColorToArray[0]}, ${toolbarBgColorToArray[1]}, ${toolbarBgColorToArray[2]})`);
					}
				} else {
					document.documentElement.setAttribute("toolbar-bgcolor-transparent", false);

					document.documentElement.style.removeProperty("--gktoolbar-bgcolor");
				}
				
				// await gkChromiumFrame.automatic();
			}, 0);
		}
	}
}

window.addEventListener("load", gkLWTheme.setCustomThemeModeAttrs);
Services.obs.addObserver(gkLWTheme.setCustomThemeModeAttrs, "lightweight-theme-styling-update");


/* bruni: Automatically apply appearance and theme
		  attributes when it detecs changes in the pref. */
const appearanceObserverOld = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			gkLWTheme.setCustomThemeModeAttrs();
		}
	},
};
Services.prefs.addObserver("Geckium.main.overrideStyle", appearanceObserverOld, false);
Services.prefs.addObserver("Geckium.main.style", appearanceObserverOld, false);

function changePrivateBadgePos() {
	if (typeof document.documentElement !== "undefined") {
		if (document.documentElement.hasAttribute("privatebrowsingmode")) {
			const privateBrowsingIndicatorWithLabel = document.getElementById("private-browsing-indicator-with-label");
			const titlebarSpacer = document.querySelector(".titlebar-spacer");
	
			gkInsertElm.before(privateBrowsingIndicatorWithLabel, titlebarSpacer);
		}
	}
}
window.addEventListener("load", changePrivateBadgePos);

function customThemeColorizeTabGlare() {
	document.documentElement.setAttribute("customthemecolorizetabglare", gkPrefUtils.tryGet("Geckium.appearance.customThemeColorizeTabGlare").bool)
}
const customThemeModeObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			gkLWTheme.setCustomThemeModeAttrs();
			customThemeColorizeTabGlare();
		}
	},
};
window.addEventListener("load", gkLWTheme.setCustomThemeModeAttrs);
window.addEventListener("load", customThemeColorizeTabGlare);
Services.prefs.addObserver("Geckium.customtheme.mode", customThemeModeObserver, false);
Services.prefs.addObserver("Geckium.appearance.customThemeColorizeTabGlare", customThemeModeObserver, false);

function lwThemeApplyBackgroundCaptionButtons() {
	document.documentElement.setAttribute("captionbuttonbackground", gkPrefUtils.tryGet("Geckium.lwtheme.captionButtonBackground").bool)
}
const lwThemeApplyBackgroundCaptionButtonsObs = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			lwThemeApplyBackgroundCaptionButtons();
		}
	},
};
window.addEventListener("load", lwThemeApplyBackgroundCaptionButtons);
Services.prefs.addObserver("Geckium.lwtheme.captionButtonBackground", lwThemeApplyBackgroundCaptionButtonsObs, false);

function enableMoreGTKIcons() {
	document.documentElement.setAttribute("moregtkicons", gkPrefUtils.tryGet("Geckium.appearance.moreGTKIcons").bool);
}
window.addEventListener("load", enableMoreGTKIcons);
const moreGTKIconsObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			enableMoreGTKIcons();
		}
	},
};
Services.prefs.addObserver("Geckium.appearance.moreGTKIcons", moreGTKIconsObserver, false);