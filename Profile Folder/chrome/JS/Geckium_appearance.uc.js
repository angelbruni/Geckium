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

// GTK+
class gkGTK {
	static setVariables() {
		var colorDiv = document.createElement("div");
		document.head.appendChild(colorDiv);
		//ActiveCaption
		colorDiv.style.backgroundColor="ActiveCaption";
		var rgb = window.getComputedStyle(colorDiv)["background-color"].match(/\d+/g);
		document.documentElement.style.setProperty(
			`--activecaption-shine`,
			`rgb(${ColorUtils.HSLShift(rgb, [-1, -1, 0.58])})`
		);
		//Background Tab background
		document.documentElement.style.setProperty(
			`--bgtab-background`,
			`rgb(${ColorUtils.HSLShift(rgb, [-1, 0.5, 0.75])})`
		);
		//Incognito (active)
		var rgbb = ColorUtils.HSLShift(rgb, [-1, 0.2, 0.35]);
		document.documentElement.style.setProperty(
			`--incognito-active`,
			`rgb(${rgbb})`
		);
		document.documentElement.style.setProperty(
			`--incognito-active-shine`,
			`rgb(${ColorUtils.HSLShift(rgbb, [-1, -1, 0.58])})`
		);
		//Background Tab background (Incognito)
		document.documentElement.style.setProperty(
			`--incognito-bgtab-background`,
			`rgb(${ColorUtils.HSLShift(rgbb, [-1, 0.5, 0.75])})`
		);
		//Incognito (inactive)
		rgb = ColorUtils.HSLShift(rgb, [-1, 0.3, 0.6]);
		document.documentElement.style.setProperty(
			`--incognito-inactive`,
			`rgb(${rgb})`
		);
		document.documentElement.style.setProperty(
			`--incognito-inactive-shine`,
			`rgb(${ColorUtils.HSLShift(rgb, [-1, -1, 0.58])})`
		);
		//InactiveCaption
		colorDiv.style.backgroundColor="InactiveCaption";
		rgb = window.getComputedStyle(colorDiv)["background-color"].match(/\d+/g);
		document.documentElement.style.setProperty(
			`--inactivecaption-shine`,
			`rgb(${ColorUtils.HSLShift(rgb, [-1, -1, 0.58])})`
		);
		//Pre-6.0 toolbar icon fill colour
		colorDiv.style.backgroundColor="AccentColor";
		rgb = window.getComputedStyle(colorDiv)["background-color"].match(/\d+/g);
		colorDiv.style.backgroundColor="-moz-dialog";
		rgbb = window.getComputedStyle(colorDiv)["background-color"].match(/\d+/g);
		if (Math.abs(ColorUtils.ColorToHSL(rgb)[2] - ColorUtils.ColorToHSL(rgbb)[2]) < 0.1) {
			// Not enough contrast - use foreground
			document.documentElement.style.setProperty(
				`--gtk-toolbarbutton-icon-fill`,
				`-moz-dialogtext`
			);
		} else {
			document.documentElement.style.setProperty(
				`--gtk-toolbarbutton-icon-fill`,
				`AccentColor`
			);
		}
		document.head.removeChild(colorDiv);
	}

	static apply() {
		if (isBrowserWindow) {
			//TODO: only apply if on GTK+, otherwise remove variables
			gkGTK.setVariables();
		}
	}
}
window.addEventListener("load", gkGTK.apply);
window.addEventListener("nativethemechange", gkGTK.apply);


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