// ==UserScript==
// @name        Geckium - Titlebar Manager
// @author      Dominic Hayes
// @loadorder   2
// @include		main
// @include		about:addons*
// @include		about:preferences*
// ==/UserScript==

// Initial variables
let previousTabY;

// Titlebar style information
class gkTitlebars {
    static titlebars = {
        /**
         * - titlebar ID
         *      - era ID - determines which settings to use based on currently selected era - each era's settings stack up to the selected era
         */
        "win": {
            /**
             * border   -   ID of the titlebar to apply
             * 
             * buttons  -   ID of the titlebar buttons to apply
             * 
             * hasnativegaps   -    If True, border gaps are added around the browser in native mode
             * 
             * hasgaps   -  If True, border gaps are added around the browser in non-native mode
             * 
             * chromemargin   -  (optional) Override chromemargin's value in non-native mode
             * 
             * native - Whether to enable native titlebars if set to Automatic
             * 
             * popupnative - Whether to enable native titlebars in popup windows if set to Automatic
             * 
             * cannative    -   If False, the titlebar will always be in non-native mode regardless of preferences
             * 
             * tabstyle -    0: Windows
             *                  1: Linux
             *                  2: macOS
             * 
             * systheme -   ID of the System Theme to apply if set to Automatic (based on platform)
             * 
             * systhemefallback -   ID of the System Theme to apply, for fallback values, when in a theme
             */
            1: { //Chromium 1
                border: "win",
                buttons: "win",
                hasnativegaps: true,
                hasgaps: true,
                native: true,
                popupnative: true,
                cannative: true,
                tabstyle: 0,
                systheme: {
                    linux: "classic",
                    win: "classic",
                    macos: "classic"
                }
            }
        },
        "winnogaps": {
            1: {
                border: "win",
                buttons: "win",
                hasnativegaps: false,
                hasgaps: true,
                native: true,
                popupnative: true,
                cannative: true,
                tabstyle: 0,
                systheme: {
                    linux: "classic",
                    win: "classic",
                    macos: "classic"
                }
            }
        },
        "win10": {
            1: {
                border: "win10",
                buttons: "win10",
                hasnativegaps: false,
                hasgaps: false,
                chromemargin: "0,2,2,2",
                native: true,
                popupnative: true,
                cannative: true,
                tabstyle: 0,
                systheme: {
                    linux: "classic",
                    win: "classic",
                    macos: "classic"
                }
            },
            68: {
                native: false,
                nativetheme: false
            }
        },
        "linuxog": {
            1: {
                border: "win",
                buttons: "linuxog",
                hasnativegaps: false,
                hasgaps: true,
                native: false,
                popupnative: true,
                cannative: true,
                tabstyle: 1,
                systheme: {
                    linux: "classic",
                    win: "classic",
                    macos: "classic"
                }
            },
            6: {
                systheme: {
                    linux: "gtk",
                    win: "classic",
                    macos: "macosx"
                }
            },
            47: {
                systheme: {
                    linux: "gtk",
                    win: "classic",
                    macos: "macos"
                }
            },
            68: {
                buttons: "linux"
            }
        },
        "linux": {
            1: {
                border: "win",
                buttons: "linux",
                hasnativegaps: false,
                hasgaps: true,
                native: false,
                popupnative: true,
                cannative: true,
                tabstyle: 1,
                systheme: {
                    linux: "classic",
                    win: "classic",
                    macos: "classic"
                }
            },
            6: {
                systheme: {
                    linux: "gtk",
                    win: "classic",
                    macos: "macosx"
                }
            },
            47: {
                systheme: {
                    linux: "gtk",
                    win: "classic",
                    macos: "macos"
                }
            }
        },
        "macosx": {
            1: {
                border: "macos",
                buttons: "macosx",
                hasnativegaps: false,
                hasgaps: false,
                native: false,
                popupnative: false,
                cannative: false,
                tabstyle: 2,
                systheme: {
                    linux: "macosx",
                    win: "macosx",
                    macos: "macosx"
                }
            },
            68: {
                systheme: {
                    linux: "classic",
                    win: "classic",
                    macos: "classic"
                }
            }
        },
        "macos": {
            1: {
                border: "macos",
                buttons: "macos",
                hasnativegaps: false,
                hasgaps: false,
                native: false,
                popupnative: false,
                cannative: false,
                tabstyle: 2,
                systheme: {
                    linux: "macos",
                    win: "macos",
                    macos: "macos"
                }
            },
            68: {
                systheme: {
                    linux: "classic",
                    win: "classic",
                    macos: "classic"
                }
            }
        },
        "chromiumos": {
            1: {
                border: "chromiumos",
                buttons: "linuxog",
                hasnativegaps: false,
                hasgaps: true,
                native: false,
                popupnative: false,
                cannative: false,
                tabstyle: 1,
                systheme: {
                    linux: "chromiumos",
                    win: "chromiumos",
                    macos: "chromiumos"
                }
            },
            4: {
                buttons: "linux"
            },
            21: {
                buttons: "chromiumos",
                hasnativegaps: false,
                hasgaps: false,
                tabstyle: 0
            },
            68: {
                systheme: {
                    linux: "classic",
                    win: "classic",
                    macos: "classic"
                }
            }
        }
    }

