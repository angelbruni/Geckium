// ==UserScript==
// @name        Geckium - Fork Compatibility Adjuster
// @description Prevents forks from messing up Geckium by preventing breaking settings from being applied
// @author      Dominic Hayes
// @loadorder   2
// @include		main
// ==/UserScript==

// Waterfox Adjustments
class gkWaterfoxAdj {
    /**
     * disableThemeCusto - Ensures Waterfox's theme customisations feature is turned off
     */

    static disableThemeCusto() {
        if (gkPrefUtils.tryGet("browser.theme.enableWaterfoxCustomizations").int != 2) {
            gkPrefUtils.set("browser.theme.enableWaterfoxCustomizations").int(2);
            _ucUtils.showNotification({
                label : "Waterfox theme customisations are not supported by Geckium and have been disabled.",
                type : "information",
                priority: "critical"
            })
        }
	}
}
if (AppConstants.MOZ_APP_NAME == "waterfox") {
    window.addEventListener("load", () => gkWaterfoxAdj.disableThemeCusto());
    // Automatically change the titlebar when the setting changes
    const waterfoxObserver = {
        observe: function (subject, topic, data) {
            if (topic == "nsPref:changed") {
                gkWaterfoxAdj.disableThemeCusto();
            }
        },
    };
    Services.prefs.addObserver("browser.theme.enableWaterfoxCustomizations", sysThemeObserver, false);
}