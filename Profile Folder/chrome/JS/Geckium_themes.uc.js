// ==UserScript==
// @name        Geckium - Theme Manager
// @author      Dominic Hayes
// @loadorder   2
// @include		main
// ==/UserScript==

// Initial variables
let previousSysTheme;
let isThemed;
let isChromeThemed;

// System Theme Management
class gkSysTheme {
     //TODO: See if the theme reps should be stored here or in the xhtml for translatability reasons
    static systhemes = ["classic", "gtk", "macos", "macosx", "chromeos", "you"]

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
        if (gkSysTheme.systhemes.includes(prefChoice)) {
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
            era = gkEras.getEra("Geckium.appearance.choice");
        }
        if (!spec || spec == {}) {
            spec = gkTitlebars.getTitlebarSpec(era);
        }
        // Get theme ID
        let theme = gkSysTheme.getTheme(spec);
        // Apply System Theme
        previousSysTheme = theme;
        document.documentElement.setAttribute("gksystheme", theme);
        // Trigger special System Themes' variable refreshers
        gkGTK.apply();
    }
}
window.addEventListener("load", () => gkSysTheme.applyTheme());
// Automatically change the titlebar when the setting changes
const sysThemeObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			gkSysTheme.applyTheme();
		}
	},
};
Services.prefs.addObserver("Geckium.appearance.choice", sysThemeObserver, false);
Services.prefs.addObserver("Geckium.appearance.titlebarStyle", sysThemeObserver, false);
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
		if (previousSysTheme == "gtk" && isBrowserWindow) {
			gkGTK.setVariables();
        } else {
            gkGTK.removeVariables();
		}
	}

    static enableMoreIcons() {
        document.documentElement.setAttribute("moregtkicons", gkPrefUtils.tryGet("Geckium.appearance.moreGTKIcons").bool);
    }
}
//NOTE: gkGTK.apply is called by gkSysTheme.applyTheme
window.addEventListener("nativethemechange", gkGTK.apply);

window.addEventListener("load", gkGTK.enableMoreGTKIcons);
const GTKIconsObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			gkGTK.enableMoreGTKIcons();
		}
	},
};
Services.prefs.addObserver("Geckium.appearance.moreGTKIcons", GTKIconsObserver, false);


// System Theme: Geckium You



// Firefox LWThemes, and Light and Dark 'theme' checks
class gkLWTheme {
    static palettes = {
        "light": {
            "--lwt-accent-color": "rgb(240, 240, 244)",
            "--lwt-text-color": "rgba(21, 20, 26)"
        },
        "dark": {
            "--lwt-accent-color": "rgb(28, 27, 34)",
            "--lwt-text-color": "rgba(251, 251, 254)"
        }
    }
    static palettesMatch(type) {
        for (const i of Object.keys(gkLWTheme.palettes[type])) {
            if (document.documentElement.style.getPropertyValue(i) != gkLWTheme.palettes[type][i]) {
                return false;
            }
        }
        return true;
    }

