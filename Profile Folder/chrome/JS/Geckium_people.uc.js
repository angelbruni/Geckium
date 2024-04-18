// ==UserScript==
// @name        Geckium - People
// @author		AngelBruni
// @loadorder   3
// ==/UserScript==

function setProfilePic() {
	const attr = "profilepic";
	const prefSetting = pref("Geckium.profilepic.mode").tryGet.string();

	if (prefSetting == "" || pref == "firefox") {
		docElm.setAttribute(attr, "firefox");
	} else if (prefSetting == "custom") {
		docElm.setAttribute(attr, "custom");
		docElm.style.setProperty("--custom-profile-picture", "url(file:///" + pref('Geckium.profilepic.path').tryGet.string().replace(/\\/g, "/").replace(" ", "%20") + ")");
	} else if (prefSetting == undefined) {
		docElm.setAttribute(attr, "disabled");
	} else {
		docElm.setAttribute(attr, prefSetting);
	}
}

/* bruni: Automatically apply a profile picture 
		  when it detecs changes in the pref. */
const profilePictureObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			setProfilePic()
		}
	}
};
Services.prefs.addObserver("Geckium.profilepic.mode", profilePictureObserver, false)
Services.prefs.addObserver("Geckium.profilepic.path", profilePictureObserver, false)
window.addEventListener("load", setProfilePic);