    /**
     * getTitlebarSpec - Collates and returns the chosen titlebar's specifications
     * 
     * @era: Maximum era for titlebar style settings
     * 
     * @style: ID of the titlebar style to use - throws an exception if invalid
     */

    static getTitlebarSpec(era, style) {
        if (!era) {
            era = gkEras.getBrowserEra();
        }
        if (!style) {
            style = gkTitlebars.getTitlebar(era);
        }
        var result = {};
        if (!Object.keys(gkTitlebars.titlebars).includes(style)) {
            throw new Error(style + " is not a valid titlebar style");
        }
        for (const i of Object.keys(gkTitlebars.titlebars[style])) {
            if (i <= era) {
                for (const ii of Object.keys(gkTitlebars.titlebars[style][i])) {
                    result[ii] = gkTitlebars.titlebars[style][i][ii];
                }
            } else {
                break;
            }
        }
        return result;
    }

    /**
     * getPreferredTitlebar - Gets the era's preferred titlebar for your platform
     * 
     * @era: The currently selected era
     */

    static getPreferredTitlebar(era) {
        // Get titlebar preferences from nearest era
        var titlebars = {};
        for (const i of Object.keys(eras)) {
            if (i <= era) {
                if (Object.keys(eras[i]).includes("titlebar")) {
                    titlebars = eras[i].titlebar;
                }
            } else {
                break;
            }
        }
        // Return the appropriate titlebar style
        switch (AppConstants.platform) {
            case "macosx":
                return titlebars.macos;
            case "linux":
                return titlebars.linux;
            default: //Fallback to Windows
                if (isWindows10()) {
                    return titlebars.win10;
                }
            return titlebars.win;
        }
	}

    /** getTitlebar - Gets the currently set titlebar from about:config
     * 
     * If not found, or the value is invalid, the era's preferred titlebar will be used.
     * @era: The currently selected era
     */

    static getTitlebar(era) {
        let prefChoice = gkPrefUtils.tryGet("Geckium.appearance.titlebarStyle").string;
        if (Object.keys(gkTitlebars.titlebars).includes(prefChoice)) {
            return prefChoice;
        }
        return gkTitlebars.getPreferredTitlebar(era);
    }

    /**
     * getNative - Returns True if the titlebar should be native
     * 
     * @spec: Titlebar specification to reference in checks
     * @era: The currently selected era
     * @ispopup: Is the window a popup window?
     */

    static getNative(spec, era, ispopup) {
        // Check if titlebar blocks being native
        if (spec.cannative == false) {
            return false;
        }
        // Check if user blocked native titlebar or is Automatic
        switch (gkPrefUtils.tryGet("Geckium.appearance.titlebarNative").int) {
            case 1: //Enabled
                break;
            case 2: //Disabled
                return false;
            default: //Automatic
                // Check if titlebar is automatically native
                if (!ispopup && spec.native == false) {
                    return false;
                } else if (ispopup && spec.popupnative == false) {
                    return false;
                }
                // If on Windows, check the compositor is turned off (before 117)
                if (AppConstants.platform == "win") {
                    if (window.matchMedia("(-moz-windows-compositor: 0)").matches || window.matchMedia("(-moz-windows-classic)").matches) {
                        return false;
                    }
                } else if (AppConstants.platform == "macosx") {
                    return false; // Always return auto=non-native on macOS
                }
                break;
        }
        if (!ispopup) { // Themes don't affect popups being native
            // If in a theme...
            if (isThemed == true) {
                if (!isChromeThemed) {
                    return false; // Firefox themes are never native
                } else {
                    if (!isChrThemeNative && !gkPrefUtils.tryGet("Geckium.chrTheme.mustAero").bool) {
                        return false; // Current Chrome Theme isn't native
                    }
                    // Check if user blocked native in-theme titlebar
                    switch (gkPrefUtils.tryGet("Geckium.appearance.titlebarThemedNative").int) {
                        case 1: //Enabled
                            break;
                        case 2: //Disabled
                            return false;
                        default: //Automatic
                            // TODO: Return False if the era is MD2+
                            break;
                    }
                }
            }
            // If System Theme is set to GTK+ but Light or Dark is in use...
            let prefChoice = gkPrefUtils.tryGet("extensions.activeThemeID").string;
            if (gkSysTheme.getTheme(spec) == "gtk" && !isChromeThemed && (prefChoice.startsWith("firefox-compact-light@") || prefChoice.startsWith("firefox-compact-dark@"))) {
                return false;
            }
        }
        return true;
    }

