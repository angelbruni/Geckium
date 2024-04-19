// ==UserScript==
// @name        Geckium - People
// @author		AngelBruni
// @loadorder   3
// ==/UserScript==

function setProfilePic() {
	const attr = "profilepic";
	const prefSetting = pref("Geckium.profilepic.mode").tryGet.int();

	docElm.setAttribute("profilepicbutton", pref("Geckium.profilepic.button").tryGet.bool())

	switch (prefSetting) {
		case 0:
			docElm.setAttribute(attr, "chromium");
			docElm.setAttribute("profilepicchromium", pref("Geckium.profilepic.chromiumIndex").tryGet.int());
			break;
		case 1:
			docElm.setAttribute(attr, "firefox");
			break;
		case 2:
			docElm.setAttribute(attr, "custom");
			docElm.style.setProperty("--custom-profile-picture", "url(file:///" + pref('Geckium.profilepic.customPath').tryGet.string().replace(/\\/g, "/").replace(" ", "%20") + ")");
			break;
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
Services.prefs.addObserver("Geckium.profilepic.button", profilePictureObserver, false)
Services.prefs.addObserver("Geckium.profilepic.mode", profilePictureObserver, false)
Services.prefs.addObserver("Geckium.profilepic.chromiumIndex", profilePictureObserver, false)
Services.prefs.addObserver("Geckium.profilepic.customPath", profilePictureObserver, false)
window.addEventListener("load", setProfilePic);