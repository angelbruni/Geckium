// ==UserScript==
// @name        Geckium - Fork Compatibility Adjuster
// @description Prevents forks from messing up Geckium by preventing breaking settings from being applied
// @author      Dominic Hayes
// @loadorder   3
// @include		main
// ==/UserScript==

// Firefox forks with NO hope of ever being Geckium compatible
class gkImpossibleForks {
    /**
     * showWarning - Quite self-explanatory
     */

    static showWarning() {
        if (gkPrefUtils.tryGet("Geckium.impossibruFork.warningShown").bool != true) {
            gkPrefUtils.set("Geckium.impossibruFork.warningShown").bool(true);
            UC_API.Notifications.show({
                label : "what.",
                type : "geckium-notification",
                priority: "critical",
                buttons: [{
                label: "Seriously, what did you think was going to happen?",
                callback: (notification) => {
                    notification.ownerGlobal.openWebLinkIn(
                    "https://youtu.be/swnVdhCsYBk",
                    "tab"
                    );
                    return false
                }
                }]
            })
        }
	}

    // This is also self-explanatory
    static impossibru = [
        "zen"
    ] // TODO: add more truly incompatible forks
}
if (gkImpossibleForks.impossibru.includes(AppConstants.MOZ_APP_NAME)) {
    window.addEventListener("load", gkImpossibleForks.showWarning);
}

// Firefox (Native Controls Patch) Adjustments
class gkNCPAdj {
    static checkNCP() {
        if (!isNCPatched) {
            if (gkPrefUtils.tryGet("Geckium.NCP.installed").bool == true) {
                if (parseInt(Services.appinfo.version.split(".")[0]) > 115) { // Special message for ex-115-users
                    gkPrefUtils.delete("Geckium.NCP.installed");
                    UC_API.Notifications.show(
                    {
                        label : "To continue using native Windows titlebars, please switch to a compatible Firefox fork.",
                        type : "nativecontrolspatch-notification",
                        priority: "critical",
                        buttons: [{
                        label: "Learn more",
                        callback: (notification) => {
                            notification.ownerGlobal.openWebLinkIn(
                            "https://github.com/angelbruni/Geckium/wiki/Compatible-Firefox-forks-with-Native-Windows-Titlebars-support",
                            "tab"
                            );
                            return false
                        }
                        }]
                    }
                    )
                } else {
                    UC_API.Notifications.show(
                    {
                        label : "Firefox has stopped using Native Controls Patch. An update may have reverted it.",
                        type : "nativecontrolspatch-notification",
                        priority: "warning",
                        buttons: [{
                        label: "Redownload",
                        callback: (notification) => {
                            notification.ownerGlobal.openWebLinkIn(
                            "https://github.com/kawapure/firefox-native-controls/releases/tag/" + Services.appinfo.version,
                            "tab"
                            );
                            return false
                        }
                        },
                        {
                            label: "Don't ask again",
                            callback: (notification) => {
                                gkPrefUtils.set("Geckium.NCP.installed").bool(false);
                                gkPrefUtils.set("Geckium.NCP.bannerDismissed").bool(true);
                                return false
                            }
                        }]
                    }
                    )
                }
            } else if (gkPrefUtils.tryGet("Geckium.NCP.bannerDismissed").bool != true) { // true = Don't show again
                UC_API.Notifications.show(
                {
                    label : "This version of Firefox supports the Native Controls Patch, which provides native Windows titlebars.",
                    type : "nativecontrolspatch-notification",
                    priority: "info",
                    buttons: [{
                    label: "Learn more",
                    callback: (notification) => {
                        notification.ownerGlobal.openWebLinkIn(
                        "https://github.com/kawapure/firefox-native-controls",
                        "tab"
                        );
                        return false
                    }
                    },
                    {
                        label: "Don't ask again",
                        callback: (notification) => {
                            gkPrefUtils.set("Geckium.NCP.bannerDismissed").bool(true);
                            return false
                        }
                    }]
                }
                )
            }
        } else if (gkPrefUtils.tryGet("Geckium.NCP.installed").bool != true) {
            gkPrefUtils.set("Geckium.NCP.installed").bool(true);
        }
    }
}
if (AppConstants.MOZ_APP_NAME == "firefox" || AppConstants.MOZ_APP_NAME == "firefox-esr") {
    if (isWindows10() && (parseInt(Services.appinfo.version.split(".")[0]) == 115 ||
        isNCPatched == "patch" || gkPrefUtils.tryGet("Geckium.NCP.installed").bool == true)) { // Only for Windows 10+
        window.addEventListener("load", gkNCPAdj.checkNCP);
    }
}