    /**
     * getIsPopup - Returns True if the window is a popup window.
     */

    static getIsPopup() {
        let chromehidden = document.documentElement.getAttribute("chromehidden");
        let hidden = chromehidden.split(" ");
        return (hidden.includes("toolbar"));
    }

    /**
     * applyTitlebar - Applies the current titlebar from getTitlebar(), and applies
     *  the specifications of the titlebar style.
     * 
     * @era: The currently selected era - if not specified, sources era from styles's variable
     */

    static applyTitlebar(era) {
        if (!isBrowserWindow) {
            return;
        }
        if (!era) {
            era = gkEras.getBrowserEra();
        }
        // Get spec about the current titlebar
        let titlebar = gkTitlebars.getTitlebar(era);
        let spec = gkTitlebars.getTitlebarSpec(era, titlebar);
        // Redirect to specialised functions if specific window-types
        if (gkTitlebars.getIsPopup()) { //  Popups
            gkTitlebars.applyPopupTitlebar(spec, era);
            return;
        }
        if (gkPrefUtils.tryGet("browser.tabs.inTitlebar").int == 0) { //  Titlebar enabled
            gkTitlebars.applyNativeTitlebar(spec, era);
            return;
        }
        // Apply titlebar and button style
        document.documentElement.setAttribute("gktitstyle", spec.border);
        document.documentElement.setAttribute("gktitbuttons", spec.buttons);
        document.documentElement.setAttribute("gktabstyle", spec.tabstyle);
        // Check native titlebar mode eligibility
        if (gkTitlebars.getNative(spec, era)) {
            // Base Geckium CSS flag
            document.documentElement.setAttribute("gktitnative", "true");
            // chromemargin (border type)
            document.documentElement.setAttribute("chromemargin", "0,2,2,2");
            // Gaps
            document.documentElement.setAttribute("gkhasgaps", spec.hasnativegaps ? "true" : "false");
        } else {
            document.documentElement.setAttribute("gktitnative", "false");
            if (Object.keys(spec).includes("chromemargin")) { // Special case for Windows 10 style
                document.documentElement.setAttribute("chromemargin", spec.chromemargin);
            } else {
                setTimeout(() => {
                    document.documentElement.setAttribute("chromemargin", "0,0,0,0");
                }, 0);
            }
            document.documentElement.setAttribute("gkhasgaps", spec.hasgaps ? "true" : "false");
        }
    }

    /**
     * applyPopupTitlebar - A variation of applyTitlebar for popup windows
     * 
     * @spec: The currently selected titlebar's specifications
     * @era: The currently selected era
     */

    static applyPopupTitlebar(spec, era) {
        let systitlebar = (gkPrefUtils.tryGet("browser.tabs.inTitlebar").int == 0);
        // Apply titlebar and button style
        if (systitlebar) {
            document.documentElement.removeAttribute("gktitstyle");
        } else {
            document.documentElement.setAttribute("gktitstyle", spec.border);
        }
        document.documentElement.setAttribute("gktitbuttons", spec.buttons);
        document.documentElement.setAttribute("gktabstyle", spec.tabstyle);
        // Check native titlebar mode eligibility (or force if Titlebar is enabled)
        if (systitlebar || gkTitlebars.getNative(spec, era, true)) {
            // Base Geckium CSS flag
            document.documentElement.setAttribute("gktitnative", "true");
            // chromemargin (border type)
            document.documentElement.removeAttribute("chromemargin"); //popups DON'T have chromemargin normally
            // Gaps
            document.documentElement.setAttribute("gkhasgaps", "false");
        } else {
            document.documentElement.setAttribute("gktitnative", "false");
            if (Object.keys(spec).includes("chromemargin")) { // Special case for Windows 10 style
                document.documentElement.setAttribute("chromemargin", spec.chromemargin);
            } else {
                setTimeout(() => {
                    document.documentElement.setAttribute("chromemargin", "0,0,0,0");
                }, 0);
            }
            document.documentElement.setAttribute("gkhasgaps", spec.hasgaps ? "true" : "false");
        }
    }

