// ==UserScript==
// @name        Geckium - Chromium Flags
// @author		AngelBruni
// @description	Chromium Flags in Geckium.
// @loadorder   2
// ==/UserScript==

// Trying something here, wondering if this will cause performance issues...

class chrFlags {

	/**
	 * getFlagsList - Gets a list of the available flags.
	 * 
	 * @vSInt: If not null it gets the list of all available flags for the specified visual style, otherwise, it gets the entire list.
	 */

	static getFlagsList(vSInt) {
		const flags = {
			/**
			 * name		   - Human readable name.
			 * 
			 * description - Flag description.
			 * 
			 * styleints   - Specifies in which styles the flag is available.
			 */

			/*"compact-navigation": {
				name: "Compact Navigation",
				description: "Adds a \"Hide the toolbar\" entry to the tabstrip's context menu. Use this to toggle between always displaying the toolbar (default) and only opening it as a drop down box as needed.",
				styleints: [2],
			},*/
			/*"experimental-new-tab-page": {
				type: "ntp",
				name: "Experimental new tab page",
				description: "Enables an in-development redesign of the new tab page.",
				styleints: [2],
			},*/
			/*"action-box": {
				name: "Action box",
				description: "Enable or disable the \"Action Box\" experimental toolbar UI.",
				styleints: [3, 4],
				values: {
					0: "Default",
					1: "Enabled",
					2: "Disabled",
				}
			},*/
			"search-button-in-omnibox": {
				name: "Enable search button in Omnibox",
				description: "Places a search button in the Omnibox.",
				styleints: [5],
				values: {
					0: "Default",
					1: "Disabled",
					2: "Enabled on search result pages",
					3: "Enabled on search result pages or when input in progress",
					4: "Enabled on all pages",
				},
			},
			"enable-icon-ntp": {
				type: "ntp",
				name: "Enable large icons on the New Tab",
				description: "Enable the experimental New Tab page using large icons.",
				styleints: [5, 6],
			},
			/*"enable-settings-window": {
				name: "Show settings in a window",
				description: "If enabled, Settings will be shown in a dedicated window instead of as a browser tab.",
				styleints: [5, 6],
				values: {
					0: "Default",
					1: "Enabled",
					2: "Disabled",
				}
			},*/
			/*"omnibox-ui-show-suggestion-favicons": {
				name: "Omnibox UI Show Suggestion Favicons",
				description: "Shows favicons instead of generic vector icons for URL suggestions in the Omnibox dropdown.",
				styleints: [6],
				values: {
					0: "Default",
					1: "Enabled",
					2: "Disabled",
				}
			},*/
			"omnibox-ui-vertical-layout": {
				name: "Omnibox UI Vertical Layout",
				description: "Displays Omnibox sugestions in 2 lines - title over origin.",
				styleints: [6],
			},
			"omnibox-ui-vertical-margin": {
				name: "Omnibox UI Vertical Margin",
				description: "Changes the vertical margin in the Omnibox UI.",
				from: 6,
				to: 6,
				values: {
					0: "Default",
					1: "Enabled",
					2: "Enabled 4px vertical margin",
					3: "Enabled 6px vertical margin",
					4: "Enabled 8px vertical margin",
					5: "Enabled 10px vertical margin",
					6: "Enabled 12px vertical margin",
					7: "Enabled 14px vertical margin",
					8: "Disabled",
				}
			},
			"omnibox-ui-swap-title-and-url": {
				name: "Omnibox UI Swap Title and URL",
				description: "In the omnibox dropdown, shows titles before URLs when both are available.",
				styleints: [6],
				values: {
					0: "Default",
					1: "Enabled",
					2: "Disabled",
				}
			},
		}

		if (vSInt) {
            return Object.values(flags).filter(flag => {
                if (flag.styleints) {
                    return flag.styleints.includes(vSInt) || (flag.styleints.length > 1 && vSInt >= flag.styleints[0] && vSInt <= flag.styleints[1]);
                }
                return false;
            });
        } else {
            return flags;
        }
	}
}

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
            prefValue = pref(prefName).tryGet.int();
        } else {
            // Otherwise, consider it as a boolean type
            prefValue = pref(prefName).tryGet.bool();
        }

        // Add attribute to root
        document.documentElement.setAttribute("geckium-crflag-" + key, prefValue);
    }
}

window.addEventListener("load", function () {
    flagsAttrs();
    observePreferences();
});