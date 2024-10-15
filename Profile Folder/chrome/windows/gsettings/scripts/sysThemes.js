// Theme Modes
async function disableTheme() {
	if (!gkPrefUtils.tryGet("extensions.activeThemeID").string.startsWith("default-theme@")) {
		var addon = await AddonManager.getAddonByID(gkPrefUtils.tryGet("extensions.activeThemeID").string);
		addon.disable();
	}
}

// System Themes
async function applySysTheme(themeid) {
	// Applies themeid as the System Theme, and disables themes
	gkPrefUtils.set("Geckium.appearance.systemTheme").string(themeid);
    disableTheme();
}

function switchAutoThumbnail() {
	let preference = gkSysTheme.getPreferredTheme(gkTitlebars.getTitlebarSpec(gkEras.getBrowserEra()));
	let tile = themesList.querySelector('button[data-systheme="auto"]');
	tile.classList.forEach(i => {
		if (i.startsWith("systheme-")) {
			tile.classList.remove(i);
		}
	})
	tile.classList.add("systheme-" + preference);
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