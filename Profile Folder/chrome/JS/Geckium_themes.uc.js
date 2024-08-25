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
    static systhemes = ["classic", "you", "gtk", "macosx", "macos", "chromiumos"]

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
            era = gkEras.getBrowserEra();
        }
        if (!spec || spec == {}) {
            spec = gkTitlebars.getTitlebarSpec(era);
        }
        // Get theme ID
        let theme = gkSysTheme.getTheme(spec);
        // Apply System Theme
        previousSysTheme = theme;
        document.documentElement.setAttribute("gksystheme", theme);
        if (isBrowserWindow || document.URL == "about:newtab" || document.URL == "about:home" || document.URL == "about:apps") {
            // Trigger special System Themes' variable refreshers
            gkGTK.apply();
            gkYou.apply();
        }
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
Services.prefs.addObserver("Geckium.main.overrideStyle", sysThemeObserver, false);
Services.prefs.addObserver("Geckium.main.style", sysThemeObserver, false);
Services.prefs.addObserver("Geckium.appearance.titlebarStyle", sysThemeObserver, false);
Services.prefs.addObserver("Geckium.appearance.systemTheme", sysThemeObserver, false);


// System Theme: GTK+
class gkGTK {
    /**
     * setVariables - Expands the GTK+ palette to include required extras whenever enabled
     */

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
        var bgtab = ColorUtils.HSLShift(rgb, [-1, 0.5, 0.75]);
		document.documentElement.style.setProperty(
			`--bgtab-background`,
			`rgb(${bgtab})`
		);
        //Background Tab foreground (see https://chromium.googlesource.com/chromium/src.git/+/refs/tags/29.0.1547.57/chrome/browser/ui/libgtk2ui/gtk2_ui.cc#521)
        bgtab = ColorUtils.ColorToHSL(bgtab);
        if (bgtab[2] < 0.5) {
            bgtab[2] = 85;
        } else {
            bgtab[2] = 15;
        }
        if (bgtab[1] < 0.5) {
            bgtab[1] = 70;
        } else {
            bgtab[1] = 30;
        }
        document.documentElement.style.setProperty(
			`--bgtab-foreground`,
			`rgb(${ColorUtils.HSLToColor(bgtab)})`
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
        //Post-6.0 toolbar icon fill colour
        colorDiv.style.backgroundColor="-moz-dialogtext";
		var iconfill = window.getComputedStyle(colorDiv)["background-color"].match(/\d+/g);
        iconfill = ColorUtils.ColorToHSL(iconfill);
        if (iconfill[1] > 10) {
            // Use the toolbar colour if it isn't a shade of grey
            //  NOTE: This isn't official behaviour, nor is the light shade on dark mode
            //   - I just thought it would be better to have these additions in place alongside.
            document.documentElement.style.setProperty(
				`--gtk-toolbarbutton-new-icon-fill`,
				`-moz-dialogtext`
			);
        } else {
            // Use a hardcoded grey depending on lightness
            if (iconfill[2] >= 50) {
                document.documentElement.style.setProperty(
                    `--gtk-toolbarbutton-new-icon-fill`,
                    `rgb(204, 204, 204)`
                );
            } else {
                document.documentElement.style.setProperty(
                    `--gtk-toolbarbutton-new-icon-fill`,
                    `rgb(111, 111, 111)`
                );
            }
        }
		document.head.removeChild(colorDiv);
	}

    /**
     * removeVariables - Removes GTK+'s extra palette values
     */

    static removeVariables() {
        document.documentElement.style.removeProperty(`--activecaption-shine`);
		document.documentElement.style.removeProperty(`--bgtab-background`);
		document.documentElement.style.removeProperty(`--bgtab-foreground`);
		document.documentElement.style.removeProperty(`--incognito-active`);
		document.documentElement.style.removeProperty(`--incognito-active-shine`);
		document.documentElement.style.removeProperty(`--incognito-bgtab-background`);
		document.documentElement.style.removeProperty(`--incognito-inactive`);
		document.documentElement.style.removeProperty(`--incognito-inactive-shine`);
		document.documentElement.style.removeProperty(`--inactivecaption-shine`);
		document.documentElement.style.removeProperty(`--gtk-toolbarbutton-icon-fill`);
		document.documentElement.style.removeProperty(`--gtk-toolbarbutton-new-icon-fill`);
    }

