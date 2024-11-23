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
		titlebarButtonboxSpace.id = "gkpeople-button-container";
		const titlebarButton = document.createXULElement("hbox");
		titlebarButton.id = "gkpeople-button";
		titlebarButton.classList.add("titlebar-buttonbox");
		TabsToolbarCustomizationTarget.append(titlebarButtonboxSpace);
		titlebarButtonboxSpace.appendChild(titlebarButton);
		gkInsertElm.before(titlebarButtonboxSpace, titlebarButtonboxContainer);
	}

	static get getReservedSpaces() {
		return [document.getElementById("gkavatar-container"), document.querySelector("#gkpeople-button-container > #gkpeople-button")];
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

		let prefChoice = gkPeople.getStyle(era);
		document.documentElement.setAttribute("gkpeoplestyle", prefChoice);

		if (prefChoice == "off") {
			// We're done here if it is disabled.
			return;
		} else if (prefChoice == "avatar") {
			this.getReservedSpaces[0].appendChild(this.getPeopleButton);
			this.getPeopleButton.classList.add("toolbarbutton-1", "chromeclass-toolbar-additional");
		} else if (prefChoice == "titlebutton") {
			this.getReservedSpaces[1].appendChild(this.getPeopleButton);
			this.getPeopleButton.classList.add("gkpeople-titlebar");
		}
	}

	static setProfilePic() {
		// Delete existing profile picture values (they will get remade)
		document.documentElement.removeAttribute("profilepicchromium");
		document.documentElement.style.removeProperty("--custom-profile-picture");

		const prefChoice = gkPrefUtils.tryGet("Geckium.profilepic.mode").string;
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

	/**
	 * applyForce68Linux - Apply Chromium 68's People Titlebar Button style on Linux Titlebar Styles
	 */

	static applyForce68Linux() {
		document.documentElement.setAttribute("gkpeopleforce68linux", gkPrefUtils.tryGet("Geckium.people.force68Linux").bool);
	}

	/**
	 * applyForceChrOS - Force Windows 8 Mode People Titlebar Button to appear on Chromium OS Titlebars
	 */

	static applyForceChrOS() {
		document.documentElement.setAttribute("gkpeopleforceChrOS", gkPrefUtils.tryGet("Geckium.people.showChrOSPeople").bool);
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

// Automatically change the Linux People Titlebutton style when 68-forcing's toggled
const force68LinuxPeopleObs = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			gkPeople.applyForce68Linux();
		}
	},
};
Services.prefs.addObserver("Geckium.people.force68Linux", force68LinuxPeopleObs, false);

// Automatically change the Chromium OS People Titlebutton visibility when toggled
const forceChrOSPeopleObs = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			gkPeople.applyForceChrOS();
		}
	},
};
Services.prefs.addObserver("Geckium.people.showChrOSPeople", forceChrOSPeopleObs, false);

UC_API.Runtime.startupFinished().then(() => {
	gkPeople.createReservedSpaces();
	gkPeople.applyStyle();
	gkPeople.setProfilePic();
	gkPeople.applyForce68Linux();
	gkPeople.applyForceChrOS();
});