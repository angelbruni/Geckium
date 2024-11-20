// ==UserScript==
// @name        Geckium - Eras and Misc. Style Settings
// @author      AngelBruni, Dominic Hayes
// @description	Settings the desired appearance chosen by the user accordingly.
// @loadorder   2
// @include		main
// @include		about:preferences*
// @include		about:addons*
// ==/UserScript==

// Windows version check
function isWindows10() {
	if (AppConstants.platform == "win") {
		if (!window.matchMedia("(-moz-platform: windows-win7)").matches && !window.matchMedia("(-moz-platform: windows-win8)").matches
		   && !window.matchMedia("(-moz-platform: windows-winvista)").matches && !window.matchMedia("(-moz-platform: windows-winxp)").matches)
			return true;
	}
	return false;
}
if (isWindows10())
    document.documentElement.setAttribute("isWindows10", true);
if (isNCPatched && isNCPatched != "ev") { // Marble
    document.documentElement.setAttribute("nativeControls", "win10");
} else if (isNCPatched == "ev") { // Native Controls Patch
    // We need a way to differentiate Native Controls Patch from
    // Windows 10 with Native Controls (e.g.: Marble), as Native
    // Controls Patch allows you to use the Windows 10 CSDs still
    // whereas Windows 10 with Native Controls lacks the CSDs,
    // causing issues if not differentiated between in the CSS.
    document.documentElement.setAttribute("nativeControls", "patch");
}

// Initial variables
let previousEra;
const appearanceChanged = new CustomEvent("appearanceChanged");

// Eras and era selection
const eras = {
    /**
     * id  - The number used in the about:config preference
     * 
     *      name - The version presented in Geckium Settings
     * 
     *      basedOnVersion   - The version shown in About
     * 
     *      year - The year shown in Geckium Settings
     * 
     *      number   - The style identifier used in this code to apply the correct stylesheets
     * 
     *      styles   - "chrome": browser UI
     *                 "page":   browser internal pages, including "about:newtab", "about:flags", etc.
     * 
     *      titlebar - Automatic titlebar style preference (if it includes "chrome" style)
     */

    1: {
        name: "1",
        basedOnVersion: "1.0.154.59",
        year: 2008,
        number: "one",
        styles: ["chrome", "page"],
        titlebar: {
            "linux": "linuxog",
            "win": "win",
            "win8": "win",
            "win10": "win",
            "macos": "macosx"
        }
    },
    2: {
        name: "2",
        basedOnVersion: "2.0.172.43",
        year: 2009,
        number: "two",
        styles: ["page"]
    },
    3: {
        name: "3",
        basedOnVersion: "3.0.195.4",
        year: 2009,
        number: "three",
        styles: ["chrome", "page"],
        titlebar: {
            "linux": "linuxog",
            "win": "win",
            "win8": "win",
            "win10": "win",
            "macos": "macosx"
        }
    },
    4: {
        name: "4",
        basedOnVersion: "4.0.223.11",
        year: 2009,
        number: "four",
        styles: ["chrome", "page"],
        titlebar: {
            "linux": "linux",
            "win": "win",
            "win8": "win",
            "win10": "win",
            "macos": "macosx"
        }
    },
    5: {
        name: "5",
        basedOnVersion: "5.0.375.125",
        year: 2010,
        number: "five",
        styles: ["chrome", "page"],
        titlebar: {
            "linux": "linux",
            "win": "win",
            "win8": "win",
            "win10": "win",
            "macos": "macosx"
        }
    },
    6: {
        name: "6.0.453",
        basedOnVersion: "6.0.453.1",
        year: 2010,
        number: "six",
        styles: ["chrome", "page"],
        titlebar: {
            "linux": "linux",
            "win": "win",
            "win8": "win",
            "win10": "win",
            "macos": "macosx"
        }
    },
    11: {
        name: "11",
        basedOnVersion: "11.0.696.77",
        year: 2011,
        number: "eleven",
        styles: ["chrome", "page"],
        titlebar: {
            "linux": "linux",
            "win": "win",
            "win8": "win",
            "win10": "win",
            "macos": "macosx"
        }
    },
    17: {
        name: "17",
        basedOnVersion: "17.0.957.0",
        year: 2011,
        number: "seventeen",
        styles: ["chrome", "page"],
        titlebar: {
            "linux": "linux",
            "win": "win",
            "win8": "win",
            "win10": "win",
            "macos": "macosx"
        }
    },
    21: {
        name: "21",
        basedOnVersion: "21.0.1180.89",
        year: 2012,
        number: "twentyone",
        styles: ["chrome", "page"],
        titlebar: {
            "linux": "linux",
            "win": "win",
            "win8": "win8",
            "win10": "win8",
            "macos": "macosx"
        }
    },
    25: {
        name: "25",
        basedOnVersion: "25.0.1364.84",
        year: 2013,
        number: "twentyfive",
        styles: ["chrome"],
        titlebar: {
            "linux": "linux",
            "win": "win",
            "win8": "win8",
            "win10": "win8",
            "macos": "macosx"
        }
    },
    47: {
        name: "47",
        basedOnVersion: "47.0.2526.111",
        year: 2015,
        number: "fortyseven",
        styles: ["chrome", "page"],
        titlebar: {
            "linux": "linux",
            "win": "win",
            "win8": "win8",
            "win10": "win8nogaps",
            "macos": "macos"
        }
    },
    68: {
        name: "58 (early WIP)",
        basedOnVersion: "58.0.3029.81",
        year: 2017,
        number: "sixtyeight",
        styles: ["chrome", "page"],
        titlebar: {
            "linux": "linux",
            "win": "win",
            "win8": "win8",
            "win10": "win10",
            "macos": "macos"
        }
    }
}
class gkEras {

