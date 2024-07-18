const { BrowserAddonUI } = ChromeUtils.importESModule("chrome://browser/content/browser-addons.js");

async function selectSysTheme() {
	let prefChoice = gkPrefUtils.tryGet("Geckium.appearance.systemTheme").string;
	if (!gkSysTheme.systhemes.includes(prefChoice) && prefChoice != "auto") {
		prefChoice = "auto";
	}
	// TODO: Instead of this, display the "System Theme" caption
	//  as we're going to deselect these when in a theme or Firefox Theme
	let chrChoice = gkPrefUtils.tryGet("Geckium.chrTheme.fileName").string;
	if (!chrChoice) {
		document.getElementById("themes-grid").querySelector(`button[data-systheme-name="${prefChoice}"] input[type="radio"]`).checked = true;
	}
}
document.addEventListener("DOMContentLoaded", selectSysTheme);

async function applySysTheme(themeid) {
	// Applies themeid as the System Theme, and disables themes
	gkPrefUtils.set("Geckium.appearance.systemTheme").string(themeid);
	const addon = await AddonManager.getAddonByID(gkPrefUtils.tryGet("extensions.activeThemeID").string);
	addon.disable();
}

async function openLWThemesPage() {
	try {
		BrowserAddonUI.openAddonsMgr("addons://list/theme"); // 128+
	} catch {
		Services.wm.getMostRecentWindow('navigator:browser').BrowserOpenAddonsMgr("addons://list/theme"); // 115
	}
}