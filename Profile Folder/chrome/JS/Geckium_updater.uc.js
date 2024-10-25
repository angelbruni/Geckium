// ==UserScript==
// @name        Geckium - Updater
// @author		AngelBruni
// @description	Checks for Geckium updates.
// @loadorder   2
// @include		main
// ==/UserScript==

const { gkUpdater } = ChromeUtils.importESModule("chrome://modules/content/GeckiumUpdater.sys.mjs");
const configIteration = 4;

(async () => {
    let ver = gkPrefUtils.tryGet("Geckium.version.current").string;
    let iter = gkPrefUtils.tryGet("Geckium.version.iteration").int;
    let verMismatch = (ver !== await gkUpdater.getVersion());
    if (verMismatch || iter < configIteration) {
        console.warn("MISMATCHED VERSION OR ITERATION! Updating...");
        
        updateSettings(iter);
		UC_API.Prefs.set("Geckium.version.current", await gkUpdater.getVersion());
		setTimeout(() => {
            UC_API.Runtime.restart(verMismatch); // Don't clear cache unless Geckium itself was updated
        }, 1000); /* bruno: We add a timeout because apparently the new version
                            of fx-autoconfig can't restart all windows if done
                            too quickly, leaving the GSplash window open. */
    }
    if (gkPrefUtils.tryGet("toolkit.legacyUserProfileCustomizations.stylesheets").bool == false) {
		UC_API.Prefs.set("toolkit.legacyUserProfileCustomizations.stylesheets", true);		// Ensure they're ALWAYS on
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
        UC_API.Prefs.set("toolkit.legacyUserProfileCustomizations.stylesheets", true);		// Turn on legacy stylesheets

        if (AppConstants.platform == "win") {
            UC_API.Prefs.set("widget.ev-native-controls-patch.override-win-version", 7);		// Force aero
            UC_API.Prefs.set("gfx.webrender.dcomp-win.enabled", false);						// Disable dcomp
            UC_API.Prefs.set("browser.display.windows.non_native_menus", 0);
            UC_API.Prefs.set("browser.startup.blankWindow", false);                         // Disable Firefox's splash screen
        }

        UC_API.Prefs.set("browser.tabs.tabmanager.enabled", false);                         // Disable that context-inappropriate chevron
	    UC_API.Prefs.set("browser.urlbar.showSearchTerms.enabled", false);				    // Show URL after a search in URLbar
        UC_API.Prefs.set("browser.urlbar.trimURLs", false);                                 // Show protocol in URL in URLbar
	    UC_API.Prefs.set("browser.newtab.preload", false)									// Disable New Tab preload to prevent new data from not loading
        UC_API.Prefs.set("browser.theme.dark-private-windows", false);						// Disable incognito dark mode
        UC_API.Prefs.set("widget.gtk.overlay-scrollbars.enabled", false);                   // Disable GTK3's overlay scrollbars (Linux)
        UC_API.Prefs.set("widget.gtk.non-native-titlebar-buttons.enabled", false);          // Disable non-native titlebar buttons in Light and Dark (Linux, 128+)

	    if (!gkPrefUtils.tryGet("Geckium.newTabHome.appsList").string) {
		    UC_API.Prefs.set("Geckium.newTabHome.appsList", `
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
        UC_API.Prefs.set("widget.non-native-theme.enabled", false); // Allow native theme colours to be used in specific pages
    }
    if (iteration < 3) {
        UC_API.Prefs.set("browser.tabs.hoverPreview.enabled", false);   // Disable tab preview thumbnails
    }
    if (iteration < 4) {
        UC_API.Prefs.set("userChromeJS.persistent_domcontent_callback", true);  // Enable hack that allows Geckium to have the ability to inject itself in `about:` pages
    }
    // Put future settings changes down here as < 5, and so on.

    if (iteration < configIteration)
        UC_API.Prefs.set("Geckium.version.iteration", configIteration);
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