    static get isDark() {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            return true;
        }
        let current = gkPrefUtils.tryGet("extensions.activeThemeID").string;
        if (current.startsWith("firefox-compact-dark@") && gkLWTheme.palettesMatch("dark")) {
            return true;
        }
        return false;
    }
    static get pageisSysTheme() {
        if (document.documentElement.style.getPropertyValue("--lwt-accent-color") != "white") {
            return false;
        }
        if (document.documentElement.style.getPropertyValue("--lwt-text-color") != "rgba(0, 0, 0)") {
            return false;
        }
        if (document.documentElement.style.getPropertyValue("--toolbar-bgcolor") != "") {
            return false;
        }
        return true;
    }
    static get isThemed() {
        let current = gkPrefUtils.tryGet("extensions.activeThemeID").string;
        if (current.startsWith("default-theme@")) {
            if (isBrowserWindow && document.documentElement.getAttribute("lwtheme") == "true") {
                if (document.documentElement.getAttribute("lwt-default-theme-in-dark-mode") == "true") {
                    // Seriously, Mozilla??
                    return false; //System Theme - Dark Mode
                } else {
                    return true;
                }
            } else if (!isBrowserWindow && !gkLWTheme.pageisSysTheme) {
                return true;
            } else {
                return false; //System Theme
            }
        } else if (current.startsWith("firefox-compact-light@") && gkLWTheme.palettesMatch("light")) {
            return false; //Light Theme
        } else if (current.startsWith("firefox-compact-dark@") && gkLWTheme.palettesMatch("dark")) {
            return false; //Dark Theme
        } else if (isBrowserWindow && document.documentElement.getAttribute("lwtheme") != "true") {
            return false; //Bugged State - Add-on like Firefox Color was just disabled, causing the LWTheme to be 'disabled'
        }
        return true;
    }

    static setThemeAttrs() {
        // This needs to be delayed as without the delay the theme detection occurs before Firefox's own values update
        //TODO: Call in Chrome Themes class to check if correct theme is used - if not disable Chrome Theme
        setTimeout(async () => {
            if (gkLWTheme.isDark) {
                document.documentElement.setAttribute("gkdark", true);
            } else {
                document.documentElement.removeAttribute("gkdark");
            }
            isThemed = gkLWTheme.isThemed;
            // Delete lwtheme-specific variable (if themed, they get remade)
            document.documentElement.style.removeProperty("--gktoolbar-bgcolor");
            document.documentElement.removeAttribute("toolbar-bgcolor-transparent");
            if (isThemed) {
                document.documentElement.setAttribute("gkthemed", true);
                // lwtheme information TODO: still needed?
                document.documentElement.setAttribute("lwtheme-id", gkPrefUtils.tryGet("extensions.activeThemeID").string);
                // Ensure the toolbar colour is opaque
                const toolbarBgColor = getComputedStyle(document.documentElement).getPropertyValue('--toolbar-bgcolor');
                if (toolbarBgColor.includes("rgba")) { // Remove any transparency values
                    const tbgarray = toolbarBgColor.replace("rgba(", "").replace(")", "").replace(" ", "").split(",");
                    // if the colour is transparent...
                    if (tbgarray[3] == 0 || tbgarray[3].includes(".")) {
                        document.documentElement.setAttribute("toolbar-bgcolor-transparent", true);
                        document.documentElement.style.setProperty("--gktoolbar-bgcolor", `rgb(${tbgarray[0]}, ${tbgarray[1]}, ${tbgarray[2]})`);
                    } else {
                        document.documentElement.style.setProperty("--gktoolbar-bgcolor", `rgb(${tbgarray[0]}, ${tbgarray[1]}, ${tbgarray[2]})`);
                    }
                }
            } else {
                document.documentElement.removeAttribute("gkthemed");
                // Delete lwtheme indicator TODO: still needed?
                document.documentElement.removeAttribute("lwtheme-id");
            }
            // Reapply titlebar to toggle native mode if applicable to
            gkTitlebars.applyTitlebar();
        }, 0);
    }

    // LWTheme Toolbar Background Modes
	static get getCustomThemeMode() {
        let modes = ["fxchrome", "silverfox", "none"]; // TODO: "firefox"
        let prefChoice = gkPrefUtils.tryGet("Geckium.customtheme.mode").string;
        if (modes.includes(prefChoice)) {
            return prefChoice;
        } else {
            return modes[0];
        }
    }
    static customThemeModeChanged() {
		document.documentElement.setAttribute("customthememode", gkLWTheme.getCustomThemeMode);
    }

    // LWTheme Titlebar Button Backgrounds
    static lwThemeApplyBackgroundCaptionButtons() {
        document.documentElement.setAttribute("captionbuttonbackground", gkPrefUtils.tryGet("Geckium.lwtheme.captionButtonBackground").bool)
    }
}
window.addEventListener("load", gkLWTheme.setThemeAttrs);
Services.obs.addObserver(gkLWTheme.setThemeAttrs, "lightweight-theme-styling-update");

window.addEventListener("load", gkLWTheme.customThemeModeChanged);
const lwObserver = {
    observe: function (subject, topic, data) {
        if (topic == "nsPref:changed") {
            gkLWTheme.customThemeModeChanged();
		}
	},
};
Services.prefs.addObserver("Geckium.customtheme.mode", lwObserver, false);

window.addEventListener("load", gkLWTheme.lwThemeApplyBackgroundCaptionButtons);
const lwThemeApplyBackgroundCaptionButtonsObs = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			gkLWTheme.lwThemeApplyBackgroundCaptionButtons();
		}
	},
};
Services.prefs.addObserver("Geckium.lwtheme.captionButtonBackground", lwThemeApplyBackgroundCaptionButtonsObs, false);


// Chrome Themes
