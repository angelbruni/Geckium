const { gkUpdater } = ChromeUtils.importESModule("chrome://modules/content/GeckiumUpdater.sys.mjs");

function loadVersion() {
	document.querySelectorAll(".version-identifier").forEach(async identifier => {
		identifier.textContent = await gkUpdater.getVersion();
	})
}
document.addEventListener("DOMContentLoaded", loadVersion);

function openWizardFromSplash() {
	gkWindow.close();
	openGWizard();
}