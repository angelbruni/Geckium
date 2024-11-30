const { gkUpdater } = ChromeUtils.importESModule("chrome://modules/content/GeckiumUpdater.sys.mjs");

function loadVersion() {
	document.querySelectorAll(".version-identifier").forEach(async identifier => {
		identifier.textContent = await gkUpdater.getVersion();
	})
}
document.addEventListener("DOMContentLoaded", loadVersion);

function openWizardFromSplash(reset) {
	if (reset) {
		startFromScratch();
	}
	gkWindow.close();
	openGWizard();
}

function startFromScratch() {
	Services.prefs.clearUserPref("Geckium.appearance.titlebarStyle");
	Services.prefs.clearUserPref("Geckium.appearance.GTKIcons");
	Services.prefs.clearUserPref("Geckium.appearance.systemTheme");
	Services.prefs.clearUserPref("Geckium.appearance.titlebarNative");
	Services.prefs.clearUserPref("Geckium.branding.choice");
	Services.prefs.clearUserPref("Geckium.appearance.choice");
	Services.prefs.clearUserPref("Geckium.profilepic.mode");
	Services.prefs.clearUserPref("Geckium.profilepic.chromiumIndex");
	Services.prefs.clearUserPref("Geckium.customtheme.mode");
	UC_API.Prefs.set("Geckium.newTabHome.appsList", `
{
	"0": {
		"pos": 0,
		"favicon": "chrome://userchrome/content/pages/newTabHome/assets/chrome-11/imgs/IDR_PRODUCT_LOGO_16.png",
		"oldIcon": "chrome://userchrome/content/pages/newTabHome/assets/chrome-21/imgs/1.png",
		"newIcon": "chrome://userchrome/content/pages/newTabHome/assets/chrome-21/imgs/1.png",
		"oldName": "Web Store",
		"newName": "Web Store",
		"url": "https://chromewebstore.google.com",
		"type": 0
	}
}
`);
}