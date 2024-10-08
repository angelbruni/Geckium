// ==UserScript==
// @name        Geckium - Silverfox Migrator
// @author		Dominic Hayes, AngelBruni
// @description	Converts Silverfox preferences to Geckium preferences.
// @loadorder   2
// @include		main
// ==/UserScript==

class sfMigrator {
	static sfPrefs = [
		"silverfox.beChromium",
		"silverfox.beChromeOS",
		"silverfox.disableSystemThemeIcons",
		"silverfox.preferOldLook",
		"silverfox.hasLocalImage",
		"silverfox.usepfp",
		"silverfox.forceWindowsStyling"
	]

	static get getWasSf() { // thanks, Silverfox...
		for (let i in this.sfPrefs) {
			if (gkPrefUtils.prefExists(this.sfPrefs[i]))
				return true
		}

		const sfUserJS = [
			{ id: "toolkit.legacyUserProfileCustomizations.stylesheets", value: true, type: "bool" },
			{ id: "browser.theme.dark-private-windows", value: false, type: "bool" },
			{ id: "browser.display.windows.non_native_menus", value: 0, type: "int" },
			{ id: "browser.uidensity", value: -1, type: "int" },
			{ id: "browser.download.useDownloadDir", value: true, type: "bool" },
			{ id: "browser.newtabpage.activity-stream.showSponsored", value: false, type: "bool" },
			{ id: "browser.newtabpage.activity-stream.feeds.section.topstories", value: false, type: "bool" },
			{ id: "widget.gtk.overlay-scrollbars.enabled", value: false, type: "bool" },
			{ id: "nglayout.enable_drag_images", value: false, type: "bool" },
			{ id: "browser.search.widget.inNavBar", value: false, type: "bool" },
			{ id: "datareporting.policy.dataSubmissionPolicyAcceptedVersion", value: 2, type: "int" },
			{ id: "datareporting.policy.dataSubmissionPolicyNotifiedTime", value: "10000000000000", type: "string" },
			{ id: "gfx.webrender.software", value: true, type: "bool" }
		] //NOTE: browser.startup.homepage_override.mstone is always overridden before Geckium can access it, so has been omitted.

		let matches;
		for (let i in sfUserJS) {
			if (sfUserJS[i]["type"] == "bool") {
				if (gkPrefUtils.tryGet(sfUserJS[i]["id"]).bool == sfUserJS[i]["value"])
					matches += 1
			} else if (sfUserJS[i]["type"] == "int") {
				if (gkPrefUtils.tryGet(sfUserJS[i]["id"]).int == sfUserJS[i]["value"]) 
					matches += 1
			} else if (sfUserJS[i]["type"] == "string") {
				if (gkPrefUtils.tryGet(sfUserJS[i]["id"]).string == sfUserJS[i]["value"])
					matches += 1
			}
		}
		if (matches == sfUserJS.length)
			return true;
		else
			return false;
	}

	static deleteSfPrefs() {
		for (let i in this.sfPrefs)
			if (gkPrefUtils.prefExists(this.sfPrefs[i])) {
				Services.prefs.clearUserPref(this.sfPrefs[i]);
		}
	}

