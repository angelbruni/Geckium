// ==UserScript==
// @name        Geckium - People Button
// @author		AngelBruni
// @loadorder   4
// ==/UserScript==



class gkPeople {
	static get getPeopleButton() {
		return document.getElementById("gk-firefox-account-button");
	}

	static createReservedSpaces() {
		const TabsToolbarCustomizationTarget = document.getElementById("TabsToolbar-customization-target");
		const beforeTabsSpace = document.createXULElement("toolbaritem");
		beforeTabsSpace.setAttribute("removable", "false");
		beforeTabsSpace.id = "gkavatar-container";
		TabsToolbarCustomizationTarget.prepend(beforeTabsSpace);

		const titlebarButtonboxContainer = document.querySelector("#TabsToolbar .titlebar-buttonbox-container");
		const titlebarButtonboxSpace = document.createXULElement("hbox");
		titlebarButtonboxSpace.classList.add("titlebar-buttonbox");
		titlebarButtonboxSpace.id = "gkpeople-button-container";
		TabsToolbarCustomizationTarget.append(titlebarButtonboxSpace);
		gkInsertElm.before(titlebarButtonboxSpace, titlebarButtonboxContainer);
	}

	static get getReservedSpaces() {
		return [document.getElementById("gkavatar-container"), document.getElementById("gkpeople-button-container")];
	}

	/**
	 * getStyle - Gets the currently set people button style from about:config
	 * 
	 * If not found, or the value is invalid, the era's preferred people button style will be used.
	 * @era: The currently selected era
	 */

	static getStyle(era) {
		// Return the appropriate titlebar style
		switch (gkPrefUtils.tryGet("Geckium.people.style").string) {
			case "off":
				return "off";
			case "avatar":
				return "avatar";
			case "titlebutton":
				return "titlebutton";
			default:
				if (era < 11) {
					return "off";
				} else if (era < 47) {
					return "avatar";
				}
				return "titlebutton";
		}
	}

	/**
	 * applyStyle - Applies the current people button style from getStyle().
	 * 
	 * @era: The currently selected era - if not specified, sourced automatically
	 */

	static applyStyle(era) {
		if (!era) {
			era = gkEras.getBrowserEra();
		}
		// Delete existing profile button style values (they will get remade)
		this.getPeopleButton.removeAttribute("class");
		this.getReservedSpaces[0].style.display = "none";
		this.getReservedSpaces[1].style.display = "none";

		let prefChoice = gkPeople.getStyle(era);
		if (prefChoice == "off") {
			// We're done here if it is disabled.
			return;
		} else if (prefChoice == "avatar") {
			this.getReservedSpaces[0].style.display = null;

			// Actual Button
			this.getReservedSpaces[0].appendChild(this.getPeopleButton);
			this.getPeopleButton.classList.add("toolbarbutton-1", "chromeclass-toolbar-additional");
		} else if (prefChoice == "titlebutton") {
			this.getReservedSpaces[1].style.display = null;

			// Actual Button
			this.getReservedSpaces[1].appendChild(this.getPeopleButton);
			this.getPeopleButton.classList.add("gkpeople-titlebar");
		}
	}

	static setProfilePic() {
		// Delete existing profile picture values (they will get remade)
		document.documentElement.removeAttribute("profilepicchromium");
		document.documentElement.style.removeProperty("--custom-profile-picture");

		const prefChoice = gkPrefUtils.tryGet("Geckium.profilepic.mode").string;
		document.documentElement.setAttribute("profilepicbutton", gkPrefUtils.tryGet("Geckium.profilepic.button").bool) //TODO: Was header switch
		document.documentElement.setAttribute("profilepic", prefChoice);
		switch (prefChoice) {
			case "firefox":
				break;
			case "geckium":
				break;
			case "chromium":
				document.documentElement.setAttribute("profilepicchromium", gkPrefUtils.tryGet("Geckium.profilepic.chromiumIndex").int);
				break;
			case "custom":
				document.documentElement.style.setProperty("--custom-profile-picture", "url(file:///" + gkPrefUtils.tryGet("Geckium.profilepic.customPath").string.replace(/\\/g, "/").replace(" ", "%20") + ")");
				break;
			default:
				// Fallback to Firefox Account profile picture if value unset/invalid
				document.documentElement.setAttribute("profilepic", "firefox");
				break;
		}
	}
}

const peopleStyleObs = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed")
			gkPeople.applyStyle();
	},
};
Services.prefs.addObserver("Geckium.appearance.choice", peopleStyleObs, false);
Services.prefs.addObserver("Geckium.main.overrideStyle", peopleStyleObs, false);
Services.prefs.addObserver("Geckium.main.style", peopleStyleObs, false);
Services.prefs.addObserver("Geckium.people.style", peopleStyleObs, false);

/* bruni: Automatically apply a profile picture 
		  when it detecs changes in the pref. */
const profilePictureObs = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed")
			gkPeople.setProfilePic();
	},
};
Services.prefs.addObserver("Geckium.profilepic.mode", profilePictureObs, false)
Services.prefs.addObserver("Geckium.profilepic.chromiumIndex", profilePictureObs, false)
Services.prefs.addObserver("Geckium.profilepic.customPath", profilePictureObs, false)

UC_API.Runtime.startupFinished().then(() => {
	gkPeople.createReservedSpaces();
	gkPeople.applyStyle();
	gkPeople.setProfilePic();
});