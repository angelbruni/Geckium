function applyBookmarkAttr() {
	const bookmarkBarPref = pref("browser.toolbars.bookmarks.visibility").tryGet.string();

	document.body.setAttribute("pref", bookmarkBarPref);
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