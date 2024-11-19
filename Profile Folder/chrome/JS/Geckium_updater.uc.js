// ==UserScript==
// @name        Geckium - Updater
// @author		AngelBruni
// @description	Checks for Geckium updates.
// @loadorder   2
// @include		main
// ==/UserScript==

const { gkUpdater } = ChromeUtils.importESModule("chrome://modules/content/GeckiumUpdater.sys.mjs");
const configIteration = 5;

(async () => {
	let ver = gkPrefUtils.tryGet("Geckium.version.current").string;
	let iter = gkPrefUtils.tryGet("Geckium.version.iteration").int;
	let verMismatch = (ver !== await gkUpdater.getVersion());
	if (verMismatch || iter < configIteration) {
		console.warn("MISMATCHED VERSION OR ITERATION! Updating...");
		
		updateSettings(iter);
		gkPrefUtils.set("Geckium.version.current").string(await gkUpdater.getVersion());
		setTimeout(() => {
			UC_API.Runtime.restart(verMismatch); // Don't clear cache unless Geckium itself was updated
		}, 1000); /* bruno: We add a timeout because apparently the new version
							of fx-autoconfig can't restart all windows if done
							too quickly, leaving the GSplash window open. */
	}
	if (gkPrefUtils.tryGet("toolkit.legacyUserProfileCustomizations.stylesheets").bool == false) {
		gkPrefUtils.set("toolkit.legacyUserProfileCustomizations.stylesheets").bool(true);		// Ensure they're ALWAYS on
		setTimeout(() => {
			UC_API.Runtime.restart(false); // No need to clear cache...?
		}, 1000);
	}
})();

/**
 * updateSettings - Appends newly added Geckium config defaults based on an iteration value that keeps track of total first-launch-about:config-override updates
 * 
 * iteration: User's current settings iteration amount
 */

