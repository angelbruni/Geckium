const flagsBundle = Services.strings.createBundle("chrome://geckium/locale/properties/flags.properties");

const experiments = {
	"ntp-wide-chromium": {
		type: "ntp",
		name: "Wide Chromium",
		description: "Makes the Chromium logo in the 1.0 new tab page a right chonker (oh lawd he comin'), as seen in Chromium 0.2. Requires Chromium branding to take effect.",
		from: 1,
		to: 1
	},
	"linux-pre-alpha-titlebar": {
		name: "Linux Pre-Alpha Titlebar",
		description: "Removes the Google logo from the Windows titlebar style, emulating how titlebars looked on Pre-Alpha builds of Chromium on Linux. Requires the titlebar style being set to Windows to take effect, and overrides the logo on other titlebar styles experiment.",
		from: 1,
		to: 3
	},
	"glen-is-close-button": {
		name: "Linux Titlebar Buttons Prototype 1",
		description: "Replaces the close button with a picture of Glen Murphy's head, as seen in Chromium 3.0 Alpha on Linux, now with its passive aggressive purpose satisfied. Glen designed the scrapped Linux (Alpha) titlebar buttons design for Chromium, and his face requires the titlebar style being set to Windows to take effect.",
		from: 1,
		to: 3
	},
	"other-platforms-watermark": {
		name: "Google logo on other platforms' titlebars",
		description: "Show the Google logo in other platforms' titlebar styles, rather than only on the Windows titlebar styles. Requires Google Chrome branding to take effect.",
		from: 1,
		to: 4
	},
	/*"compact-navigation": {
		name: "Compact Navigation",
		description: "Adds a \"Hide the toolbar\" entry to the tabstrip's context menu. Use this to toggle between always displaying the toolbar (default) and only opening it as a drop down box as needed.",
		from: 4,
		to: 4,
	},*/
	/*"experimental-new-tab-page": {
		type: "ntp",
		name: "Experimental new tab page",
		description: "Enables an in-development redesign of the new tab page.",
		from: 4,
		to: 4,
	},*/
	/*"action-box": {
		name: "Action box",
		description: "Enable or disable the \"Action Box\" experimental toolbar UI.",
		from: 5,
		to: 6,
		values: {
			0: "Default",
			1: "Enabled",
			2: "Disabled",
		}
	},*/
	"search-button-in-omnibox": {
		name: "Enable search button in Omnibox",
		description: "Places a search button in the Omnibox.",
		from: 37, // Needs to be 33+ only.
		to: 47,
		values: {
			0: "Default",
			1: "Disabled",
			2: "Enabled on search result pages",
			3: "Enabled on search result pages or when input in progress",
			4: "Enabled on all pages",
		}
	},
	"enable-icon-ntp": {
		type: "ntp",
		name: "Enable large icons on the New Tab",
		description: "Enable the experimental New Tab page using large icons.",
		from: 47,
		to: 47,
	},
	/*"enable-settings-window": {
		name: "Show settings in a window",
		description: "If enabled, Settings will be shown in a dedicated window instead of as a browser tab.",
		from: 11,
		to: 21,
		values: {
			0: "Default",
			1: "Enabled",
			2: "Disabled",
		}
	},*/
	/*"omnibox-ui-show-suggestion-favicons": {
		name: "Omnibox UI Show Suggestion Favicons",
		description: "Shows favicons instead of generic vector icons for URL suggestions in the Omnibox dropdown.",
		from: 21,
		to: 21,
		values: {
			0: "Default",
			1: "Enabled",
			2: "Disabled",
		}
	},*/
	"omnibox-ui-vertical-layout": {
		name: "Omnibox UI Vertical Layout",
		description: "Displays Omnibox sugestions in 2 lines - title over origin.",
		from: 68,
		to: 68,
	},
	"omnibox-ui-vertical-margin": {
		name: "Omnibox UI Vertical Margin",
		description: "Changes the vertical margin in the Omnibox UI.",
		from: 68,
		to: 68,
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
		from: 68,
		to: 68,
		values: {
			0: "Default",
			1: "Enabled",
			2: "Disabled",
		}
	},
}

