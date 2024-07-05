// ==UserScript==
// @name        Geckium - Appearance
// @author		AngelBruni
// @description	Settings the desired appearance chosen by the user accordingly.
// @loadorder   2
// @include		main
// @include		about:preferences*
// @include		about:addons*
// ==/UserScript==

class gkVisualStyles {

	/**
	 * getVisualStyles - Gets a list of the available visual styles.
	 * 
	 * @style: If specified, it gets a list of visual styles of only a specific thing.
	 */

	static getVisualStyles(style) {
		const visualStyles = [
			/**
			 * int	  - The number used in the preference.
			 * 
			 * number - The identifier used in the style attribute.
			 * 
			 * styles - "chrome": browser UI
			 * 		    "page":   browser internal pages. Examples: "about:newtab", "about:flags", etc...
			 */

			{
				id: 0,
				int: 1,
				basedOnVersion: "1.0.154.59",
				year: [2008],
				number: "one",
				styles: ["chrome", "page"],
			},
			{
				id: 1,
				int: 3,
				basedOnVersion: "3.0.195.4",
				year: [2009],
				number: "three",
				styles: ["page"],
			},
			{
				id: 2,
				int: 4,
				basedOnVersion: "4.0.223.11",
				year: [2009],
				number: "four",
				styles: ["chrome", "page"],
			},
			{
				id: 3,
				int: 5,
				basedOnVersion: "5.0.375.125",
				year: [2009],
				number: "five",
				styles: ["chrome", "page"],
			},
			{
				id: 4,
				int: 6,
				basedOnVersion: "6.0.453.1",
				year: [2010],
				number: "six",
				styles: ["chrome", "page"],
			},
			{
				id: 5,
				int: 11,
				basedOnVersion: "11.0.696.77",
				year: [2011],
				number: "eleven",
				styles: ["chrome", "page"],
			},
			{
				id: 6,
				int: 21,
				basedOnVersion: "21.0.1180.89",
				year: [2012],
				number: "twentyone",
				styles: ["chrome", "page"],
			},
			{
				id: 7,
				int: 25,
				basedOnVersion: "25.0.1364.84",
				year: [2013],
				number: "twentyfive",
				styles: ["chrome"],
			},
			/*{
				id: 0,
				int: 30,
				basedOnVersion: "33.0.1750.3",
				year: [2013],
				number: "thirty",
				styles: ["chrome"],
			},*/
			{
				id: 8,
				int: 47,
				basedOnVersion: "47.0.2526.111",
				year: [2015],
				number: "fortyseven",
				styles: ["chrome", "page"],
			},
			{
				id: 9,
				int: 68,
				number: "sixtyeight",
				basedOnVersion: "68.0.3440.84",
				year: [2018],
				styles: ["chrome", "page"],
			},
		]

		if (style == "chrome" || style == "page")
			return Object.values(visualStyles).filter(item => item.styles.includes(style));
		else
			return visualStyles;
	}


	/**
	 * setVisualStyle - Sets the specified visual styles.
	 * 
	 * @vSInt: If not null it sets the specified visual styles, otherwise, it default to 0.
	 */

	static setVisualStyle(vSInt) {
		if (!document.URL.includes("about:g")) {
			let prefChoice = gkPrefUtils.tryGet("Geckium.appearance.choice").int;

			if (document.URL == "about:newtab" || document.URL == "about:home" || document.URL == "about:apps") {
				switch (gkPrefUtils.tryGet("Geckium.newTabHome.overrideStyle").bool) {
					case true:
						prefChoice = gkPrefUtils.tryGet("Geckium.newTabHome.style").int;
						break;
					default:
						prefChoice = gkPrefUtils.tryGet("Geckium.appearance.choice").int;
						break;
				}
			} else if (document.URL == "about:preferences" || document.URL == "about:addons") {
				// Prepare setting for forcing the style for these pages individually
				prefChoice = gkPrefUtils.tryGet("Geckium.appearance.choice").int;
			} else {
				switch (gkPrefUtils.tryGet("Geckium.main.overrideStyle").bool) {
					case true:
						prefChoice = gkPrefUtils.tryGet("Geckium.main.style").int;
						break;
					default:
						prefChoice = gkPrefUtils.tryGet("Geckium.appearance.choice").int;
						break;
				}
			}

			if (!prefChoice)
				prefChoice = 0;

			if (document.URL == "chrome://browser/content/browser.xhtml") {
				if (prefChoice == previousChoice) {
					console.log("Choice same as previous choice, ignoring.", prefChoice, previousChoice)
					return;
				} else {
					console.log("Choice not the same as previous choice, continuing.", prefChoice, previousChoice)
				}
			}

			// bruni: We get the first and last available keys so
			//		  we don't hardcode the values in the code.
			const mapKeys = Object.keys(gkVisualStyles.getVisualStyles()).map(Number);
			const firstKey = Math.min(...mapKeys);
			const lastKey = Math.max(...mapKeys);

			// bruni: Let's remove all appearance attributes first.
			const pastAttrs = document.documentElement.getAttributeNames();
			pastAttrs.forEach((attr) => {
				if (attr.startsWith("geckium-") && !attr.includes("chrflag"))
					document.documentElement.removeAttribute(attr);
			});

			// bruni: Let's apply the correct appearance attributes.
			if (typeof vSInt === "number") {
				if (prefChoice > lastKey) {
					vSInt = lastKey;
				} else if (prefChoice < firstKey || prefChoice == null) {
					vSInt = firstKey;
				}
				console.log(vSInt)
			} else {
				vSInt = prefChoice;
			}

			for (let i = 0; i <= vSInt; i++) {
				if (gkVisualStyles.getVisualStyles()[i]) {
					const attr = "geckium-" + gkVisualStyles.getVisualStyles()[i].number;
					document.documentElement.setAttribute(attr, "");
				}
			}

			// bruni: Let's also apply the attribute specific to the
			//		  user choice so we can make unique styles for it.
			document.documentElement.setAttribute("geckium-choice", gkVisualStyles.getVisualStyles()[vSInt].number);

			previousChoice = prefChoice;
			
			if (isBrowserWindow)
				dispatchEvent(appearanceChanged);
		}
	}
}

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


// Provide a way to let the CSS know if the menubar is visible 
class menuBarVisible {
	static toggled(newvalue) {
		if (newvalue == true) {
			document.documentElement.setAttribute("menubarvisible", "");
		} else {
			document.documentElement.removeAttribute("menubarvisible");
		}
	}
	static check() {
		menuBarVisible.toggled(document.getElementById("toolbar-menubar").getAttribute("autohide") == "false");
	}
}
window.addEventListener("load", menuBarVisible.check);
window.addEventListener("toolbarvisibilitychange", menuBarVisible.check);


/* bruni: Automatically apply appearance and theme
		  attributes when it detecs changes in the pref. */
const appearanceObserverOld = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			//gkVisualStyles.setVisualStyle();
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