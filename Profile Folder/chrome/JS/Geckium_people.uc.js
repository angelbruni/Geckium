// ==UserScript==
// @name        Geckium - People
// @author		AngelBruni
// @loadorder   3
// ==/UserScript==

class gkPeople {
	static get getPeopleButton() {
		return document.getElementById("gk-firefox-account-button");
	}

	static createReservedSpaces() {
		const TabsToolbarCustomizationTarget = document.getElementById("TabsToolbar-customization-target");
		const beforeTabsSpace = document.createXULElement("toolbaritem");
		beforeTabsSpace.setAttribute("removable", "false");
		beforeTabsSpace.id = "people-before-tabs-space";
		TabsToolbarCustomizationTarget.prepend(beforeTabsSpace);

		const titlebarButtonboxContainer = document.querySelector("#TabsToolbar .titlebar-buttonbox-container");
		const titlebarButtonboxSpace = document.createXULElement("hbox");
		titlebarButtonboxSpace.classList.add("titlebar-buttonbox");
		titlebarButtonboxSpace.id = "people-before-titlebuttons-space";
		titlebarButtonboxContainer.prepend(titlebarButtonboxSpace);
	}

	static get getReservedSpaces() {
		return [document.getElementById("people-before-tabs-space"), document.getElementById("people-before-titlebuttons-space")];
	}

	static setPeoplePosition(pos) {
		let appearanceChoice = gkEras.getBrowserEra();
		this.getPeopleButton.removeAttribute("class");

		switch (pos) {
			default:
				if (appearanceChoice < 47) {
					this.getReservedSpaces[0].appendChild(this.getPeopleButton);
					this.getPeopleButton.classList.add("toolbarbutton-1", "chromeclass-toolbar-additional");
				} else {
					this.getReservedSpaces[1].appendChild(this.getPeopleButton);
					this.getPeopleButton.classList.add("titlebar-button", "titlebar-people");
				}
				break;
		}
	}

	static setProfilePic() {
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
}

/* bruni: Automatically apply a profile picture 
		  when it detecs changes in the pref. */
const profilePictureObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			gkPeople.setProfilePic();
		}
	}
};
Services.prefs.addObserver("Geckium.profilepic.button", profilePictureObserver, false)
Services.prefs.addObserver("Geckium.profilepic.mode", profilePictureObserver, false)
Services.prefs.addObserver("Geckium.profilepic.chromiumIndex", profilePictureObserver, false)
Services.prefs.addObserver("Geckium.profilepic.customPath", profilePictureObserver, false)
UC_API.Runtime.startupFinished().then(()=>{
	gkPeople.createReservedSpaces();
	gkPeople.setPeoplePosition();
	gkPeople.setProfilePic();
});

const appearanceObs = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			gkPeople.setPeoplePosition();	
		}		
	},
};
Services.prefs.addObserver("Geckium.appearance.choice", appearanceObs, false);