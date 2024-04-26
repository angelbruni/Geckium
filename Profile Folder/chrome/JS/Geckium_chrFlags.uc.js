// ==UserScript==
// @name        Geckium - Chromium Flags
// @author		AngelBruni
// @description	Chromium Flags in Geckium.
// @loadorder   2
// ==/UserScript==

// Trying something here, wondering if this will cause performance issues...

const { chrFlags } = ChromeUtils.importESModule("chrome://modules/content/GeckiumChromiumFlags.sys.mjs");

function observePreferences() {
    const prefBranch = Services.prefs;

    const observer = {
        observe: function (subject, topic, data) {
            if (topic == "nsPref:changed") {
                flagsAttrs();
            }
        },
    };

    for (const key in chrFlags.getFlagsList()) {
        const prefName = "Geckium.crflag." + key.replace(/-/g, ".");
        prefBranch.addObserver(prefName, observer, false);
    }
}

function flagsAttrs() {
    const flagsList = chrFlags.getFlagsList();

    for (const key in flagsList) {
        const prefName = "Geckium.crflag." + key.replace(/-/g, ".");
        const flag = flagsList[key];
        
        let prefValue;
        if (flag.values && Object.keys(flag.values).length > 1) {
            // If the flag has multiple values, consider it as an integer type
            prefValue = gkPrefUtils.tryGet(prefName).int;
        } else {
            // Otherwise, consider it as a boolean type
            prefValue = gkPrefUtils.tryGet(prefName).bool;
        }

        // Add attribute to root
        document.documentElement.setAttribute("geckium-crflag-" + key, prefValue);
    }
}

window.addEventListener("load", function () {
    flagsAttrs();
    observePreferences();
});