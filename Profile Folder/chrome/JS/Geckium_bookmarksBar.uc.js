// ==UserScript==
// @name        Geckium - Bookmarks Bar
// @author      AngelBruni
// @loadorder   3
// ==/UserScript==

function applyBookmarkAttr() {
	const bookmarkBarPref = gkPrefUtils.tryGet("browser.toolbars.bookmarks.visibility").string;
	document.documentElement.setAttribute("personalbar", bookmarkBarPref);

	const navigatorToolbox = document.getElementById("navigator-toolbox");
	
	const personalToolbar = document.getElementById("PersonalToolbar");

	let notificationBoxStack = document.querySelector("#navigator-toolbox > vbox.global-notificationbox");
	
	/* bruni:	By creating the notificationbox-stack element before
				Firefox and setting it as the stack, we ensure infobar
				contents to not break, since moving the stack is what
				causes them to break, however, this also means that on
				anything lower than 128, moving the stack will first
				remove all notifications, meaning that having a
				notification and changing bookmarks to newtab/always
				showing will remove all notifications before moving
				the stack. */
	if (!notificationBoxStack) {
		notificationBoxStack = document.createXULElement("vbox");
		notificationBoxStack.classList.add("notificationbox-stack", "global-notificationbox");
		notificationBoxStack.setAttribute("notificationside", "top");
		gkInsertElm.before(notificationBoxStack, personalToolbar);
		
		window.gNotificationBox._stack = notificationBoxStack;
		window.gNotificationBox._stack.closest(".notificationbox-stack")._notificationBox = window.gNotificationBox;
	}

	notificationBoxStack.removeAttribute("prepend-notifications");

	if (parseInt(Services.appinfo.version.split(".")[0]) < 128) {
		notificationBoxStack.querySelectorAll("notification-message").forEach(notification => {
			notification.remove();
		});
	}

	if (bookmarkBarPref == "newtab") {
		gkInsertElm.before(notificationBoxStack, personalToolbar);
	} else {
		navigatorToolbox.appendChild(notificationBoxStack);
	}
}

const bookmarkBarPrefObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			applyBookmarkAttr();
		}
	}
};
Services.prefs.addObserver("browser.toolbars.bookmarks.visibility", bookmarkBarPrefObserver, false)
UC_API.Runtime.startupFinished().then(() => {
	applyBookmarkAttr();
});

UC_API.Runtime.startupFinished().then(() => {
	const personalToolbarBackground = document.createElement("div");
	personalToolbarBackground.id = "personal-toolbar-bg";

	const personalToolbarFloatingBackground = document.createElement("div");
	personalToolbarFloatingBackground.id = "personal-toolbar-floating-bg";

	document.getElementById("PersonalToolbar").prepend(personalToolbarFloatingBackground);
	document.getElementById("PersonalToolbar").prepend(personalToolbarBackground);
});