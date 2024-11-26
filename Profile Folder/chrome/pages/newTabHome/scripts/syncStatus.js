const { UIState } = ChromeUtils.importESModule("resource://services-sync/UIState.sys.mjs");

function updateSignInStatus() {
	const fxastatus = UIState.get().status;
	document.documentElement.setAttribute("fxastatus", fxastatus);

	const appearanceChoice = gkEras.getNTPEra();
	const privacySetting = gkPrefUtils.tryGet("Geckium.privacy.hideAccountInfo").bool;
	const email = UIState.get().email;
	const displayName = UIState.get().displayName;
	let loginContainer;
	let accountSelector;
	let avatarElm;

	if (appearanceChoice >= 11 && appearanceChoice <= 25)
		loginContainer = document.getElementById("login-container");

	if (appearanceChoice == 11)
		accountSelector = "#login-username";
	else if (appearanceChoice >= 17 && appearanceChoice <= 25)
		accountSelector = "#login-email";
	else if (appearanceChoice >= 37)
		accountSelector = "#login-displayName";

	const accountElm = document.querySelector(accountSelector);

	if (appearanceChoice >= 37)
		avatarElm = document.getElementById("login-avatar");

	if (accountElm) {
		if (fxastatus == "signed_in") {
			// Name
			if (appearanceChoice >= 17 && appearanceChoice <= 25) {
				loginContainer.style.display = "none";
				accountElm.style.display = null;
				accountElm.textContent = !privacySetting ? email : "";
			} else if (appearanceChoice == 37) {
				if (privacySetting)
					accountElm.style.display = "none";
				else
					accountElm.style.display = null;

				accountElm.textContent = !privacySetting ? ntpBundle.GetStringFromName("googleDisplayUsername").replace("{{displayUsername}}", displayName.split(" ")[0] || email) : "";
			} else if (appearanceChoice >= 47) {
				if (privacySetting)
					accountElm.style.display = "none";
				else
					accountElm.style.display = null;

				accountElm.textContent = !privacySetting ? displayName.split(" ")[0] || email : "";
			}

			// User profile picture
			if (appearanceChoice >= 37) {
				if (privacySetting)
					avatarElm.style.display = "none";
				else
					avatarElm.style.display = null;

				avatarElm.querySelector("img").setAttribute("src", UIState.get().avatarURL);
			}
				
		} else {
			// Name
			if (appearanceChoice >= 17 && appearanceChoice <= 25) {
				loginContainer.style.display = null;
				accountElm.style.display = "none";
			} else if (appearanceChoice == 37) {
				accountElm.textContent = `${ntpBundle.GetStringFromName("googleDisplayUsername").replace("{{displayUsername}}", ntpBundle.GetStringFromName("googleDefaultDisplayUsername"))}`;
			} else if (appearanceChoice >= 47) {
				accountElm.style.display = "none";
			}

			// User profile picture
			if (appearanceChoice >= 37) 
				avatarElm.style.display = "none";
		}
	}
}

const fxSyncObs = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed")
			updateSignInStatus();
	},
};
Services.prefs.addObserver("Geckium.privacy.hideAccountInfo", fxSyncObs, false);

Services.obs.addObserver((subject, topic, data) => {
	if (topic === UIState.ON_UPDATE)
		updateSignInStatus();
}, UIState.ON_UPDATE);