    /**
     * apply - Calls one of the above functions based on GTK+ being the current System Theme
     */

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

window.addEventListener("load", gkGTK.enableMoreIcons);
const GTKIconsObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			gkGTK.enableMoreIcons();
		}
	},
};
Services.prefs.addObserver("Geckium.appearance.moreGTKIcons", GTKIconsObserver, false);


// System Theme: Geckium You
const { NTRegistry } = ChromeUtils.importESModule("chrome://modules/content/ntRegistry.sys.mjs");
class gkYou {
    /**
     * getBaseColor - Gets the currently set colour for Geckium You
     */

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
                var hex = gkPrefUtils.tryGet("Geckium.you.color").string;
                if (hex.charAt(0) != "#") {
                    return ""; //Invalid value
                }
                if (hex.length == 4) { //#RGB -> #RRGGBB
                    r = hex.charAt(1);
                    g = hex.charAt(2);
                    b = hex.charAt(3);
                    hex = `#${r}${r}${g}${g}${b}${b}`
                } else if (hex.length != 7) {
                    return ""; //Invalid value
                }
                try {
                    return `rgb(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)})`;
                } catch {
                    return ""; //Despite everything, it still failed
                }
            case "aerocolor":
                if (AppConstants.platform != "win" || isWindows10()) {
                    gkPrefUtils.set("Geckium.you.mode").string("accent");
                    return gkYou.getBaseColor();
                }
                var accentColor = NTRegistry.getRegKeyValue("HKCU", "SOFTWARE\\Microsoft\\Windows\\DWM", "ColorizationColor", "DWORD");
                var r = (accentColor >> 16) & 0xFF,
                    g = (accentColor >> 8) & 0xFF,
                    b = accentColor & 0xFF;
                return `rgb(${r}, ${g}, ${b})`;
            case "awm":
                if (AppConstants.platform != "win" || !isWindows10()) {
                    gkPrefUtils.set("Geckium.you.mode").string("accent");
                    return gkYou.getBaseColor();
                }
                var r = getRegKeyValue("HKLM", "SOFTWARE\\AWM", "Window_ColorRActive", "DWORD"),
                    g = getRegKeyValue("HKLM", "SOFTWARE\\AWM", "Window_ColorGActive", "DWORD"),
                    b = getRegKeyValue("HKLM", "SOFTWARE\\AWM", "Window_ColorBActive", "DWORD");
                return `rgb(${r}, ${g}, ${b})`;
            default:
                return ""; // grey
        }
    }

    /**
     * setVariables - Adds Geckium You's palette for Geckium CSS usage
     */

	static setVariables(color) {
		//Base accent colour
		let rgb = color.match(/\d+/g);
        let hsl = ColorUtils.ColorToHSL(rgb);
        let lightl = hsl[2];
        let darkl = hsl[2];
        // Ensure colour is within minimum or maximum brightness
        // FIXME: Someone think up a better algorithm for this, preferably one that accounts for SATURATION
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

    /**
     * removeVariables - Removes Geckium You's palette
     */

    static removeVariables() {
        document.documentElement.style.removeProperty(`--you-h`);
        document.documentElement.style.removeProperty(`--you-s`);
        document.documentElement.style.removeProperty(`--you-l`);
        document.documentElement.style.removeProperty(`--you-l-dark`);
    }

	static apply() {
        gkYou.removeVariables();
        let era = gkEras.getBrowserEra();
        let color;
		if (previousSysTheme == "you" && isBrowserWindow && (era < 52 || era > 68)) {
            try {
                color = gkYou.getBaseColor(); // NOTE: Grey's palette is in systhemes
            } catch (error) {
                console.error("Failed to source colour for Geckium You:", error);
            }
            if (color != "") {
                gkYou.setVariables(color);
            }
        }
	}
}
//NOTE: gkYou.apply is called by gkSysTheme.applyTheme
window.addEventListener("nativethemechange", gkYou.apply);
Services.obs.addObserver(gkYou.apply, "lightweight-theme-styling-update");

const YouObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			gkYou.apply();
		}
	},
};
Services.prefs.addObserver("Geckium.you.mode", YouObserver, false);
Services.prefs.addObserver("Geckium.you.color", YouObserver, false);