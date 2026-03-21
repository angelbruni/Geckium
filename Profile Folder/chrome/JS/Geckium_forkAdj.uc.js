// ==UserScript==
// @name        Geckium - Fork Compatibility Adjuster
// @description Prevents forks from messing up Geckium by preventing breaking settings from being applied
// @author      Dominic Hayes
// @loadorder   3
// @include		main
// ==/UserScript==

// Temporary Firefox adjustments
class gkFirefoxTempAdj {
	static disableVertical() {
		if (gkPrefUtils.tryGet("sidebar.verticalTabs").bool != false) {
			gkPrefUtils.set("sidebar.verticalTabs").bool(false);
			UC_API.Notifications.show({
				label : "The Vertical Tabs feature is not supported by Geckium at the moment.",
				type : "geckium-notification",
				priority: "critical"
			})
		}
	}
	static webApps() {
		if (window.document.documentElement.getAttribute("taskbartab")) {
			UC_API.Notifications.show({
				label : "Website Applications are not supported by Geckium at the moment.",
				type : "geckium-notification",
				priority: "critical"
			})
		}
	}
}
window.addEventListener("load", gkFirefoxTempAdj.disableVertical);
window.addEventListener("load", gkFirefoxTempAdj.webApps);
const firefoxObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed")
			gkFirefoxTempAdj.disableVertical();
	},
};
Services.prefs.addObserver("sidebar.verticalTabs", firefoxObserver, false);

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


// Firefox forks with NO hope of ever being Geckium compatible
class gkImpossibleForks {
	/**
	 * showWarning - Quite self-explanatory
	 */

	static showWarning() {
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

	// This is also self-explanatory
	static impossibru = [
		"zen"
	] // TODO: add more truly incompatible forks
}
if (gkImpossibleForks.impossibru.includes(AppConstants.MOZ_APP_NAME))
	window.addEventListener("load", gkImpossibleForks.showWarning);


// Fork values
class gkForkAdj {
	static overrides = (function() {switch (AppConstants.MOZ_APP_NAME) {
		case "waterfox": return {
			1: { // int
				"browser.theme.enableWaterfoxCustomizations": 2
			}
		}
		case "r3dfox": case "r3dfox_esr": case "plasmafox": return {
			0: { // bool
				"r3dfox.caption.text.color": false,
				"r3dfox.colors.enabled": false,
				"r3dfox.customizations.enabled": false,
				"r3dfox.force.transparency": false,
				"r3dfox.transparent.menubar": false,
				"r3dfox.translucent.navbar": false,
				"r3dfox.aero.fog": false,
				"r3dfox.backgrounds.enabled": false
			}
		}
		case "nocturne": return {
			0: {
				"nocturne.force.transparency": false,
				"nocturne.transparent.menubar": false,
				"nocturne.translucent.navbar": false,
				"nocturne.ui.oldurlbar": false,
				"nocturne.backgrounds.enabled": false
			},
			1: {
				"nocturne.caption.text.color": 0,
				"nocturne.colors": 0,
				"nocturne.aero.fog": 0
			}
		}
		case "marble": case "okaeri": return {
			0: {
				"widget.windows-style.modern": false,
				"browser.proton.enabled": true
			}
		}
		default: return {}
	}})();

	/**
	 * disableThemeCusto - Ensures inappropriate theme customisation options are turned off
	 */

	static disableThemeCusto(id, type) {
		let changes = 0;
		if (id) {
			if (type == 0) {
				if (gkPrefUtils.tryGet(id).bool != gkForkAdj.overrides[0][id]) {
					gkPrefUtils.set(id).bool(gkForkAdj.overrides[0][id]);
					changes += 1;
				}
			} else if (type == 1) {
				if (gkPrefUtils.tryGet(id).int != gkForkAdj.overrides[1][id]) {
					gkPrefUtils.set(id).int(gkForkAdj.overrides[1][id]);
					changes += 1;
				}
			} else if (type == 2) {
				if (gkPrefUtils.tryGet(id).string != gkForkAdj.overrides[2][id]) {
					gkPrefUtils.set(id).string(gkForkAdj.overrides[2][id]);
					changes += 1;
				}
			}
		} else { // Runs *once* when browser loads, do not run again
			if (0 in gkForkAdj.overrides) { for (const id in gkForkAdj.overrides[0]) {
				Services.prefs.addObserver(id, gkForkBoolObsr, false);
				if (gkPrefUtils.tryGet(id).bool != gkForkAdj.overrides[0][id]) {
					gkPrefUtils.set(id).bool(gkForkAdj.overrides[0][id]);
					changes += 1;
				}
			}}
			if (1 in gkForkAdj.overrides) { for (const id in gkForkAdj.overrides[1]) {
				Services.prefs.addObserver(id, gkForkIntObsr, false);
				if (gkPrefUtils.tryGet(id).int != gkForkAdj.overrides[1][id]) {
					gkPrefUtils.set(id).int(gkForkAdj.overrides[1][id]);
					changes += 1;
				}
			}}
			if (2 in gkForkAdj.overrides) { for (const id in gkForkAdj.overrides[2]) {
				Services.prefs.addObserver(id, gkForkStrObsr, false);
				if (gkPrefUtils.tryGet(id).bool != gkForkAdj.overrides[2][id]) {
					gkPrefUtils.set(id).bool(gkForkAdj.overrides[2][id]);
					changes += 1;
				}
			}}
		}
		if (changes >= 1) {
			UC_API.Notifications.show({
				label : `${Services.appinfo.name} theme customisations are not supported by Geckium and have been disabled.`,
				type : "geckium-notification",
				priority: "critical"
			})
		}
	}
}
window.addEventListener("load", function () { gkForkAdj.disableThemeCusto(); });
const gkForkBoolObsr = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed")
			gkForkAdj.disableThemeCusto(data, 0);
	},
};
const gkForkIntObsr = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed")
			gkForkAdj.disableThemeCusto(data, 1);
	},
};
const gkForkStrObsr = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed")
			gkForkAdj.disableThemeCusto(data, 2);
	},
};


// Floorp Adjustments
//  Floorp structures the settings we need to force differently, so it gets its own function.
class gkFloorpAdj {

	/**
	 * disableThemeCusto - Ensures Floorp's theme customisations feature is turned off
	 */

	static disableThemeCusto() {
		let changes = 0;
		let floorconfs;
		try {
			floorconfs = JSON.parse(gkPrefUtils.tryGet("floorp.design.configs").string);
		} catch {
			return; // if it's invalid, Floorp will overwrite it and thus call this function again
		}
		console.log(floorconfs);

		if (floorconfs["globalConfigs"]["userInterface"] != "proton") {
			floorconfs["globalConfigs"]["userInterface"] = "proton";
			changes += 1;
		}
		if (floorconfs["globalConfigs"]["faviconColor"] != false) {
			floorconfs["globalConfigs"]["faviconColor"] = false;
			changes += 1;
		}
		if (floorconfs["uiCustomization"]["display"]["deleteBrowserBorder"] != false) {
			floorconfs["uiCustomization"]["display"]["deleteBrowserBorder"] = false;
			changes += 1;
		}

		if (changes >= 1) {
			gkPrefUtils.set("floorp.design.configs").string(JSON.stringify(floorconfs));
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
			if (topic == "nsPref:changed")
				gkFloorpAdj.disableThemeCusto();
		},
	};
	Services.prefs.addObserver("floorp.design.configs", floorpObserver, false);
}