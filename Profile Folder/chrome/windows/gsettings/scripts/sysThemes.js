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
	let lwChoice = gkPrefUtils.tryGet("extensions.activeThemeID").string;
    if (lwChoice.startsWith("default-theme@") || (lwChoice.startsWith("firefox-compact-light@") && !chrChoice) ||
			lwChoice.startsWith("firefox-compact-dark@")) {
		themesList.querySelector(`button[data-systheme="${prefChoice}"] input[type="radio"]`).checked = true;
		// Select appropriate theme mode
		if (lwChoice.startsWith("firefox-compact-light@")) {
			document.getElementById("thememode-light").checked = true;
		} else if (lwChoice.startsWith("firefox-compact-dark@")) {
			document.getElementById("thememode-dark").checked = true;
		} else {
			document.getElementById("thememode-auto").checked = true;
		}
	} else {
		themesList.querySelectorAll("button[data-systheme]").forEach(item => {
			item.checked = false;
		})
	}
}
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