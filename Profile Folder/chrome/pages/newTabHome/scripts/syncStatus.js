function updateSignInStatus() {
	let email = gkPrefUtils.tryGet("services.sync.username").string;
    let notsignedin = document.getElementById("login-container");
    let loginemail = document.getElementById("login-email");
    if (notsignedin && loginemail) {
        if (email) {
            notsignedin.style.setProperty("display", "none");
            loginemail.style.removeProperty("display");
            loginemail.innerHTML = email;
        } else {
            notsignedin.style.removeProperty("display");
            loginemail.style.setProperty("display", "none");
        }
    }
}

const fxSyncObs = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			updateSignInStatus();
		}
	},
};
Services.prefs.addObserver("services.sync.username", fxSyncObs, false);