// Floorp Adjustments
class gkFloorpAdj {
    /**
     * disableThemeCusto - Ensures Floorp's theme customisations feature is turned off
     */

    static disableThemeCusto() {
        if (gkPrefUtils.tryGet("floorp.browser.user.interface").int != 1) {
            gkPrefUtils.set("floorp.browser.user.interface").int(1);
            UC_API.Notifications.show({
                label : "Floorp theme customisations are not supported by Geckium and have been disabled.",
                type : "geckium-notification",
                priority: "critical"
            })
        }
	}
}
if (AppConstants.MOZ_APP_NAME == "floorp") {
    window.addEventListener("load", gkFloorpAdj.disableThemeCusto);
    const floorpObserver = {
        observe: function (subject, topic, data) {
            if (topic == "nsPref:changed") {
                gkFloorpAdj.disableThemeCusto();
            }
        },
    };
    Services.prefs.addObserver("floorp.browser.user.interface", floorpObserver, false);
}

// Waterfox Adjustments
class gkWaterfoxAdj {
    /**
     * disableThemeCusto - Ensures Waterfox's theme customisations feature is turned off
     */

    static disableThemeCusto() {
        if (gkPrefUtils.tryGet("browser.theme.enableWaterfoxCustomizations").int != 2) {
            gkPrefUtils.set("browser.theme.enableWaterfoxCustomizations").int(2);
            UC_API.Notifications.show({
                label : "Waterfox theme customisations are not supported by Geckium and have been disabled.",
                type : "geckium-notification",
                priority: "critical"
            })
        }
	}
}
if (AppConstants.MOZ_APP_NAME == "waterfox") {
    window.addEventListener("load", gkWaterfoxAdj.disableThemeCusto);
    const waterfoxObserver = {
        observe: function (subject, topic, data) {
            if (topic == "nsPref:changed") {
                gkWaterfoxAdj.disableThemeCusto();
            }
        },
    };
    Services.prefs.addObserver("browser.theme.enableWaterfoxCustomizations", waterfoxObserver, false);
}

// r3dfox Adjustments
class gkRfoxAdj {
    static blacklist = [
        "r3dfox.caption.text.color",
        "r3dfox.colors.enabled",
        "r3dfox.customizations.enabled",
        "r3dfox.force.transparency",
        "r3dfox.transparent.menubar",
        "r3dfox.translucent.navbar",
        "r3dfox.aero.fog"
    ]

    /**
     * disableThemeCusto - Ensures R3dfox's theme customisation options are turned off
     */

    static disableThemeCusto(id) {
        let changes = 0;
        if (id) {
            if (gkPrefUtils.tryGet(id).bool != false) {
                gkPrefUtils.set(id).bool(false);
                changes += 1;
            }
        } else {
            for (const i in gkRfoxAdj.blacklist) {
                if (gkPrefUtils.tryGet(gkRfoxAdj.blacklist[i]).bool != false) {
                    gkPrefUtils.set(gkRfoxAdj.blacklist[i]).bool(false);
                    changes += 1;
                }
            }
        }
        if (changes >= 1) {
            UC_API.Notifications.show({
                label : "r3dfox theme customisations are not supported by Geckium and have been disabled.",
                type : "geckium-notification",
                priority: "critical"
            })
        }
	}
}
if (AppConstants.MOZ_APP_NAME == "r3dfox" || AppConstants.MOZ_APP_NAME == "r3dfox_esr" || AppConstants.MOZ_APP_NAME == "plasmafox") {
    window.addEventListener("load", function () { gkRfoxAdj.disableThemeCusto(); });
    const rfoxObserver = {
        observe: function (subject, topic, data) {
            if (topic == "nsPref:changed") {
                gkRfoxAdj.disableThemeCusto(data);
            }
        },
    };
    for (const i in gkRfoxAdj.blacklist) {
        Services.prefs.addObserver(gkRfoxAdj.blacklist[i], rfoxObserver, false);
    }
}