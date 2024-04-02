const experiments = {
	"compact-navigation": {
		name: "Compact Navigation",
		description: "Adds a \"Hide the toolbar\" entry to the tabstrip's context menu. Use this to toggle between always displaying the toolbar (default) and only opening it as a drop down box as needed.",
		from: 2,
		to: 2,
	},
	"experimental-new-tab-page": {
		name: "Experimental new tab page",
		description: "Enables an in-development redesign of the new tab page.",
		from: 2,
		to: 2,
	},
	"action-box": {
		name: "Action box",
		description: "Enable or disable the \"Action Box\" experimental toolbar UI.",
		from: 3,
		to: 4,
	},
	"search-button-in-omnibox": {
		name: "Enable search button in Omnibox",
		description: "Places a search button in the Omnibox.",
		from: 5, // Needs to be 33+ only.
		to: 5,
	},
	"enable-icon-ntp": {
		name: "Enable large icons on the New Tab",
		description: "Enable the experimental New Tab page using large icons.",
		from: 5,
		to: 6,
	},
	"enable-settings-window": {
		name: "Show settings in a window",
		description: "If enabled, Settings will be shown in a dedicated window instead of as a browser tab.",
		from: 5,
		to: 6,
	},
	"omnibox-ui-show-suggestion-favicons": {
		name: "Omnibox UI Show Suggestion Favicons",
		description: "Shows favicons instead of generic vector icons for URL suggestions in the Omnibox dropdown.",
		from: 6,
		to: 6,
	},
	"omnibox-ui-vertical-layout": {
		name: "Omnibox UI Vertical Layout",
		description: "Displays Omnibox sugestions in 2 lines - title over origin.",
		from: 6,
		to: 6,
	},
	"omnibox-ui-vertical-margin": {
		name: "Omnibox UI Vertical Margin",
		description: "Changes the vertical margin in the Omnibox UI.",
		from: 6,
		to: 6,
	},
	"omnibox-ui-swap-title-and-url": {
		name: "Omnibox UI Swap Title and URL",
		description: "In the omnibox dropdown, shows titles before URLs when both are available.",
		from: 6,
		to: 6,
	},
}

function setUpExperiments() {
    const appearanceChoice = pref("Geckium.appearance.choice").tryGet.int();

    const content = "#available-experiments .content";

	document.querySelectorAll("#available-experiments .content .experiment").forEach(experiment => {
		experiment.remove();
	})
	
    for (const key in experiments) {
        if (experiments.hasOwnProperty(key)) {
            const experiment = experiments[key];

            if (appearanceChoice < experiment.from || appearanceChoice > experiment.to) {
                continue; // Skip adding experiment to UI if appearance choice is outside range
            }

            const experimentItem = `
                <vbox class="experiment" id="${key}">
                    <hbox class="experiment-header">
                        <label class="experiment-name">${experiment.name}</label>
                        <!--<label class="experiment-platforms">Mac, Windows, Linux, Chrome OS, Android</label>-->
                    </hbox>
                    <html:div class="experiment-text">
                        <html:label>${experiment.description}</html:label>
                        <html:a class="permalink" href="#${key}">#${key}</html:a>
                    </html:div>
                    <html:div class="experiment-actions">
                        <button label="Enable"></button>
                    </html:div>
                </vbox>
            `;

            waitForElm(content).then(function() {
                document.querySelector(content).appendChild(MozXULElement.parseXULToFragment(experimentItem));
            });
        }
    }
}