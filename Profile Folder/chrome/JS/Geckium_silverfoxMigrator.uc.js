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
				gkPrefUtils.set("Geckium.appearance.titlebarStyle").string("win");
			}
			if (gkPrefUtils.tryGet("silverfox.disableSystemThemeIcons").bool) {
				// Disable System Icons in Toolbarbuttons
				gkPrefUtils.set("Geckium.appearance.GTKIcons").int(2);
			}
		}

		//Theme
		const lwtheme = gkPrefUtils.tryGet("extensions.activeThemeID").string;
		if (lwtheme.startsWith("firefox-compact-light@") ||
			lwtheme.startsWith("firefox-compact-dark@")) {
			if (AppConstants.platform != "win" && !gkPrefUtils.tryGet("silverfox.forceWindowsStyling").bool) {
				// On Linux and macOS, set the System Theme to Classic to match Silverfox's former behaviour
				gkPrefUtils.set("Geckium.appearance.systemTheme").string("classic");
			} else if (lwtheme.startsWith("firefox-compact-light@")) {
				// On Windows, enable Compact Borders to match Silverfox's former behaviour
				gkPrefUtils.set("Geckium.appearance.titlebarNative").int(2);
			}
		}

		//Branding
		if (gkPrefUtils.tryGet("silverfox.beChromium").bool)
			gkPrefUtils.set("Geckium.branding.choice").string("chromium");
		else
			gkPrefUtils.set("Geckium.branding.choice").string("chrome");

		//Era
		if (gkPrefUtils.tryGet("silverfox.preferOldLook").bool)
			gkPrefUtils.set("Geckium.appearance.choice").int(17);
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
		if (pfp == "custom" || pfp == "animated" || pfp == "chrome" || pfp == "chromium") {
			// Silverfox's custom pfps no longer exist if the user replaced SF with GK - fallback to:
			if (!gkPrefUtils.tryGet("services.sync.username").string) {
				//  The Geckium user picture if not signed in
				gkPrefUtils.set("Geckium.profilepic.mode").string("geckium");
			}
		} else if (pfp != "off" && pfp != "") {
			gkPrefUtils.set("Geckium.profilepic.mode").string("chromium");
			gkPrefUtils.set("Geckium.profilepic.chromiumIndex").int(pfps[pfp]);
		}

		// Finishing touches
		// Apply Silverfox's Apps list
		gkPrefUtils.set("Geckium.newTabHome.appsList").string(JSON.stringify([
		{
			"favicons": {
				"2011": "chrome://userchrome/content/pages/newTabHome/assets/chrome-11/imgs/IDR_PRODUCT_LOGO_16.png"
			},
			"icons": {
				"2011": "chrome://userchrome/content/assets/img/app_icons/2011/chrome_webstore/128.png",
				"2013": "chrome://userchrome/content/assets/img/app_icons/2013/chrome_webstore/128.png",
				"2015": "chrome://userchrome/content/assets/img/app_icons/2015/chrome_webstore/128.png"
			},
			"names": {
				"2011": "Web Store",
				"2013": "Store"
			},
			"url": "https://addons.mozilla.org/en-US/firefox",
			"type": "tab"
		},
		{
			"favicons": {
				"2011": "chrome://userchrome/content/assets/img/app_icons/2011/gmail/24.png"
			},
			"icons": {
				"2011": "chrome://userchrome/content/assets/img/app_icons/2011/gmail/128.png",
				"2012": "chrome://userchrome/content/assets/img/app_icons/2012/gmail/128.png"
			},
			"names": {
				"2011": "Gmail"
			},
			"url": "https://mail.google.com/",
			"type": "tab"
		},
		{
			"favicons": {
				"2011": "chrome://userchrome/content/assets/img/app_icons/2013/drive/128.png"
			},
			"icons": {
				"2011": "chrome://userchrome/content/assets/img/app_icons/2013/drive/128.png"
			},
			"names": {
				"2011": "Google Drive"
			},
			"url": "https://drive.google.com/",
			"type": "tab"
		},
		{
			"favicons": {
				"2011": "chrome://userchrome/content/assets/img/app_icons/2011/search/16.png"
			},
			"icons": {
				"2011": "chrome://userchrome/content/assets/img/app_icons/2011/search/128.png",
				"2012": "chrome://userchrome/content/assets/img/app_icons/2012/search/128.png"
			},
			"names": {
				"2011": "Google Search"
			},
			"url": "https://www.google.com/",
			"type": "tab"
		},
		{
			"favicons": {
				"2011": "chrome://userchrome/content/assets/img/app_icons/2011/youtube/16.svg"
			},
			"icons": {
				"2011": "chrome://userchrome/content/assets/img/app_icons/2011/youtube/128.png",
				"2012": "chrome://userchrome/content/assets/img/app_icons/2012/youtube/128.png"
			},
			"names": {
				"2011": "YouTube"
			},
			"url": "https://www.youtube.com/",
			"type": "tab"
		},
		{
			"favicons": {
				"2011": "https://github.com/florinsdistortedvision/silverfox/raw/main/theme/chrome/resources/pages/homepage/assets/angrybirds_app.png"
			},
			"icons": {
				"2011": "https://github.com/florinsdistortedvision/silverfox/raw/main/theme/chrome/resources/pages/homepage/assets/angrybirds_app.png"
			},
			"names": {
				"2011": "Angry Birds"
			},
			"url": "https://yell0wsuit.page/assets/games/angry-birds-chrome",
			"type": "tab"
		},
		{
			"favicons": {
				"2011": "https://github.com/florinsdistortedvision/silverfox/raw/main/theme/chrome/resources/pages/homepage/assets/myspace_app.svg"
			},
			"icons": {
				"2011": "https://github.com/florinsdistortedvision/silverfox/raw/main/theme/chrome/resources/pages/homepage/assets/myspace_app.svg"
			},
			"names": {
				"2011": "MySpace"
			},
			"url": "https://spacehey.com",
			"type": "tab"
		}]));

		// Enable Silverfox Firefox Theming
		gkPrefUtils.set("Geckium.customtheme.mode").string("silverfox");

		// Delete leftover Silverfox settings
		this.deleteSfPrefs();

		// Leave a note about this having been a Silverfox install once, in case bruni decides to add a special wizard splash if detected
		gkPrefUtils.set("Geckium.firstRun.wasSilverfox").bool(true);

		// Remove Pocket from the toolbar
		CustomizableUI.removeWidgetFromArea("save-to-pocket-button");
	}

	// NOTE: The call for the migrator can be found at Geckium_wizard.uc.js.
}