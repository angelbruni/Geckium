// ==UserScript==
// @name        Geckium - Appearance
// @author		AngelBruni
// @description	Settings the desired appearance chosen by the user accordingly.
// @loadorder   2
// @include		main
// @include		about:preferences*
// @include		about:addons*
// ==/UserScript==

function changePrivateBadgePos() {
	if (typeof document.documentElement !== "undefined") {
		if (document.documentElement.hasAttribute("privatebrowsingmode")) {
			const privateBrowsingIndicatorWithLabel = document.getElementById("private-browsing-indicator-with-label");
			const titlebarSpacer = document.querySelector(".titlebar-spacer");
	
			gkInsertElm.before(privateBrowsingIndicatorWithLabel, titlebarSpacer);
		}
	}
}
window.addEventListener("load", changePrivateBadgePos);