    /**
     * getEras - Gets a list of available design eras, including their automatic choices.
     * 
     * @style: If specified, only visual styles of a specific thing are returned.
     */

    static getEras(style) {
        if (style == "chrome" || style == "page")
			return Object.keys(eras).reduce(function (filtered, key) {
                if (eras[key]["styles"].includes(style))
                    filtered[key] = eras[key];

                return filtered;
            }, {});
		else
			return eras;
    }

    /**
     * getEra - Gets the currently set era based on 'location'
     * 
     * If not found or invalid, returns Chromium 1 instead.
     */
    
    static getEra(location) {
        let prefChoice = gkPrefUtils.tryGet(location).int;
        if (!prefChoice || !Object.keys(eras).includes(prefChoice.toString()))
            return 1;

        return prefChoice;
    }

    /**
     * getBrowserEra - Gets the currently set era for the browser
     * 
     * If not found or invalid, returns Chromium 1 instead.
     */

    static getBrowserEra() {
        if (gkPrefUtils.tryGet("Geckium.main.overrideStyle").bool == true) {
            let override = gkPrefUtils.tryGet("Geckium.main.style").int;
            if (override && Object.keys(eras).includes(override.toString()))
                return override;
        }
        let prefChoice = gkPrefUtils.tryGet("Geckium.appearance.choice").int;
        if (!prefChoice || !Object.keys(eras).includes(prefChoice.toString()))
            return 1;

        return prefChoice;
    }

    /**
     * getNTPEra - Gets the currently set era for the new tab page
     * 
     * If not found or invalid, returns Chromium 1 instead.
     */

    static getNTPEra() {
        // TEMPORARY: Force 21 on Apps
        if (document.URL == "about:apps")
            return 21;

        if (gkPrefUtils.tryGet("Geckium.newTabHome.overrideStyle").bool == true) {
            let override = gkPrefUtils.tryGet("Geckium.newTabHome.style").int;
            if (override && Object.keys(eras).includes(override.toString()))
                return override;
        }
        let prefChoice = gkPrefUtils.tryGet("Geckium.appearance.choice").int;
        if (!prefChoice || !Object.keys(eras).includes(prefChoice.toString()))
            return 1;
        
        return prefChoice;
    }

    /**
     * applyEra - Applies the selected era to the browser and supported pages
     */

