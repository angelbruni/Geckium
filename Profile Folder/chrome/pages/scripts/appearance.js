function appearance() {
	let previousChoice;

	const prefChoice = pref(prefMap.appearance).tryGet.int();

	if (prefChoice == previousChoice) {
		console.log("NEWTABHOME: Choice same as previous choice, ignoring.", prefChoice, previousChoice)
		return;
	} else {
		console.log("NEWTABHOME: Choice not the same as previous choice, continuing.", prefChoice, previousChoice)
	}

	createMainLayout();
	retrieveFrequentSites();
	createRecentlyClosed();
	setUpPages();
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