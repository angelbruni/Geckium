// ==UserScript==
// @name        Geckium - LWTheme Manager
// @author      Dominic Hayes
// @loadorder   2
// @include		main
// ==/UserScript==

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
    /**
     * palettesMatch - Returns True if the palettes match the expected Mozilla Firefox lwtheme's
     * 
     * type: The ID of the built in lwtheme's values to compare against
     */

    static palettesMatch(type) {
        for (const i of Object.keys(gkLWTheme.palettes[type])) {
            if (document.documentElement.style.getPropertyValue(i) != gkLWTheme.palettes[type][i]) {
                return false;
            }
        }
        return true;
    }

    /**
     * isDark - Returns True if dark mode is in use
     */

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

    /**
     * pageisSysTheme - Returns True if the page is guesstimated to be using System Theme's palette
     */

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

    /**
     * isThemed - Returns True if Firefox is ACTUALLY themed, not the fake news that 'lwtheme' states
     */

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

    /**
     * setThemeAttrs - Expands the Firefox lwtheme palette for CSS usage if one is enabled
     */

    static setThemeAttrs() {
        // This needs to be delayed as without the delay the theme detection occurs before Firefox's own values update
        setTimeout(async () => {
            // Delete lwtheme-specific variable (if themed, they get remade)
            document.documentElement.style.removeProperty("--gktoolbar-bgcolor");
            document.documentElement.removeAttribute("toolbar-bgcolor-transparent");
            // Do not run further if a Chromium Theme is currently used
            if (isChromeThemed) {
                if (gkChrTheme.getEligible) {
                    return;
                }
            }
            isThemed = gkLWTheme.isThemed;
            if (isThemed) {
                document.documentElement.setAttribute("gkthemed", true);
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
            }
            if (isBrowserWindow) {
                // Reapply titlebar to toggle native mode if applicable to
                gkTitlebars.applyTitlebar();
            }
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