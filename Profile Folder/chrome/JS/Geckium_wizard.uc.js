// ==UserScript==
// @name        Geckium - Wizard
// @author		AngelBruni
// @loadorder   3
// ==/UserScript==

window.addEventListener("load", () => {
	// Ensure Geckium is actually installed
	let geckCheck = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
	if (AppConstants.platform == "win")
		geckCheck.initWithPath(`${FileUtils.getDir("ProfD", []).path}\\chrome\\geckiumChrome.css`);
	else
		geckCheck.initWithPath(`${FileUtils.getDir("ProfD", []).path.replace(/\\/g, "/")}/chrome/geckiumChrome.css`);
	
	if (!geckCheck.exists()) {
		UC_API.Notifications.show({
			label : "Welcome to ium! To get the full Geckium experience, download Geckium from Releases or compile your chrome folder.",
			type : "geckium-notification",
			priority: "critical"
		});
		return;
	}
	
	// Migrate Silverfox settings before the wizard can be shown
	if (!gkPrefUtils.tryGet("Geckium.firstRun.complete").bool && !gkPrefUtils.tryGet("Geckium.firstRun.wasSilverfox").bool && sfMigrator.getWasSf)
		sfMigrator.migrate();

	// Show Geckium splash screen if Geckium is installed properly
	if (!gkPrefUtils.tryGet("Geckium.firstRun.complete").bool) {
		openGSplash();
	}
});