function updateFlags() {
	const flagItems = document.querySelectorAll("#available-experiments .content-container .experiment");
	flagItems.forEach(flagItem => {
		const flag = "Geckium.chrflag." + flagItem.id.replace(/-/g, ".");
		const toggleBtn = flagItem.querySelector("button");
		const multipleSelect = flagItem.querySelector("select");

		if (toggleBtn) {
			if (gkPrefUtils.tryGet(flag).bool)
				toggleBtn.setAttribute("label", flagsBundle.GetStringFromName("disableGenericFlagOption"));
			else
				toggleBtn.setAttribute("label", flagsBundle.GetStringFromName("enableGenericFlagOption"));
		} else if (multipleSelect) {
			multipleSelect.value = gkPrefUtils.tryGet(flag).int;

			console.log(flag, gkPrefUtils.tryGet(flag).int, multipleSelect, multipleSelect.value)
		}
	})
}

function setUpExperiments() {
    let appearanceChoice;
    const content = "#available-experiments .content-container";

    document.querySelector(content).querySelectorAll(".experiment").forEach(experiment => {
        experiment.remove();
    });

    for (const key in experiments) {
        if (experiments.hasOwnProperty(key)) {
            const experiment = experiments[key];

			if (experiment.type == "ntp") {
				appearanceChoice = gkEras.getNTPEra();
			} else {
				appearanceChoice = gkEras.getBrowserEra();
			}

            if (appearanceChoice < experiment.from || appearanceChoice > experiment.to)
                continue; // Skip adding experiment to UI if appearance choice is outside range

            const experimentItem = `
                <vbox class="experiment" id="${key}">
                    <hbox class="experiment-header">
                        <label class="experiment-name">${experiment.name}</label>
                    </hbox>
                    <html:div class="experiment-text">
                        <html:label>${experiment.description}</html:label>
                        <html:a class="permalink" href="#${key}">#${key}</html:a>
                    </html:div>
                    <html:div class="experiment-actions">
                        
                    </html:div>
                </vbox>
            `;

            const experimentItemActions = ".experiment#" + key + " .experiment-actions";

            let actions = ``;

            if (experiment.values) {
                // Use select element if experiment has multiple values
                actions = `
                    <html:select name="select-${key}" id="select-${key}">
                        ${Object.keys(experiment.values).map(value => `<html:option value="${value}">${experiment.values[value]}</html:option>`).join('')}
                    </html:select>
                `;

                // Add event listener to toggle experiment based on select change
                waitForElm("select#select-" + key).then(function() {
                    document.querySelector("select#select-" + key).addEventListener("change", () => {
                        const selectedValue = document.querySelector("select#select-" + key).value;
                        gkPrefUtils.set("Geckium.chrflag." + key.replace(/-/g, ".")).int(selectedValue);
						console.log("Geckium.chrflag." + key.replace(/-/g, "."))
                        updateFlags();
                    });
                });
            } else {
                // Use button element if experiment has single value
                actions = `
                    <button id="toggle-${key}"></button>
                `;

                // Add event listener to toggle experiment based on button click
                waitForElm("button#toggle-" + key).then(function() {
                    document.querySelector("button#toggle-" + key).addEventListener("click", () => {
                        gkPrefUtils.toggle("Geckium.chrflag." + key.replace(/-/g, "."));

						updateFlags();
                    });
                });
            }

            // Append actions to experiment item
            waitForElm(experimentItemActions).then(function() {
                document.querySelector(experimentItemActions).appendChild(MozXULElement.parseXULToFragment(actions));

				updateFlags();
            });

            // Append experiment item to UI
            waitForElm(content).then(function() {
                document.querySelector(content).appendChild(MozXULElement.parseXULToFragment(experimentItem));
            });

            updateFlags();
        }
    }
}