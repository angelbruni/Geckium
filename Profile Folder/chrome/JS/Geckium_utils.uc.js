// ==UserScript==
// @name        Geckium - Utils
// @description Utilities for making coding easier. Taken from BeautyFox.
// @author      AngelBruni
// @loadorder   1
// @include     main
// @include		about:preferences*
// @include		about:addons*
// ==/UserScript==

const { gkPrefUtils, gkInsertElm, gkSetAttributes } = ChromeUtils.importESModule("chrome://modules/content/GeckiumUtils.sys.mjs");
const { AddonManager } = ChromeUtils.importESModule("resource://gre/modules/AddonManager.sys.mjs");

const isNCPatched = window.matchMedia("(-moz-ev-native-controls-patch)").matches;
const isBrowserWindow = window.location.href == "chrome://browser/content/browser.xhtml" && document.querySelector(`#main-window`).getAttribute("windowtype") == "navigator:browser";
const isBrowserPopUpWindow = isBrowserWindow && document.querySelector(`#main-window`).getAttribute("chromehidden") == "menubar toolbar directories extrachrome ";

function openWindow(windowName, features) {
	window.openDialog('chrome://windows/content/'+ windowName +'/index.xhtml', '', features);
}

function updateZoomLabel() {
	const currentZoomLevel = gBrowser.ownerGlobal.gNavigatorBundle.getFormattedString("zoom-button.label", [ Math.round(gBrowser.ownerGlobal.ZoomManager.zoom * 100), ]); 

	const menuZoomElm = document.getElementById("menu_normal6");
	if (menuZoomElm)
		menuZoomElm.setAttribute('label', currentZoomLevel);
}
window.addEventListener("FullZoomChange", updateZoomLabel);
window.addEventListener("TabAttrModified", updateZoomLabel);

function bookmarksBarStatus() {
	const alwaysShowBookmarksBar = document.getElementById('menu_alwaysShowBookmarksBar5');

	if (gkPrefUtils.tryGet("browser.toolbars.bookmarks.visibility").string == 'always') {
		gkSetAttributes(alwaysShowBookmarksBar, {
			"checked": true,
			"data-visibility-enum": "newtab",
		})
	} else {
		gkSetAttributes(alwaysShowBookmarksBar, {
			"checked": false,
			"data-visibility-enum": "always",
		})
	}

	alwaysShowBookmarksBar.setAttribute("data-bookmarks-toolbar-visibility", true);

	const menuShowBookmarks = document.getElementById('menu_showBookmarks');

	if (gkPrefUtils.tryGet('browser.toolbars.bookmarks.visibility').string == 'always') {
		gkSetAttributes(menuShowBookmarks, {
			"checked": true,
			"data-visibility-enum": "newtab",
		})
	} else {
		gkSetAttributes(menuShowBookmarks, {
			"checked": false,
			"data-visibility-enum": "always",
		})
	}

	menuShowBookmarks.setAttribute("data-bookmarks-toolbar-visibility", true);
}

function updateMenuTooltipLocale() {
	const gkMenuBundle = Services.strings.createBundle("chrome://geckium/locale/properties/menu.properties");

	const menuTooltip = document.getElementById("chrome-button");
	menuTooltip.setAttribute("tooltiptext", gkMenuBundle.GetStringFromName("customizeAndControlGoogleChrome").replace("%s", gkBranding.getBrandingKey("fullName", false)));
}

function updateAboutLocale() {
	const gkMenuBundle = Services.strings.createBundle("chrome://geckium/locale/properties/menu.properties");
	
	const menuAbout = document.getElementById("menu_about");
	menuAbout.setAttribute("label", gkMenuBundle.GetStringFromName("about").replace("%s", gkBranding.getBrandingKey("fullName", false)));
}

function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });

        // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}