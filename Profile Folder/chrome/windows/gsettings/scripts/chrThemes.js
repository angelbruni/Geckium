const { gkFileUtils } = ChromeUtils.importESModule("chrome://modules/content/GeckiumFileUtils.sys.mjs");

async function getChrThemesList() {
    var result = [];
    const themes = await gkChrTheme.getThemes();

    for (const i in themes) {
        let theme = themes[i];
        let themeFile = theme.file.replace(".crx", "");

        result.push({
            "type": "chrtheme",
			"browser": theme.browser,
            "builtin": false,
            "name": theme.name,
            "desc": theme.description,
            "id": themeFile,
            "page": null,
            "icon": theme.icon ? `jar:file://${chrThemesFolder}/${themeFile}.crx!/${theme.icon}` : null,
            "banner": theme.banner ? `url('jar:file://${chrThemesFolder}/${themeFile}.crx!/${theme.banner}')` : "unset",
            "bannerAlignment": null,
            "bannerTiling": null,
            "bannerSizing": null,
            "bannerColor": theme.color ? `rgb(${theme.color})` : "white", // white is a direct reference to the fallback NTP background
            "version": theme.version,
            "apply": function() { applyTheme(themeFile); },
            "uninstall": function() {
                // Disable theme if it's currently enabled.
                if (gkPrefUtils.tryGet("Geckium.chrTheme.fileName").string == themeFile)
                    gkPrefUtils.delete("Geckium.chrTheme.fileName")
                
                gkFileUtils.delete(`${gkChrTheme.getFolderFileUtilsPath}/${theme.file}`)
            }
        });
    }
    return result;
}

function selectChrTheme() {
	let prefChoice = gkPrefUtils.tryGet("Geckium.chrTheme.fileName").string;
	if (prefChoice) {
        themesList.querySelector(`button[data-chrtheme-name="${prefChoice}"] input[type="radio"]`).checked = true;
        document.getElementById("thememode-themed").checked = true;
	} else {
		themesList.querySelectorAll('button[data-chrtheme-name] input[type="radio"]').forEach(item => {
			item.checked = false;
		})
	}
}
const chrGridObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			selectChrTheme();
		}
	},
};
Services.prefs.addObserver("extensions.activeThemeID", chrGridObserver, false);
Services.prefs.addObserver("Geckium.chrTheme.fileName", chrGridObserver, false);


async function applyTheme(themeid) {
	const lighttheme = await AddonManager.getAddonByID("firefox-compact-light@mozilla.org");
	await lighttheme.enable();
	gkPrefUtils.set("Geckium.chrTheme.fileName").string(themeid);
	themesList.querySelector(`button[data-chrtheme-name="${themeid}"] input[type="radio"]`).checked = true;
}

function openChrThemesDir() {
	const directoryPath = gkChrTheme.getFolderFileUtilsPath;

	gkFileUtils.create(true, directoryPath);
	gkFileUtils.launch(directoryPath);
}