async function getChrThemesList() {
    var result = [];
    const themes = await gkChrTheme.getThemes();

    for (const i in themes) {
        let theme = themes[i];
        let themeFile = theme.file.replace(".crx", "");

        result.push({
            "type": "chrtheme",
            "name": theme.name,
            "desc": theme.description,
            "id": themeFile,
            "icon": theme.icon ? `jar:file://${chrThemesFolder}/${themeFile}.crx!/${theme.icon}` : null,
            "banner": theme.banner ? `url(jar:file://${chrThemesFolder}/${themeFile}.crx!/${theme.banner})` : "unset",
            "bannerAlignment": null,
            "bannerTiling": null,
            "bannerSizing": null,
            "bannerColor": theme.color ? `rgb(${theme.color})` : "white", // white is a direct reference to the fallback NTP background
            "version": theme.version,
            "event": function(){ applyTheme(themeFile); }
        });
    }
    return result;
}


async function applyTheme(themeid) {
	const lighttheme = await AddonManager.getAddonByID("firefox-compact-light@mozilla.org");
	await lighttheme.enable();
	gkPrefUtils.set("Geckium.chrTheme.fileName").string(themeid);
	themesList.querySelector(`button[data-chrtheme-name="${themeid}"] input[type="radio"]`).checked = true;
}

function openChrThemesDir() {
	const { FileUtils } = ChromeUtils.import("resource://gre/modules/FileUtils.jsm");

	// Specify the path of the directory you want to open
	const directoryPath = gkChrTheme.getFolderFileUtilsPath;

	try {
		// Create a file object representing the directory
		const directory = new FileUtils.File(directoryPath);

		// Open the directory
		directory.launch();
	} catch (e) {
		window.alert(`Could not open ${directoryPath} - ensure the directory exists before trying again.`);
	}
}