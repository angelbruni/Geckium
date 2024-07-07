// ==UserScript==
// @name        Geckium - Theme Manager
// @author      Dominic Hayes
// @loadorder   2
// ==/UserScript==

// Initial variables
let previousSysTheme;
let isThemed;
let isChromeThemed;

// System Theme Management
class gkSysTheme {
    static fallbacks = { //TODO: See if the theme reps should be stored here or in the xhtml for translatability reasons
        /**
         * - theme ID
         *      - fallback ID - determines which System Theme to use when Geckium is themed
         */
        "classic": "classic",
        "gtk": "classic",
        "macos": "macos",
        "macosx": "macosx",
        "chromeos": "chromeos",
        "you": "classic"
    }

    /**
     * getPreferredTheme - Gets the era's preferred System Theme for your platform
     * 
     * @style: The current titlebar's specifications
     */

    static getPreferredTheme(spec) {
        // Return preferred System Theme
        if (AppConstants.platform == "win") {
            return spec.systheme.win;
        } else if (AppConstants.platform == "macosx") {
            return spec.systheme.macos;
        } else if (AppConstants.platform == "linux") {
            return spec.systheme.linux;
        }
        return spec.systheme.win; //Fallback to Windows
	}

    /** getTheme - Gets the currently set System Theme from about:config
     * 
     * @spec: The current titlebar's specifications
     */

    static getTheme(spec) {
        let prefChoice = gkPrefUtils.tryGet("Geckium.appearance.systemTheme").string;
        if (Object.keys(gkSysTheme.fallbacks).includes(prefChoice)) {
            return prefChoice;
        }
        return gkSysTheme.getPreferredTheme(spec);
    }

    /**
     * applyTheme - Applies the current System Theme from getTheme()
     * 
     * @era: The currently selected era - if not specified, sources era from styles's variable
     * @spec: The current titlebar's specifications - if not found or invalid, sources them automatically
     */

    static applyTheme(era, spec) {
        if (!era) {
            era = previousEra; //Reuse the last known era if we're called by a titlebar style-change
        }
        if (!spec || spec == {}) {
            spec = gkTitlebars.getTitlebarSpec(previousTitlebar, era); //Reuse the last known titlebar if we're called by a System Theme preference-change
        }
        // Get theme ID
        let theme = gkSysTheme.getTheme(spec);
        // Apply System Theme
        previousSysTheme = theme; //used in toggleFallbackTheme
        if (isThemed != true) {
            document.documentElement.setAttribute("gksystheme", theme);
        } else {
            gkSysTheme.toggleFallbackTheme(true);
        }
        gkSysTheme.triggerConditionVars();
    }

    /** toggleFallbackTheme - Enables or disables the currently set System Theme's fallback theme
     * 
     * @value: Boolean - enables fallback theme if true, reverts to current System Theme if false
     */

    static toggleFallbackTheme(value) {
        if (!Object.keys(gkSysTheme.fallbacks).includes(previousSysTheme)) {
            throw new Error(previousSysTheme + " is not a valid System Theme");
        }
        if (value == true) {
            document.documentElement.setAttribute("gksystheme", gkSysTheme.fallbacks[previousSysTheme]);
        } else {
            document.documentElement.setAttribute("gksystheme", previousSysTheme);
        }
    }

    /** triggerConditionVars - Triggers each special System Themes' variable refresh calls
     */

    static triggerConditionVars() {
        gkGTK.apply();
    }
}
// NOTE: applyTheme is automatically called by applyTitlebar

// Automatically change the titlebar when the setting changes
const sysThemeObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			gkSysTheme.applyTheme();
		}
	},
};
Services.prefs.addObserver("Geckium.appearance.systemTheme", sysThemeObserver, false);


// System Theme: GTK+
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

    static removeVariables() {
        document.documentElement.style.removeProperty(`--activecaption-shine`);
		document.documentElement.style.removeProperty(`--bgtab-background`);
		document.documentElement.style.removeProperty(`--incognito-active`);
		document.documentElement.style.removeProperty(`--incognito-active-shine`);
		document.documentElement.style.removeProperty(`--incognito-bgtab-background`);
		document.documentElement.style.removeProperty(`--incognito-inactive`);
		document.documentElement.style.removeProperty(`--incognito-inactive-shine`);
		document.documentElement.style.removeProperty(`--inactivecaption-shine`);
		document.documentElement.style.removeProperty(`--gtk-toolbarbutton-icon-fill`);
    }

	static apply() {
		if (previousSysTheme == "gtk") {
			gkGTK.setVariables();
        } else {
            gkGTK.removeVariables();
		}
	}
}
//NOTE: gkGTK.apply is called by gkSysTheme.applyTheme
window.addEventListener("nativethemechange", gkGTK.apply);


// System Theme: Geckium You


// Light and Dark 'theme' checks


// Firefox LWThemes


// Chrome Themes
