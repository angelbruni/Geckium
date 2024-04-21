// ==UserScript==
// @name        Geckium - Bookmarks Bar
// @author      AngelBruni
// @loadorder   3
// ==/UserScript==

function applyBookmarkAttr() {
	const bookmarkBarPref = pref("browser.toolbars.bookmarks.visibility").tryGet.string();

	docElm.setAttribute("personalbar", bookmarkBarPref);
}

const bookmarkBarPrefObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			applyBookmarkAttr();
		}
	}
};
Services.prefs.addObserver("browser.toolbars.bookmarks.visibility", bookmarkBarPrefObserver, false)
window.addEventListener("load", applyBookmarkAttr);