	static migrate() {
		//Linux
		if (AppConstants.platform == "linux") {
			if (gkPrefUtils.tryGet("silverfox.beChromeOS").bool) {
				// Be Chrome OS
				gkPrefUtils.set("Geckium.appearance.titlebarStyle").string("chromiumos");
			} else if (gkPrefUtils.tryGet("silverfox.forceWindowsStyling").bool) {
				// Force Windows Styling
				gkPrefUtils.set("Geckium.appearance.titlebarStyle").string("windows");
			}
		}

		//Branding
		if (gkPrefUtils.tryGet("silverfox.beChromium").bool)
			gkPrefUtils.set("Geckium.branding.choice").string("chromium");
		else
			gkPrefUtils.set("Geckium.branding.choice").string("chrome");

		//Era
		if (gkPrefUtils.tryGet("silverfox.preferOldLook").bool)
			gkPrefUtils.set("Geckium.appearance.choice").int(11);
		else
			gkPrefUtils.set("Geckium.appearance.choice").int(25);

		//Profile Pictures
		const pfp = gkPrefUtils.tryGet("silverfox.usepfp").string;
		const pfps = {
			"alien": 13,
			"blondepfp": 8,
			"bluepfp": 2,
			"burger": 18,
			"businessmanpfp": 11,
			"cat": 19,
			"chickpfp": 10,
			"cooldudepfp": 9,
			"cupcake": 20,
			"dog": 21,
			"drink": 23,
			"flower": 15,
			"football": 17,
			"greenpfp": 3,
			"happy": 14,
			"horse": 22,
			"lightbluepfp": 1,
			"music": 24,
			"ninja": 12,
			"orangepfp": 4,
			"pizza": 16,
			"purplepfp": 5,
			"redpfp": 6,
			"weather": 25,
			"whitepfp": 0,
			"yellowpfp": 7
		}
		if (pfp != "off" && pfp != "") {
			gkPrefUtils.set("Geckium.profilepic.button").bool(true);

			if (pfp == "custom" || pfp == "animated" || pfp == "chrome" || pfp == "chromium") {
				// Silverfox's custom pfps no longer exist if the user replaced SF with GK - fallback to:
				if (gkPrefUtils.tryGet("services.sync.username").string) {
					//  Firefox Account's user picture if signed in...
					gkPrefUtils.set("Geckium.profilepic.mode").int(2);
				} else {				
					//  Otherwise Geckium.
					gkPrefUtils.set("Geckium.profilepic.mode").int(0);
				}
			} else {
				gkPrefUtils.set("Geckium.profilepic.mode").int(1);
				gkPrefUtils.set("Geckium.profilepic.chromiumIndex").int(pfps[pfp]);
			}
		}

		// Finishing touches
		// Apply Silverfox's Apps list
		gkPrefUtils.set("Geckium.newTabHome.appsList").string(`
		{
			"0": {
				"pos": 0,
				"favicon": "chrome://userchrome/content/pages/newTabHome/assets/chrome-11/imgs/IDR_PRODUCT_LOGO_16.png",
				"oldIcon": "chrome://userchrome/content/pages/newTabHome/assets/chrome-21/imgs/1.png",
				"newIcon": "chrome://userchrome/content/pages/newTabHome/assets/chrome-21/imgs/1.png",
				"oldName": "Web Store",
				"newName": "Web Store",
				"url": "https://addons.mozilla.org/en-US/firefox",
				"type": 0
			},
			"1": {
				"pos": 1,
				"favicon": "https://github.com/florinsdistortedvision/silverfox/raw/main/theme/chrome/resources/pages/homepage/assets/gmail_app.png",
				"oldIcon": "https://github.com/florinsdistortedvision/silverfox/raw/main/theme/chrome/resources/pages/homepage/assets/gmail_app.png",
				"newIcon": "https://github.com/florinsdistortedvision/silverfox/raw/main/theme/chrome/resources/pages/homepage/assets/gmail_app.png",
				"oldName": "Gmail",
				"newName": "Gmail",
				"url": "https://mail.google.com",
				"type": 0
			},
			"2": {
				"pos": 2,
				"favicon": "https://github.com/florinsdistortedvision/silverfox/raw/main/theme/chrome/resources/pages/homepage/assets/drive_app.png",
				"oldIcon": "https://github.com/florinsdistortedvision/silverfox/raw/main/theme/chrome/resources/pages/homepage/assets/drive_app.png",
				"newIcon": "https://github.com/florinsdistortedvision/silverfox/raw/main/theme/chrome/resources/pages/homepage/assets/drive_app.png",
				"oldName": "Google Drive",
				"newName": "Google Drive",
				"url": "https://drive.google.com",
				"type": 0
			},
			"3": {
				"pos": 3,
				"favicon": "https://github.com/florinsdistortedvision/silverfox/raw/main/theme/chrome/resources/pages/homepage/assets/google_app.png",
				"oldIcon": "https://github.com/florinsdistortedvision/silverfox/raw/main/theme/chrome/resources/pages/homepage/assets/google_app.png",
				"newIcon": "https://github.com/florinsdistortedvision/silverfox/raw/main/theme/chrome/resources/pages/homepage/assets/google_app.png",
				"oldName": "Google Search",
				"newName": "Google Search",
				"url": "https://www.google.com",
				"type": 0
			},
			"4": {
				"pos": 4,
				"favicon": "https://github.com/florinsdistortedvision/silverfox/raw/main/theme/chrome/resources/pages/homepage/assets/youtube_app.png",
				"oldIcon": "https://github.com/florinsdistortedvision/silverfox/raw/main/theme/chrome/resources/pages/homepage/assets/youtube_app.png",
				"newIcon": "https://github.com/florinsdistortedvision/silverfox/raw/main/theme/chrome/resources/pages/homepage/assets/youtube_app.png",
				"oldName": "YouTube",
				"newName": "YouTube",
				"url": "https://www.youtube.com",
				"type": 0
			},
			"5": {
				"pos": 5,
				"favicon": "https://github.com/florinsdistortedvision/silverfox/raw/main/theme/chrome/resources/pages/homepage/assets/angrybirds_app.png",
				"oldIcon": "https://github.com/florinsdistortedvision/silverfox/raw/main/theme/chrome/resources/pages/homepage/assets/angrybirds_app.png",
				"newIcon": "https://github.com/florinsdistortedvision/silverfox/raw/main/theme/chrome/resources/pages/homepage/assets/angrybirds_app.png",
				"oldName": "Angry Birds",
				"newName": "Angry Birds",
				"url": "https://yell0wsuit.page/assets/games/angry-birds-chrome",
				"type": 0
			},
			"6": {
				"pos": 6,
				"favicon": "https://github.com/florinsdistortedvision/silverfox/raw/main/theme/chrome/resources/pages/homepage/assets/myspace_app.svg",
				"oldIcon": "https://github.com/florinsdistortedvision/silverfox/raw/main/theme/chrome/resources/pages/homepage/assets/myspace_app.svg",
				"newIcon": "https://github.com/florinsdistortedvision/silverfox/raw/main/theme/chrome/resources/pages/homepage/assets/myspace_app.svg",
				"oldName": "MySpace",
				"newName": "MySpace",
				"url": "https://spacehey.com",
				"type": 0
			}
		}
		`);

		// Enable Silverfox Firefox Theming
		gkPrefUtils.set("Geckium.customtheme.mode").string("silverfox");

		// Delete leftover Silverfox settings
		this.deleteSfPrefs();

		// Leave a note about this having been a Silverfox install once, in case bruni decides to add a special wizard splash if detected
		gkPrefUtils.set("Geckium.firstRun.wasSilverfox").bool(true);

		/**
		 *  Apply a pre-defined toolbar layout to re-add the icon to the top-left
		 * 
		 *  FIXME: Geckium should do the same for itself so we can remove this
		 *        from Silverfox-only code, and the below restart.
		 */
		gkPrefUtils.set("browser.uiCustomization.state").string(`
		{"placements":{
			"widget-overflow-fixed-list":[],
			"unified-extensions-area":[],
			"nav-bar":[
				"back-button","forward-button","stop-reload-button","urlbar-container",
				"downloads-button","unified-extensions-button","gsettings-button",
				"page-button","chrome-button"
			],
			"toolbar-menubar":["menubar-items"],
			"TabsToolbar":[
				"fxa-toolbar-menu-button","tabbrowser-tabs","new-tab-button",
				"alltabs-button"
			],
			"PersonalToolbar":["personal-bookmarks"]},
			"seen":["save-to-pocket-button","developer-button"],
			"currentVersion":19,"newElementCount":4}
		`);
		_ucUtils.restart(false); // Required to reload toolbar-layout
	}

	// NOTE: The call for the migrator can be found at Geckium_wizard.uc.js.
}