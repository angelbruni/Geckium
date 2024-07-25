const themesList = document.getElementById("themes-grid");

async function selectSysTheme() {
	let prefChoice = gkPrefUtils.tryGet("Geckium.appearance.systemTheme").string;
	if (!gkSysTheme.systhemes.includes(prefChoice) && prefChoice != "auto") {
		prefChoice = "auto";
	}
	// Mark the current System Theme as fallback
	themesList.querySelectorAll("button[data-systheme]").forEach(item => {
		if (item.dataset.systheme == prefChoice) {
			item.querySelector(".year").style.removeProperty("display");
		} else {
			item.querySelector(".year").style.setProperty("display", "none");
		}
	})
	// Select the theme if not using a Chromium Theme nor LWTheme
	let chrChoice = gkPrefUtils.tryGet("Geckium.chrTheme.fileName").string;
	if (gkPrefUtils.tryGet("extensions.activeThemeID").string.startsWith("default-theme@") && !chrChoice) {
		themesList.querySelector(`button[data-systheme="${prefChoice}"] input[type="radio"]`).checked = true;
	} else {
		themesList.querySelectorAll("button[data-systheme]").forEach(item => {
			item.checked = false;
		})
	}
}
document.addEventListener("DOMContentLoaded", selectSysTheme);
const sysThemeGridObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			selectSysTheme();
		}
	},
};
Services.prefs.addObserver("extensions.activeThemeID", sysThemeGridObserver, false);
Services.prefs.addObserver("Geckium.appearance.systemTheme", sysThemeGridObserver, false);
Services.prefs.addObserver("Geckium.chrTheme.fileName", sysThemeGridObserver, false);

async function applySysTheme(themeid) {
	// Applies themeid as the System Theme, and disables themes
	gkPrefUtils.set("Geckium.appearance.systemTheme").string(themeid);
    if (!gkPrefUtils.tryGet("extensions.activeThemeID").string.startsWith("default-theme@")) {
		const addon = await AddonManager.getAddonByID(gkPrefUtils.tryGet("extensions.activeThemeID").string);
		addon.disable();
	}
}

async function openLWThemesPage() {
	try {
		Services.wm.getMostRecentWindow('navigator:browser').BrowserAddonUI.openAddonsMgr("addons://list/theme"); // 128+
	} catch {
		Services.wm.getMostRecentWindow('navigator:browser').BrowserOpenAddonsMgr("addons://list/theme"); // 115
	}
}

function switchAutoThumbnail() {
	let preference = gkSysTheme.getPreferredTheme(gkTitlebars.getTitlebarSpec(gkEras.getBrowserEra()));
	let tile = themesList.querySelector('button[data-systheme="auto"]');
	tile.classList.forEach(i => {
		if (i.startsWith("gktheme-")) {
			tile.classList.remove(i);
		}
	})
	tile.classList.add("gktheme-" + preference);
}
document.addEventListener("DOMContentLoaded", switchAutoThumbnail);
const autoObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			switchAutoThumbnail();
		}
	},
};
Services.prefs.addObserver("Geckium.appearance.choice", autoObserver, false);
Services.prefs.addObserver("Geckium.main.overrideStyle", autoObserver, false);
Services.prefs.addObserver("Geckium.main.style", autoObserver, false);
Services.prefs.addObserver("Geckium.appearance.titlebarStyle", autoObserver, false);