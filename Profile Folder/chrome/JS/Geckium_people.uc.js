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
		beforeTabsSpace.id = "people-tabs-space";
		TabsToolbarCustomizationTarget.prepend(beforeTabsSpace);

		const titlebarButtonboxContainer = document.querySelector("#TabsToolbar .titlebar-buttonbox-container");
		const titlebarButtonboxSpace = document.createXULElement("hbox");
		titlebarButtonboxSpace.classList.add("titlebar-buttonbox");
		titlebarButtonboxSpace.id = "people-titlebuttons-space";
		titlebarButtonboxContainer.prepend(titlebarButtonboxSpace);
	}

	static get getReservedSpaces() {
		return [document.getElementById("people-tabs-space"), document.getElementById("people-titlebuttons-space")];
	}

	static setPeoplePosition(pos) {
		let appearanceChoice = gkEras.getBrowserEra();
		let titlebarBorder = gkTitlebars.getTitlebarSpec().border;
		this.getPeopleButton.removeAttribute("class");

		switch (pos) {
			default:
				if (appearanceChoice < 47) {
					// Position
					if (titlebarBorder == "macos")
						gkInsertElm.before(this.getReservedSpaces[0], document.querySelector("#TabsToolbar > .titlebar-buttonbox-container"));
					else
						document.getElementById("TabsToolbar-customization-target").prepend(this.getReservedSpaces[0]);

					// Actual Button
					this.getReservedSpaces[0].appendChild(this.getPeopleButton);
					this.getPeopleButton.classList.add("toolbarbutton-1", "chromeclass-toolbar-additional");
				} else {
					// Position
					if (titlebarBorder == "macos")
						gkInsertElm.before(this.getReservedSpaces[1], document.querySelector("#TabsToolbar > .titlebar-buttonbox-container:not(#people-titlebuttons-space)"));
					else
						document.querySelector("#TabsToolbar .titlebar-buttonbox-container:not(#people-titlebuttons-space)").prepend(this.getReservedSpaces[1]);

					// Actual Button
					this.getReservedSpaces[1].appendChild(this.getPeopleButton);
					this.getPeopleButton.classList.add("titlebar-people");
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