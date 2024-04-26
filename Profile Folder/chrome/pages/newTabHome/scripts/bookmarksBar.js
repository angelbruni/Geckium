function applyBookmarkAttr() {;
	const bookmarkBarPref = gkPrefUtils.tryGet("browser.toolbars.bookmarks.visibility").string;

	document.documentElement.setAttribute("pref", bookmarkBarPref);
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