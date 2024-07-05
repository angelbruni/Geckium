// ==UserScript==
// @name        Geckium - Titlebar Manager
// @author      Dominic Hayes
// @loadorder   2
// @include		main
// ==/UserScript==

// Initial variables
let previousTitlebar;

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
             * nativetheme   -  Same as native, but when in compatible Chromium Themes (requires native == true)
             * 
             * cannative    -   If False, the titlebar will always be in non-native mode regardless of preferences
             * 
             * newtabstyle -    0: Windows
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
                nativetheme: true,
                cannative: true,
                newtabstyle: 0,
                systheme: {
                    linux: "classic",
                    win: "classic",
                    macos: "classic"
                },
                systhemefallback: {
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
                nativetheme: true,
                cannative: true,
                newtabstyle: 0,
                systheme: {
                    linux: "classic",
                    win: "classic",
                    macos: "classic"
                },
                systhemefallback: {
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
                nativetheme: true,
                cannative: true,
                newtabstyle: 0,
                systheme: {
                    linux: "classic",
                    win: "classic",
                    macos: "classic"
                },
                systhemefallback: {
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
                nativetheme: false,
                cannative: true,
                newtabstyle: 1,
                systheme: {
                    linux: "classic",
                    win: "classic",
                    macos: "classic"
                },
                systhemefallback: {
                    linux: "classic",
                    win: "classic",
                    macos: "classic"
                }
            },
            11: {
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
                nativetheme: false,
                cannative: true,
                newtabstyle: 1,
                systheme: {
                    linux: "classic",
                    win: "classic",
                    macos: "classic"
                },
                systhemefallback: {
                    linux: "classic",
                    win: "classic",
                    macos: "classic"
                }
            },
            11: {
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
                nativetheme: false,
                cannative: false,
                newtabstyle: 2,
                systheme: {
                    linux: "macosx",
                    win: "macosx",
                    macos: "macosx"
                },
                systhemefallback: {
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
                },
                systhemefallback: {
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
                nativetheme: false,
                cannative: false,
                newtabstyle: 2,
                systheme: {
                    linux: "macos",
                    win: "macos",
                    macos: "macos"
                },
                systhemefallback: {
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
                },
                systhemefallback: {
                    linux: "classic",
                    win: "classic",
                    macos: "classic"
                }
            }
        },
        "chromeos": {
            1: {
                border: "chromeos",
                buttons: "linuxog",
                hasnativegaps: false,
                hasgaps: true,
                native: false,
                nativetheme: false,
                cannative: true,
                newtabstyle: 1,
                systheme: {
                    linux: "chromeos",
                    win: "chromeos",
                    macos: "chromeos"
                },
                systhemefallback: {
                    linux: "chromeos",
                    win: "chromeos",
                    macos: "chromeos"
                }
            },
            4: {
                buttons: "linux"
            },
            21: {
                buttons: "chromeos",
                hasnativegaps: false,
                hasgaps: false,
                cannative: false,
                newtabstyle: 0
            },
            68: {
                systheme: {
                    linux: "classic",
                    win: "classic",
                    macos: "classic"
                },
                systhemefallback: {
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
     * @style: ID of the titlebar style to use - throws an exception if invalid
     * 
     * @era: Maximum era for titlebar style settings
     */

    static getTitlebarSpec(style, era) {
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
     * @era: The currently selected era - if invalid, defaults to 1
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
        if (AppConstants.platform == "win") {
            if (window.matchMedia("(-moz-platform: windows-win10)").matches) {
                return titlebars.win10;
            }
            return titlebars.win;
        } else if (AppConstants.platform == "macosx") {
            return titlebars.macos;
        } else if (AppConstants.platform == "linux") {
            return titlebars.linux;
        }
        return titlebars.win; //Fallback to Windows
	}

    /** getTitlebar - Gets the currently set titlebar from about:config
     * 
     * If not found, or the value is invalid, the era's preferred titlebar will be used.
     */

    static getTitlebar(era) {
        let prefChoice = gkPrefUtils.tryGet("Geckium.appearance.titlebarStyle").string;
        if (Object.keys(gkTitlebars.titlebars).includes(prefChoice)) {
            return prefChoice;
        }
        return gkTitlebars.getPreferredTitlebar(era);
    }

    /**
     * getCanNative - Returns True if the titlebar can be native
     */

    static getCanNative(spec, era) {
        return false; //TODO

        /**
         * 1. Check if the titlebar style blocks going native
         *  - False if yes
         * 2. Check if in a theme or not - themes
         *  - False if a Firefox theme
         * 2. Check if in a Chromium Theme if yes
         * 3. Check if the Chromium Theme is eligible for Native
         *  - False if nativetheme is False, and the user's setting isn't True
         *  - False if theme isn't eligible for Native
         * 4. If unthemed, check if theme defaults to not being native
         *  - False if yes, unless user has overridden to True
         * 5. If unthemed, check if user has overridden to False
         *  - False if yes
         * Return True if all checks have been exhausted
         */
    }

    /**
     * applyTitlebar - Applies the current titlebar from getTitlebar(), and applies
     *  the specifications of the titlebar style.
     * 
     * If not found, or the value is invalid, the era's preferred titlebar will be used.
     */

    static applyTitlebar(era) {
        //TODO: Check for titlebar being enabled and if so always use the special titlebar style and chromemargin instead, though still apply the correct System Theme auto

        // Get spec about the current titlebar
        if (!era) {
            era = previousEra; //Reuse the last known era if we're called by a titlebar style-change
        }
        let titlebar = gkTitlebars.getTitlebar(era);
        let spec = gkTitlebars.getTitlebarSpec(titlebar, era);
        // Apply titlebar and button style
        document.documentElement.setAttribute("gktitstyle", spec.border);
        document.documentElement.setAttribute("gktitbuttons", spec.buttons);
        // Check native titlebar mode eligibility
        if (gkTitlebars.getCanNative(spec, era)) {
            // Base Geckium CSS flag
            document.documentElement.setAttribute("gktitnative", "true");
            // chromemargin (border type)
            document.documentElement.setAttribute("chromemargin", "0,2,2,2")
            // Gaps
            if (AppConstants.platform == "linux") {
                document.documentElement.setAttribute("gkhasgaps", "false"); // Linux Native CANNOT have gaps
            } else {
                document.documentElement.setAttribute("gkhasgaps", spec.hasnativegaps ? "true" : "false");
            }
        } else {
            document.documentElement.setAttribute("gktitnative", "false");
            if (!Object.keys(spec).includes("chromemargin")) { // Special case for Windows 10 style
                document.documentElement.setAttribute("chromemargin", "0,0,0,0");
            } else {
                document.documentElement.setAttribute("chromemargin", spec.chromemargin);
            }
            document.documentElement.setAttribute("gkhasgaps", spec.hasgaps ? "true" : "false");
        }


        previousTitlebar = titlebar;



        // Workflow:
        //- Era is set in the browser on load
        //1. Titlebar is set on load
        //2. Titlebar call tells system theme loader to set System Theme
        document.documentElement.setAttribute("gksystheme", "gtk"); //TEMP
        //- New call in themes: getPreferredSystemTheme
        //1. Gets titlebar using getTitlebar()
        //2. Gets the titlebar spec
        //3. Returns value corresponding to the system theme used
    }
}
// NOTE: applyTitlebar is automatically called by applyEra

// Automatically change the titlebar when the setting changes
const titObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			gkTitlebars.applyTitlebar();
		}
	},
};
Services.prefs.addObserver("Geckium.appearance.titlebarStyle", titObserver, false);