    static applyEra() {
        let prefChoice;
        if (document.URL == "about:newtab" || document.URL == "about:home" || document.URL == "about:apps" || document.URL == "about:privatebrowsing")
            prefChoice = gkEras.getNTPEra();
        else if (document.URL !== "about:gmzoo" && document.URL !== "about:gsplash")
            prefChoice = gkEras.getBrowserEra();

        // Don't continue if acting on the browser and the prior era == the new era
        if (document.URL == "chrome://browser/content/browser.xhtml") {
            if (prefChoice == previousEra)
                return;
        }

        // Add and remove geckium-* values from documentElement based on new era's values
        for (const i of Object.keys(eras)) {
            const attr = "geckium-" + eras[i].number;
            if (i <= prefChoice)
                document.documentElement.setAttribute(attr, "");
            else
                document.documentElement.removeAttribute(attr);
        }

        // bruni: Let's also apply the attribute specific to the
        //		  user choice so we can make unique styles for it.
        document.documentElement.setAttribute("geckium-choice", eras[prefChoice].number);

        previousEra = prefChoice;
        
        if (isBrowserWindow)
            dispatchEvent(appearanceChanged);
    }
}
window.addEventListener("load", gkEras.applyEra);

// Automatically change Geckium eras when the setting changes
const eraObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed")
			gkEras.applyEra();
	},
};
Services.prefs.addObserver("Geckium.appearance.choice", eraObserver, false);
Services.prefs.addObserver("Geckium.main.overrideStyle", eraObserver, false);
Services.prefs.addObserver("Geckium.main.style", eraObserver, false);
Services.prefs.addObserver("Geckium.newTabHome.overrideStyle", eraObserver, false);
Services.prefs.addObserver("Geckium.newTabHome.style", eraObserver, false);

// Privacy Setting
class hideAccountInfo {
    static toggle() {
        if (isBrowserWindow)
            document.documentElement.setAttribute("hideAccountInfo", gkPrefUtils.tryGet("Geckium.privacy.hideAccountInfo").bool);
    }
}
window.addEventListener("load", hideAccountInfo.toggle);

// Automatically toggle when setting changes
const hideAccountInfoObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed")
			hideAccountInfo.toggle();
	},
};
Services.prefs.addObserver("Geckium.privacy.hideAccountInfo", hideAccountInfoObserver, false);


// Provide a way to let the CSS know if the menubar is visible 
class menuBarVisible {
	static toggled(newvalue) {
		if (newvalue == true)
			document.documentElement.setAttribute("menubarvisible", "");
		else
			document.documentElement.removeAttribute("menubarvisible");
	}
	static check() {
        if (isBrowserWindow)
		    menuBarVisible.toggled(document.getElementById("toolbar-menubar").getAttribute("autohide") == "false");
	}
}
window.addEventListener("load", menuBarVisible.check);
window.addEventListener("toolbarvisibilitychange", menuBarVisible.check);


// Custom tab glare colouring
class customTabGlare {
    static toggle() {
        if (isBrowserWindow)
            document.documentElement.setAttribute("customthemecolorizetabglare", gkPrefUtils.tryGet("Geckium.appearance.customThemeColorizeTabGlare").bool);
    }
}
window.addEventListener("load", customTabGlare.toggle);

// Automatically toggle when setting changes
const customTabGlareObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed")
			customTabGlare.toggle();
	},
};
Services.prefs.addObserver("Geckium.appearance.customThemeColorizeTabGlare", customTabGlareObserver, false);

// Custom tab glare colouring
class themeOmniboxInEveryEra {
    static toggle() {
        if (isBrowserWindow)
            document.documentElement.setAttribute("forceColorizeAddressBar", gkPrefUtils.tryGet("Geckium.appearance.forceColorizeAddressBar").bool);
    }
}
window.addEventListener("load", themeOmniboxInEveryEra.toggle);

// Automatically toggle when setting changes
const themeOmniboxInEveryEraObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed")
			themeOmniboxInEveryEra.toggle();
	},
};
Services.prefs.addObserver("Geckium.appearance.forceColorizeAddressBar", themeOmniboxInEveryEraObserver, false);