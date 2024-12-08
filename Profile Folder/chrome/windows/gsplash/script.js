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
	gkPrefUtils.delete("Geckium.appearance.titlebarStyle");
	gkPrefUtils.delete("Geckium.appearance.GTKIcons");
	gkPrefUtils.delete("Geckium.appearance.systemTheme");
	gkPrefUtils.delete("Geckium.appearance.titlebarNative");
	gkPrefUtils.delete("Geckium.branding.choice");
	gkPrefUtils.delete("Geckium.appearance.choice");
	gkPrefUtils.delete("Geckium.profilepic.mode");
	gkPrefUtils.delete("Geckium.profilepic.chromiumIndex");
	gkPrefUtils.delete("Geckium.customtheme.mode");
	gkPrefUtils.set("Geckium.newTabHome.appsList").string(`
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