// ==UserScript==
// @name        Geckium - Utils
// @description Utilities for making coding easier. Taken from BeautyFox.
// @author      AngelBruni
// @loadorder   1
// @include     main
// @include		about:preferences*
// @include		about:addons*
// ==/UserScript==

// Firefox version check
const ffVersion = AppConstants.MOZ_APP_VERSION_DISPLAY;
const majorVersion = parseInt(ffVersion.split(".")[0]);
const checkedVersions = [117, 120, 133, 134];
checkedVersions.forEach(version => {
	if (majorVersion >= version)
		document.documentElement.setAttribute(`is${version}Plus`, true);
});

const { gkPrefUtils, gkInsertElm, gkSetAttributes } = ChromeUtils.importESModule("chrome://modules/content/GeckiumUtils.sys.mjs");
const { AddonManager } = ChromeUtils.importESModule("resource://gre/modules/AddonManager.sys.mjs");

function isWindows10() {
	if (AppConstants.platform == "win") {
		if (!window.matchMedia("(-moz-platform: windows-win7)").matches && !window.matchMedia("(-moz-platform: windows-win8)").matches
		   && !window.matchMedia("(-moz-platform: windows-winvista)").matches && !window.matchMedia("(-moz-platform: windows-winxp)").matches)
			return true;
	}
	return false;
}

function getNCPatched() {
	if (AppConstants.platform == "win") {
		if (window.matchMedia("(-moz-ev-native-controls-patch)").matches) // Native Controls Patch
			return "patch";
        else if (isWindows10() && window.matchMedia("(-moz-native-controls)").matches) // Marble
			return "marble";
		else if ((!is117Plus && window.matchMedia("(-moz-platform: windows-win7)").matches) || (!is117Plus && window.matchMedia("(-moz-platform: windows-win8)").matches)) // From Firefox 115 itself running in Windows 7/8
			return "native"
    }
	return null;
}
const isNCPatched = getNCPatched();

const isBrowserWindow = window.location.href == "chrome://browser/content/browser.xhtml" && document.querySelector(`#main-window`).getAttribute("windowtype") == "navigator:browser";
const isBrowserPopUpWindow = isBrowserWindow && document.querySelector(`#main-window`).getAttribute("chromehidden").includes("menubar toolbar");

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
        if (document.querySelector(selector))
            return resolve(document.querySelector(selector));

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

// Since there's no other way to get the actual DPI (`window.devicePixelRatio` only returns the pixel ratio which is not the same), we do this.
function getStandardizedDPI() {
    const { displayDPI } = window.windowUtils;
    const scalingFactor = displayDPI / 96;

    let standardizedDPI;
    if (scalingFactor < 1.25)
        standardizedDPI = 96; // 100% scaling
    else if (scalingFactor < 1.5)
        standardizedDPI = 120; // 125% scaling
    else if (scalingFactor < 1.75)
        standardizedDPI = 144; // 150% scaling
    else if (scalingFactor < 2)
        standardizedDPI = 168; // 175% scaling
	else if (scalingFactor < 2.25)
        standardizedDPI = 192; // 200% scaling
	else if (scalingFactor < 2.5)
        standardizedDPI = 216; // 225% scaling
	else if (scalingFactor < 3)
        standardizedDPI = 240; // 250% scaling
	else if (scalingFactor < 4)
        standardizedDPI = 288; // 300% scaling
	else if (scalingFactor < 5)
        standardizedDPI = 384; // 400% scaling
	else
        standardizedDPI = 480; // 500% scaling

    return standardizedDPI;
}