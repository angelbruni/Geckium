function updateSignInStatus() {
	let appearanceChoice = gkEras.getNTPEra();
	let privacySetting = gkPrefUtils.tryGet("Geckium.privacy.hideAccountInfo").bool;
	let email = gkPrefUtils.tryGet("services.sync.username").string;
	let loginContainer = document.getElementById("login-container");
	let loginUsername;

	if (appearanceChoice == 11)
		loginUsername = document.getElementById("login-username");
	else
		loginUsername = document.getElementById("login-email");
	
	if (loginContainer && loginUsername) {
		if (email) {
			if (appearanceChoice > 11) {
				loginContainer.style.setProperty("display", "none");
				loginUsername.style.removeProperty("display");
			}
			
			loginUsername.textContent = !privacySetting ? email : "";
		} else {
			if (appearanceChoice > 11) {
				loginContainer.style.removeProperty("display");
				loginUsername.style.setProperty("display", "none");
			}
		}
	}
}

const fxSyncObs = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed")
			updateSignInStatus();
	},
};
Services.prefs.addObserver("services.sync.username", fxSyncObs, false);
Services.prefs.addObserver("Geckium.privacy.hideAccountInfo", fxSyncObs, false);