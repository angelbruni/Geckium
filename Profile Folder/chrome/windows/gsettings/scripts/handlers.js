function bindClick(id, fn) {
	const el = document.getElementById(id);
	if (el) el.addEventListener("click", fn);
}

bindClick("resetOverridesBtn", () => { disableOverrides(); });
bindClick("overridesModalYesBtn", () => { disableOverrides(); });
bindClick("app_restoreBtn", () => { gkNTP.restoreDefaultApps(); populateAppsList(); });
bindClick("openChrThemesFolderBtn", () => { openChrThemesDir(); });
bindClick("refreshListBtn", () => { rebuildGrids(); });
bindClick("wizardModalYesBtn", () => { gkPrefUtils.set("Geckium.firstRun.complete").bool(false); UC_API.Runtime.restart(true); });
bindClick("restartModalYesBtn", () => { UC_API.Runtime.restart(); });
bindClick("clearCacheModalYesBtn", () => { UC_API.Runtime.restart(true); });

document.querySelectorAll("#gkthemes-grid button[data-systheme]").forEach(themeBtn => {
	themeBtn.addEventListener("click", () => {
		applySysTheme(themeBtn.dataset.systheme);
	});
});
