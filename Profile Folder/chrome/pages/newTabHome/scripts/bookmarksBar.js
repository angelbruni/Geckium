function applyBookmarkAttr() {
	const header = document.getElementById("header");
	const bookmarkBarPref = pref("browser.toolbars.bookmarks.visibility").tryGet.string();

	header.setAttribute("pref", bookmarkBarPref);
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