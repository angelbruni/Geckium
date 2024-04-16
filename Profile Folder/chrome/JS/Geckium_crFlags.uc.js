// ==UserScript==
// @name        Geckium - Chromium Flags
// @author		AngelBruni
// @description	Chromium Flags in Geckium.
// @loadorder   2
// ==/UserScript==

// Trying something here, wondering if this will cause performance issues...

const crFlags = {
    //"compact-navigation": "bool",
    //"experimental-new-tab-page": "bool",
    //"action-box": "bool",
    "search-button-in-omnibox": "int",
    "enable-icon-ntp": "bool",
    //"enable-settings-window": "bool",
    //"omnibox-ui-show-suggestion-favicons": "bool",
    "omnibox-ui-vertical-layout": "bool",
    "omnibox-ui-vertical-margin": "int",
    "omnibox-ui-swap-title-and-url": "int",
};

function observePreferences() {
    const prefBranch = Services.prefs;

    const observer = {
        observe: function (subject, topic, data) {
            if (topic == "nsPref:changed") {
                flagsAttrs();
            }
        },
    };

    for (const key in crFlags) {
        const prefName = "Geckium.crflag." + key.replace(/-/g, ".");
        prefBranch.addObserver(prefName, observer, false);
    }
}

function flagsAttrs() {
    for (const key in crFlags) {
        const prefName = "Geckium.crflag." + key.replace(/-/g, ".");
        const valueType = crFlags[key];

        let prefValue;
        if (valueType === "bool") {
            prefValue = pref(prefName).tryGet.bool();
        } else if (valueType === "int") {
            prefValue = pref(prefName).tryGet.int();
        }

        // Add attribute to root
        document.documentElement.setAttribute("geckium-crflag-" + key, prefValue);
    }
}

window.addEventListener("load", function () {
    flagsAttrs();
    observePreferences();
});