// ==UserScript==
// @name        Geckium - Theme Manager (Misc.)
// @author      Dominic Hayes
// @loadorder   2
// @include		main
// ==/UserScript==

// Initial variables
let isThemed;
let previousSysTheme;

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
        gkYou.apply();
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
class gkYou {
    static getBaseColor() {
        switch (gkPrefUtils.tryGet("Geckium.you.mode").string) {
            case "accent":
                // Use a div to get the exact accent colour value
                var colorDiv = document.createElement("div");
                colorDiv.style.backgroundColor="AccentColor";
		        document.head.appendChild(colorDiv);
                var rgb = window.getComputedStyle(colorDiv)["background-color"];
                document.head.removeChild(colorDiv);
                return rgb;
            case "custom":
                return "rgb(255, 0, 0)"; // TODO
            case "aerocolor":
                if (AppConstants.platform != "win" || (!window.matchMedia("(-moz-platform: windows-win7)").matches && !window.matchMedia("(-moz-platform: windows-win8)").matches)) {
                    gkPrefUtils.set("Geckium.you.mode").string("accent");
                    return gkYou.getBaseColor();
                }
                return "rgb(0, 255, 0)"; // TODO
            case "awm":
                if (AppConstants.platform != "win" || (!window.matchMedia("(-moz-platform: windows-win7)").matches && !window.matchMedia("(-moz-platform: windows-win8)").matches)) {
                    gkPrefUtils.set("Geckium.you.mode").string("accent");
                    return gkYou.getBaseColor();
                }
                return "rgb(0, 0, 255)"; // TODO
            default:
                return ""; // grey
        }
    }

	static setVariables(color) {
		//Base accent colour
		let rgb = color.match(/\d+/g);
        let hsl = ColorUtils.ColorToHSL(rgb);
        let lightl = hsl[2];
        let darkl = hsl[2];
        // Ensure colour is within minimum or maximum brightness
        if (hsl[2] > 62) {
            lightl = 62;
        } else if (hsl[2] < 28) {
            lightl = 28;
        }
        if (hsl[2] > 80) {
            darkl = 80;
        } else if (hsl[2] < 52) {
            darkl = 52;
        }
        document.documentElement.style.setProperty("--you-h", hsl[0]);
        document.documentElement.style.setProperty("--you-s", `${hsl[1]}%`);
        document.documentElement.style.setProperty("--you-l", `${lightl}%`);
        document.documentElement.style.setProperty("--you-l-dark", `${darkl}%`);
        // TODO: This space for all the extra palettes in MD2+
	}

    static removeVariables() {
        document.documentElement.style.removeProperty(`--you-h`);
        document.documentElement.style.removeProperty(`--you-s`);
        document.documentElement.style.removeProperty(`--you-l`);
        document.documentElement.style.removeProperty(`--you-l-dark`);
    }

	static apply() {
        let era = gkEras.getEra();
        let color = gkYou.getBaseColor(); // NOTE: Grey's palette is in systhemes
		if (previousSysTheme == "you" && isBrowserWindow && (era < 52 || era > 68) && color != "") {
			gkYou.setVariables(color);
        } else {
            gkYou.removeVariables();
		}
	}
}
//NOTE: gkYou.apply is called by gkSysTheme.applyTheme
window.addEventListener("nativethemechange", gkYou.apply);

const YouObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			gkYou.apply();
		}
	},
};
Services.prefs.addObserver("Geckium.you.mode", YouObserver, false);
Services.prefs.addObserver("Geckium.you.color", YouObserver, false);