// ==UserScript==
// @name        Geckium - Updater
// @author		AngelBruni
// @description	Checks for Geckium updates.
// @loadorder   2
// @include		main
// ==/UserScript==

const { gkUpdater } = ChromeUtils.importESModule("chrome://modules/content/GeckiumUpdater.sys.mjs");

const sfValues = ["silverfox.beChromium", "silverfox.beChromeOS", "silverfox.disableSystemThemeIcons", "silverfox.preferOldLook", "silverfox.hasLocalImage", "silverfox.usepfp", "silverfox.forceWindowsStyling"]
function wasSilverfox() { // thanks, Silverfox...
	for (i in sfValues) {
		if (gkPrefUtils.prefExists(sfValues[i])) {
			return true
		}
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
	] //NOTE: browser.startup.homepage_override.mstone is always overridden before Geckium can access it, so has been omitted
	var matches = 0;
    for (i in sfUserJS) {
        if (sfUserJS[i]["type"] == "bool") {
            if (gkPrefUtils.tryGet(sfUserJS[i]["id"]).bool == sfUserJS[i]["value"]) {
                matches += 1
            }
        } else if (sfUserJS[i]["type"] == "int") {
            if (gkPrefUtils.tryGet(sfUserJS[i]["id"]).int == sfUserJS[i]["value"]) {
                matches += 1
            }
        } else if (sfUserJS[i]["type"] == "string") {
            if (gkPrefUtils.tryGet(sfUserJS[i]["id"]).string == sfUserJS[i]["value"]) {
                matches += 1
            }
        }
    }
    if (matches == sfUserJS.length) {
        return true;
    }
    return false;
}

