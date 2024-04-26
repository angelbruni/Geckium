// ==UserScript==
// @name        Geckium - People
// @author		AngelBruni
// @loadorder   3
// ==/UserScript==

function setProfilePic() {
	const attr = "profilepic";
	const prefSetting = gkPrefUtils.tryGet("Geckium.profilepic.mode").int;

	docElm.setAttribute("profilepicbutton", gkPrefUtils.tryGet("Geckium.profilepic.button").bool)

	switch (prefSetting) {
		case 0:
			docElm.setAttribute(attr, "geckium");
			break;
		case 1:
			docElm.setAttribute(attr, "chromium");
			docElm.setAttribute("profilepicchromium", gkPrefUtils.tryGet("Geckium.profilepic.chromiumIndex").int);
			break;
		case 2:
			docElm.setAttribute(attr, "firefox");
			break;
		case 3:
			docElm.setAttribute(attr, "custom");
			docElm.style.setProperty("--custom-profile-picture", "url(file:///" + gkPrefUtils.tryGet("Geckium.profilepic.customPath").string.replace(/\\/g, "/").replace(" ", "%20") + ")");
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