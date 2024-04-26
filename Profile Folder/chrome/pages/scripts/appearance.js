function appearance() {
	let previousChoice;
	let prefChoice;

	if (document.URL == "about:newtab" || document.URL == "about:home" || document.url == "about:apps") {
		switch (gkPrefUtils.tryGet("Geckium.newTabHome.styleMode").string) {
			case "forced":
				prefChoice = gkPrefUtils.tryGet("Geckium.newTabHome.style").int;
				break;
			default:
				prefChoice = gkPrefUtils.tryGet("Geckium.appearance.choice").int;
				break;
		}
	} else {
		prefChoice = gkPrefUtils.tryGet("Geckium.appearance.choice").int;
	}
	
	if (!prefChoice)
		prefChoice = 0;

	if (prefChoice == previousChoice) {
		console.log("TAB PAGE: Choice same as previous choice, ignoring.", prefChoice, previousChoice)
	} else {
		console.log("TAB PAGE: Choice not the same as previous choice, continuing.", prefChoice, previousChoice)

		if (document.URL == "about:newtab" || document.URL == "about:home" || document.url == "about:apps") {
			gkVisualStyles.setVisualStyle();
			createMainLayout();
			retrieveFrequentSites();
			createRecentlyClosed();
			setUpPages();
			setUpApps();
		} else if (document.URL == "about:flags") {
			setUpExperiments();
		}
	}
}
document.addEventListener("DOMContentLoaded", appearance)

/* bruni: Automatically apply appearance and theme
		  attributes when it detecs changes in the pref. */
const appearanceObs = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			appearance();
		}
	},
};
Services.prefs.addObserver("Geckium.appearance.choice", appearanceObs, false);
Services.prefs.addObserver("Geckium.newTabHome.styleMode", appearanceObs, false);
Services.prefs.addObserver("Geckium.newTabHome.style", appearanceObs, false);