function transitionSilverfox() {
    const isDefaultTheme = gkPrefUtils.tryGet("extensions.activeThemeID").string.includes("default-theme");

    //Linux
    if (AppConstants.platform == "linux") {
        if (gkPrefUtils.tryGet("silverfox.beChromeOS").bool) {
            // Be Chrome OS
            gkPrefUtils.set("Geckium.appearance.classicCaptionStyle").string("chromeos");
        } else if (gkPrefUtils.tryGet("silverfox.forceWindowsStyling").bool) {
            // Force Windows Styling
            gkPrefUtils.set("Geckium.appearance.classicCaptionStyle").string("windows");
        }
    }

    //Branding
    if (gkPrefUtils.tryGet("silverfox.beChromium").bool) {
        gkPrefUtils.set("Geckium.branding.choice").int(2); // Chromium
    } else {
        gkPrefUtils.set("Geckium.branding.choice").int(3); // Chrome
    }

    //Era
    if (gkPrefUtils.tryGet("silverfox.preferOldLook").bool) {
        gkPrefUtils.set("Geckium.appearance.choice").int(5); // 11
    } else {
        gkPrefUtils.set("Geckium.appearance.choice").int(7); // 25
    }

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
    if (pfp == "off") {
        // Apply a pre-defined toolbar layout to remove Mozilla's items Geckium re-displays
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
            "TabsToolbar":["tabbrowser-tabs","new-tab-button","alltabs-button"],
            "PersonalToolbar":["personal-bookmarks"]},
            "seen":["save-to-pocket-button","developer-button"],
            "currentVersion":19,"newElementCount":4}
        `);
    } else {
        gkPrefUtils.set("Geckium.profilepic.button").bool(true);
        if (pfp == "custom" || pfp == "animated" || pfp == "chrome" || pfp == "chromium") {
            // Silverfox's custom pfps no longer exist if the user replaced SF with GK - fallback to Geckium.
            gkPrefUtils.set("Geckium.profilepic.mode").int(0);
        } else {
            gkPrefUtils.set("Geckium.profilepic.mode").int(1);
            gkPrefUtils.set("Geckium.profilepic.chromiumIndex").int(pfps[pfp]);
        }
        // Apply a pre-defined toolbar layout to re-add the icon to the top-left
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
    }

    //Finishing touches
    // Disable Tab Manager
    gkPrefUtils.set("browser.tabs.tabmanager.enabled").bool(false);
    // Apply Silverfox's Apps list
    gkPrefUtils.set("Geckium.newTabHome.appsList").string(`
    {
        "0": {
            "pos": 0,
            "favicon": "chrome://userchrome/content/pages/newTabHome/assets/chrome-11/imgs/IDR_PRODUCT_LOGO_16.png",
            "oldIcon": "",
            "newIcon": "chrome://userchrome/content/pages/newTabHome/assets/chrome-21/imgs/1.png",
            "oldName": "Web Store",
            "newName": "Web Store",
            "url": "https://addons.mozilla.org/en-US/firefox",
            "type": 0
        },
        "1": {
            "pos": 1,
            "favicon": "https://github.com/florinsdistortedvision/silverfox/raw/main/theme/chrome/resources/pages/homepage/assets/gmail_app.png",
            "oldIcon": "",
            "newIcon": "https://github.com/florinsdistortedvision/silverfox/raw/main/theme/chrome/resources/pages/homepage/assets/gmail_app.png",
            "oldName": "Gmail",
            "newName": "Gmail",
            "url": "https://mail.google.com",
            "type": 0
        },
        "2": {
            "pos": 2,
            "favicon": "https://github.com/florinsdistortedvision/silverfox/raw/main/theme/chrome/resources/pages/homepage/assets/drive_app.png",
            "oldIcon": "",
            "newIcon": "https://github.com/florinsdistortedvision/silverfox/raw/main/theme/chrome/resources/pages/homepage/assets/drive_app.png",
            "oldName": "Google Drive",
            "newName": "Google Drive",
            "url": "https://drive.google.com",
            "type": 0
        },
        "3": {
            "pos": 3,
            "favicon": "https://github.com/florinsdistortedvision/silverfox/raw/main/theme/chrome/resources/pages/homepage/assets/google_app.png",
            "oldIcon": "",
            "newIcon": "https://github.com/florinsdistortedvision/silverfox/raw/main/theme/chrome/resources/pages/homepage/assets/google_app.png",
            "oldName": "Google Search",
            "newName": "Google Search",
            "url": "https://www.google.com",
            "type": 0
        },
        "4": {
            "pos": 4,
            "favicon": "https://github.com/florinsdistortedvision/silverfox/raw/main/theme/chrome/resources/pages/homepage/assets/youtube_app.png",
            "oldIcon": "",
            "newIcon": "https://github.com/florinsdistortedvision/silverfox/raw/main/theme/chrome/resources/pages/homepage/assets/youtube_app.png",
            "oldName": "YouTube",
            "newName": "YouTube",
            "url": "https://www.youtube.com",
            "type": 0
        },
        "5": {
            "pos": 5,
            "favicon": "https://github.com/florinsdistortedvision/silverfox/raw/main/theme/chrome/resources/pages/homepage/assets/angrybirds_app.png",
            "oldIcon": "",
            "newIcon": "https://github.com/florinsdistortedvision/silverfox/raw/main/theme/chrome/resources/pages/homepage/assets/angrybirds_app.png",
            "oldName": "Angry Birds",
            "newName": "Angry Birds",
            "url": "https://yell0wsuit.page/assets/games/angry-birds-chrome",
            "type": 0
        },
        "6": {
            "pos": 6,
            "favicon": "https://github.com/florinsdistortedvision/silverfox/raw/main/theme/chrome/resources/pages/homepage/assets/myspace_app.svg",
            "oldIcon": "",
            "newIcon": "https://github.com/florinsdistortedvision/silverfox/raw/main/theme/chrome/resources/pages/homepage/assets/myspace_app.svg",
            "oldName": "MySpace",
            "newName": "MySpace",
            "url": "https://spacehey.com",
            "type": 0
        }
    }
    `);
    // Enable Silverfox Firefox Theming
    gkPrefUtils.set("Geckium.customtheme.mode").int(1);
    // Delete leftover Silverfox settings
    for (i in sfValues) {
        if (gkPrefUtils.prefExists(sfValues[i])) {
            Services.prefs.clearUserPref(sfValues[i]);
        }
    }
    // Leave a note about this having been a Silverfox install once, in case bruni decides to add a special wizard splash if detected
    gkPrefUtils.set("Geckium.firstRun.wasSilverfox").bool(true);
}

if (!gkPrefUtils.tryGet("Geckium.firstRun.complete").bool && wasSilverfox()) {
    transitionSilverfox();
}
(async () => {
    if (gkPrefUtils.tryGet("Geckium.version.current").string !== await gkUpdater.getVersion()) {
        console.warn("MISMATCHED VERSION! Updating...");

		gkPrefUtils.set("Geckium.version.current").string(await gkUpdater.getVersion());
		_ucUtils.restart(true);
    }
})();