    /**
     * applyNativeTitlebar - A variation of applyTitlebar for windows with titlebar enabled
     * 
     * @spec: The currently selected titlebar's specifications
     * @era: The currently selected era
     */

    static applyNativeTitlebar(spec, era) {
        // Apply titlebar and button style
        document.documentElement.removeAttribute("gktitstyle");
        document.documentElement.setAttribute("gktitbuttons", spec.buttons); // Used for Incognito positioning
        document.documentElement.setAttribute("gktabstyle", spec.tabstyle);
        document.documentElement.setAttribute("gkhasgaps", "false");
        // Native has been locked to Windows only because of the following factors:
        //  On Linux, nobody has ever made use of titlebar mode in their themes - even aerothemeplasma deactivates in this mode
        //  On macOS, there is a permanent titlebar separator that would break the illusion of being native
        //  It is only on Windows that there is none of this separation between the real titlebar and the toolbar.
        document.documentElement.setAttribute("gktitnative", (AppConstants.platform == "win" && gkTitlebars.getNative(spec, era)) ?
            "true" :
            "false"
        );
    }

    /**
     * applyGraphite - Apply Graphite to macOS and Mac OS X titlebutton styles
     */

    static applyGraphite() {
        document.documentElement.setAttribute("gkmacgraphite", gkPrefUtils.tryGet("Geckium.appearance.macIsGraphite").bool);
    }

    /**
     * addShadowDiv - Adds the Div used for the window border inner-shadow (one time use)
     */

    static addShadowDiv() {
        if (!isBrowserWindow) {
            return;
        }
        var result = document.createElement('div');
        result.id = "gkshadow";
        document.body.insertBefore(result, document.body.firstChild);
    }

    /**
     * enableSizeEvents - Registers events for below calls (one time use)
     */

    static enableSizeEvents() {
        if (!isBrowserWindow) {
            return;
        }
        gkTitlebars.tabscrollbox = document.getElementById("tabbrowser-arrowscrollbox");
        new ResizeObserver(gkTitlebars.adjustTabY).observe(document.getElementById("titlebar"));
    }

    /**
     * adjustTabY - Updates the variable used in compatible Chromium Themes
     */

    static tabscrollbox;
    static adjustTabY() {
        var result = gkTitlebars.tabscrollbox.getBoundingClientRect().top + 1;
        if (previousTabY != result) {
            document.documentElement.style.setProperty("--gktabbar-y", `${result}px`);
            previousTabY = previousTabY;
        }
    }
}
window.addEventListener("load", () => gkTitlebars.applyTitlebar());
window.addEventListener("load", gkTitlebars.enableSizeEvents);

// Automatically change the titlebar when the setting changes
const titObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			gkTitlebars.applyTitlebar();
		}
	},
};
Services.prefs.addObserver("Geckium.appearance.choice", titObserver, false);
Services.prefs.addObserver("Geckium.main.overrideStyle", titObserver, false);
Services.prefs.addObserver("Geckium.main.style", titObserver, false);
Services.prefs.addObserver("Geckium.appearance.titlebarStyle", titObserver, false);
Services.prefs.addObserver("Geckium.appearance.titlebarNative", titObserver, false);
Services.prefs.addObserver("Geckium.appearance.titlebarThemedNative", titObserver, false);
Services.prefs.addObserver("browser.tabs.inTitlebar", titObserver, false);
Services.prefs.addObserver("Geckium.chrTheme.mustAero", titObserver, false);

// Automatically change the macOS/Mac OS X titlebutton style when Graphite's toggled
const graphiteObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			gkTitlebars.applyGraphite();
		}
	},
};
window.addEventListener("load", gkTitlebars.applyGraphite);
Services.prefs.addObserver("Geckium.appearance.macIsGraphite", graphiteObserver, false);

// Add div for titlebar border shadow
window.addEventListener("load", gkTitlebars.addShadowDiv);