function updateSettings(iteration) {
	if (iteration < 1) {
		gkPrefUtils.set("toolkit.legacyUserProfileCustomizations.stylesheets").bool(true);		// Turn on legacy stylesheets

		if (AppConstants.platform == "win") {
			gkPrefUtils.set("widget.ev-native-controls-patch.override-win-version").int(7);		// Force aero
			gkPrefUtils.set("gfx.webrender.dcomp-win.enabled").bool(false);						// Disable dcomp
			gkPrefUtils.set("browser.display.windows.non_native_menus").int(0);
			gkPrefUtils.set("browser.startup.blankWindow").bool(false);                         // Disable Firefox's splash screen
		}

		gkPrefUtils.set("browser.tabs.tabmanager.enabled").bool(false);                         // Disable that context-inappropriate chevron
		gkPrefUtils.set("browser.urlbar.showSearchTerms.enabled").bool(false);				    // Show URL after a search in URLbar
		gkPrefUtils.set("browser.urlbar.trimURLs").bool(false);                                 // Show protocol in URL in URLbar
		gkPrefUtils.set("browser.newtab.preload").bool(false)									// Disable New Tab preload to prevent new data from not loading
		gkPrefUtils.set("browser.theme.dark-private-windows").bool(false);						// Disable incognito dark mode
		gkPrefUtils.set("widget.gtk.overlay-scrollbars.enabled").bool(false);                   // Disable GTK3's overlay scrollbars (Linux)
		gkPrefUtils.set("widget.gtk.non-native-titlebar-buttons.enabled").bool(false);          // Disable non-native titlebar buttons in Light and Dark (Linux, 128+)

		if (!gkPrefUtils.tryGet("Geckium.newTabHome.appsList").string) {
			gkPrefUtils.set("Geckium.newTabHome.appsList").string(`
			{
				"0": {
					"pos": 0,
					"favicon": "chrome://userchrome/content/pages/newTabHome/assets/chrome-11/imgs/IDR_PRODUCT_LOGO_16.png",
					"oldIcon": "chrome://userchrome/content/pages/newTabHome/assets/chrome-21/imgs/1.png",
					"newIcon": "chrome://userchrome/content/pages/newTabHome/assets/chrome-21/imgs/1.png",
					"oldName": "Web Store",
					"newName": "Web Store",
					"url": "https://chromewebstore.google.com",
					"type": 0
				}
			}
			`);																			        // Add initial app if the apps list is empty
		}
	}
	if (iteration < 2) {
		gkPrefUtils.set("widget.non-native-theme.enabled").bool(false); // Allow native theme colours to be used in specific pages
	}
	if (iteration < 3) {
		gkPrefUtils.set("browser.tabs.hoverPreview.enabled").bool(false);   // Disable tab preview thumbnails
	}
	if (iteration < 4) {
		gkPrefUtils.set("userChromeJS.persistent_domcontent_callback").bool(true);  // Enable hack that allows Geckium to have the ability to inject itself in `about:` pages
	}
	if (iteration < 5) {
		CustomizableUI.removeWidgetFromArea("fxa-toolbar-menu-button");  // Remove the old avatar toolbarbutton
		if (gkPrefUtils.tryGet("Geckium.appearance.titlebarStyle").string == "winnogaps") {
			gkPrefUtils.set("Geckium.appearance.titlebarStyle").string("win8nogaps");	// Transition "Windows (no gaps)" to "Windows 8 (no gaps)"
		}
		
		// pfpMode was changed from `int` to `string`.
		try {
			const pfpMode = parseInt(Services.prefs.getIntPref("Geckium.profilepic.mode"));
			// NOTE: Using this way to make sure new Geckium users bypass this entirely
			switch (pfpMode) {
				case 0:
					gkPrefUtils.set("Geckium.profilepic.mode").string("geckium");
					break;
				case 1:
					gkPrefUtils.set("Geckium.profilepic.mode").string("chromium");
					break;
				case 3:
					gkPrefUtils.set("Geckium.profilepic.mode").string("custom");
					break;
				default:
					gkPrefUtils.set("Geckium.profilepic.mode").string("firefox");
					break;
			}
		} catch {}
		if (gkPrefUtils.tryGet("Geckium.customtheme.mode").string == "fxchrome") {
			/* bruni:	If the user had `fxchrome` selected, then we are gonna migrate to
						`geckium`, the reason for this is because `geckium` is closer to what
						`fxchrome` once was and it was also the default before Geckium got its
						own `geckium` mode.*/
			gkPrefUtils.set("Geckium.customtheme.mode").string("geckium");
		}

		// Change this pref's name to be more inline with the rest of the `devOptions` settings.
		gkPrefUtils.set("Geckium.devOptions.status").bool(gkPrefUtils.tryGet("Geckium.developerOptions.status").bool);
		gkPrefUtils.delete("Geckium.developerOptions.status");
	}
	// Put future settings changes down here as < 6, and so on.

	if (iteration < configIteration)
		gkPrefUtils.set("Geckium.version.iteration").int(configIteration);
}

// PLACEHOLDER UPDATE MECHANISM FOR GECKIUM PUBLIC BETA 1
async function gkCheckForUpdates() {
	const ghURL = "https://api.github.com/repos/angelbruni/Geckium/releases?page=1&per_page=1";

	// Fetch remote version with timestamp to prevent caching
	var gkver = await gkUpdater.getVersion();
	fetch(ghURL, {cache: "reload", headers: {"X-GitHub-Api-Version": "2022-11-28", "Accept": "application/vnd.github+json",}})
		.then((response) => response.json())
		.then((releases) => {
			if (releases[0].tag_name !== gkver) {
				document.documentElement.setAttribute("gkcanupdate", "true");
			}
		})
		.catch(error => {
			console.error("Something happened when checking for newer Geckium builds:", error);
		});
}
window.addEventListener("load", gkCheckForUpdates);