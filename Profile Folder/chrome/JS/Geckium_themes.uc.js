// ==UserScript==
// @name        Geckium - Theme Manager
// @author      Dominic Hayes
// @loadorder   2
// ==/UserScript==

// Initial variables
let previousSysTheme;

// Titlebar style information
class gkSysTheme {
    static fallbacks = {
        /**
         * - theme ID
         *      - fallback ID - determines which System Theme to use when Geckium is themed
         */
        "classic": "classic",
        "gtk": "classic",
        "macos": "macos",
        "macosx": "macosx",
        "chromeos": "chromeos"
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
        document.documentElement.setAttribute("gksystheme", theme);

        // TODO: Check if themed, etc. to use fallback value instead
        previousSysTheme = theme;
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