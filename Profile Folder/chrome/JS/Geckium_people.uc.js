// ==UserScript==
// @name        Geckium - People
// @author		AngelBruni
// @loadorder   3
// ==/UserScript==

function setProfilePic() {
	const attr = "profilepic";
	const prefSetting = gkPrefUtils.tryGet("Geckium.profilepic.mode").int;

	document.documentElement.setAttribute("profilepicbutton", gkPrefUtils.tryGet("Geckium.profilepic.button").bool)

	switch (prefSetting) {
		case 0:
			document.documentElement.setAttribute(attr, "geckium");
			break;
		case 1:
			document.documentElement.setAttribute(attr, "chromium");
			document.documentElement.setAttribute("profilepicchromium", gkPrefUtils.tryGet("Geckium.profilepic.chromiumIndex").int);
			break;
		case 2:
			document.documentElement.setAttribute(attr, "firefox");
			break;
		case 3:
			document.documentElement.setAttribute(attr, "custom");
			document.documentElement.style.setProperty("--custom-profile-picture", "url(file:///" + gkPrefUtils.tryGet("Geckium.profilepic.customPath").string.replace(/\\/g, "/").replace(" ", "%20") + ")");
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