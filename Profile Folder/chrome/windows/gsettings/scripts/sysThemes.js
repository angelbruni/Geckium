const themesList = document.getElementById("systhemes-grid");

async function selectSysTheme() {
	let prefChoice = gkPrefUtils.tryGet("Geckium.appearance.systemTheme").string;
	if (!gkSysTheme.systhemes.includes(prefChoice) && prefChoice != "auto") {
		prefChoice = "auto";
	}
	themesList.querySelector(`button[data-systheme="${prefChoice}"] input[type="radio"]`).checked = true;
}
document.addEventListener("DOMContentLoaded", selectSysTheme);
const sysThemeGridObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			selectSysTheme();
		}
	},
};
Services.prefs.addObserver("Geckium.appearance.systemTheme", sysThemeGridObserver, false);

async function applySysTheme(themeid) {
	gkPrefUtils.set("Geckium.appearance.systemTheme").string(themeid);
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