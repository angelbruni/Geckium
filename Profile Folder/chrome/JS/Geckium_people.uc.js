// ==UserScript==
// @name        Geckium - People
// @author		AngelBruni
// @loadorder   4
// ==/UserScript==

class gkPeople {
	static removeOgFxAButton() {
		if (document.getElementById("fxa-toolbar-menu-button"))
			CustomizableUI.removeWidgetFromArea("fxa-toolbar-menu-button");
	}

	static get getPeopleButton() {
		return document.getElementById("gk-firefox-account-button");
	}

	static createReservedSpaces() {
		this.removeOgFxAButton();

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

	static setPeoplePosition() {
		let prefChoice = gkPrefUtils.tryGet("Geckium.profilepic.position").string;
		let appearanceChoice;

		if (!prefChoice || prefChoice == "auto")
			appearanceChoice = gkEras.getBrowserEra();
		else if (prefChoice == "old")
			appearanceChoice = 1;
		else if (prefChoice == "new")
			appearanceChoice = 47;

		let titlebarBorder = gkTitlebars.getTitlebarSpec().border;
		this.getPeopleButton.removeAttribute("class");

		if (appearanceChoice < 47) {
			// Position
			if (titlebarBorder == "macos")
				gkInsertElm.before(this.getReservedSpaces[0], document.querySelector("#TabsToolbar > .titlebar-buttonbox-container"));
			else
				document.getElementById("TabsToolbar-customization-target").prepend(this.getReservedSpaces[0]);

			this.getReservedSpaces[0].style.display = null;
			this.getReservedSpaces[1].style.display = "none";
			
			// Actual Button
			this.getReservedSpaces[0].appendChild(this.getPeopleButton);
			this.getPeopleButton.classList.add("toolbarbutton-1", "chromeclass-toolbar-additional");
		} else {
			// Position
			if (titlebarBorder == "macos")
				gkInsertElm.before(this.getReservedSpaces[1], document.querySelector("#TabsToolbar > .titlebar-buttonbox-container:not(#people-titlebuttons-space)"));
			else
				document.querySelector("#TabsToolbar .titlebar-buttonbox-container:not(#people-titlebuttons-space)").prepend(this.getReservedSpaces[1]);

			this.getReservedSpaces[0].style.display = "none";
			this.getReservedSpaces[1].style.display = null;
			
			// Actual Button
			this.getReservedSpaces[1].appendChild(this.getPeopleButton);
			this.getPeopleButton.classList.add("titlebar-people");
		}
	}

	static setProfilePic() {
		const attr = "profilepic";
		const prefSetting = gkPrefUtils.tryGet("Geckium.profilepic.mode").string;

		// Reset
		document.documentElement.removeAttribute("profilepicchromium");
		document.documentElement.style.removeProperty("--custom-profile-picture");

		// Set
		document.documentElement.setAttribute("profilepicbutton", gkPrefUtils.tryGet("Geckium.profilepic.button").bool)
		document.documentElement.setAttribute(attr, prefSetting);
		switch (prefSetting) {
			case "geckium":
				break;
			case "chromium":
				document.documentElement.setAttribute("profilepicchromium", gkPrefUtils.tryGet("Geckium.profilepic.chromiumIndex").int);
				break;
			case "firefox":
				break;
			case "custom":
				document.documentElement.style.setProperty("--custom-profile-picture", "url(file:///" + gkPrefUtils.tryGet("Geckium.profilepic.customPath").string.replace(/\\/g, "/").replace(" ", "%20") + ")");
				break;
			default:
				document.documentElement.setAttribute(attr, "none");
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
UC_API.Runtime.startupFinished().then(() => {
	gkPeople.createReservedSpaces();
	gkPeople.setPeoplePosition();
	gkPeople.setProfilePic();
});

const pfpAppearanceObs = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed")
			gkPeople.setPeoplePosition();
	},
};
Services.prefs.addObserver("Geckium.profilepic.position", pfpAppearanceObs, false);
Services.prefs.addObserver("Geckium.appearance.choice", pfpAppearanceObs, false);
Services.prefs.addObserver("Geckium.main.overrideStyle", pfpAppearanceObs, false);
Services.prefs.addObserver("Geckium.main.style", pfpAppearanceObs, false);
Services.prefs.addObserver("Geckium.appearance.titlebarStyle", pfpAppearanceObs, false);
Services.prefs.addObserver("Geckium.appearance.titlebarNative", pfpAppearanceObs, false);
Services.prefs.addObserver("Geckium.appearance.titlebarThemedNative", pfpAppearanceObs, false);
Services.prefs.addObserver("browser.tabs.inTitlebar", pfpAppearanceObs, false);
Services.prefs.addObserver("Geckium.chrTheme.mustAero", pfpAppearanceObs, false);