// ==UserScript==
// @name        Geckium - Titlebar Manager
// @author      Dominic Hayes
// @loadorder   3
// ==/UserScript==

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
		
	}

    /**
     * applyTitlebar - Gets and applies the current titlebar from about:config, and applies
     *  the specifications of the titlebar style.
     * 
     * If not found, or the value is invalid, the era's preferred titlebar will be used.
     */

    static applyTitlebar() {

    }
}