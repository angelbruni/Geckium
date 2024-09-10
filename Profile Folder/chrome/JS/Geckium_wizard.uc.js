// ==UserScript==
// @name        Geckium - Wizard
// @author		AngelBruni
// @loadorder   3
// ==/UserScript==

window.addEventListener("load", () => {
	// Migrate Silverfox settings before the wizard can be shown
	if (!gkPrefUtils.tryGet("Geckium.firstRun.complete").bool && !gkPrefUtils.tryGet("Geckium.firstRun.wasSilverfox").bool && sfMigrator.getWasSf)
		sfMigrator.migrate();

	// Show Geckium splash screen
	if (!gkPrefUtils.tryGet("Geckium.firstRun.complete").bool)
		openGSplash();
});