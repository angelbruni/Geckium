const chrThemesList = document.getElementById("themes-grid");

async function populateChrThemesList() {
    const themes = await gkChrTheme.getThemes();

    // Clear existing buttons
    chrThemesList.querySelectorAll("button[data-theme-name]").forEach(item => {
        item.remove();
    });

    let themeElements = [];

    for (const themeFileName in themes) {
        let theme = themes[themeFileName];

        let themeName = theme.name.replace(/[&<>"']/g, match => specialCharacters[match]);
        let themeDescription = theme.description
            ? theme.description.replace(/[&<>"']/g, match => specialCharacters[match])
            : gSettingsBundle.GetStringFromName("themeHasNoDescription");

        const themeFile = theme.file.replace(".crx", "");

        const localizedInfoJSON = `jar:file://${chrThemesFolder}/${themeFile}.crx!/_locales/en/messages.json`;

        try {
            const response = await fetch(localizedInfoJSON);
            const localizedInfo = await response.json();

            // Update themeName and themeDescription based on localized data
            if (localizedInfo.extName && localizedInfo.extName.message)		
                themeName = localizedInfo.extName.message.replace(/[&<>"']/g, match => specialCharacters[match]);
            else if (localizedInfo.name && localizedInfo.name.message)
				themeName = localizedInfo.name.message.replace(/[&<>"']/g, match => specialCharacters[match]);

            if (localizedInfo.extDescription && localizedInfo.extDescription.message)
                themeDescription = localizedInfo.extDescription.message.replace(/[&<>"']/g, match => specialCharacters[match]);
            else if (localizedInfo.description && localizedInfo.description.message)
                themeDescription = localizedInfo.description.message.replace(/[&<>"']/g, match => specialCharacters[match]);

        } catch (error) {
            console.error("Something happened when looking for localized strings:", error);
        }

        let themeBanner = theme.banner;
        let themeBannerPath = themeBanner
            ? `jar:file://${chrThemesFolder}/${themeFile}.crx!/${themeBanner}`
            : "";

        let themeBannerColor = theme.color || "white"; // white is a direct reference to the fallback NTP background

        let themeIcon = theme.icon;
        let themeIconPath = themeIcon
            ? `jar:file://${chrThemesFolder}/${themeFile}.crx!/${themeIcon}`
            : "chrome://userchrome/content/windows/gsettings/imgs/logo.svg";

        const themeVersion = theme.version;

        let themeElm = `
        <html:button
                class="link geckium-appearance ripple-enabled"
                data-theme-name="${themeFile}"
                data-index="${themeName.toLowerCase()}"
                style="background-color: rgb(${themeBannerColor}); background-image: url(${themeBannerPath})">
            <html:label class="wrapper">
                <div class="year">V${themeVersion}</div>
                <div class="icon"><image style="width: 48px; height: 48px" src="${themeIconPath}" /></div>
                <div class="identifier">
                    <vbox style="min-width: 0">
                        <div class="radio-parent">
                            <html:input id="theme-${themeFile}" class="radio" type="radio" name="gktheme"></html:input>
                            <div class="gutter" for="checked_check"></div>
                            <html:label class="name label">${themeName}</html:label>
                        </div>
                        <html:label class="description">${themeDescription}</html:label>
                    </vbox>
                </div>
            </html:label>
        </html:button>
        `;

        // Add theme element to the array
        themeElements.push(themeElm);
    }

    // Sort the array by the themeName stored in data-index
    themeElements.sort((a, b) => {
        let indexA = a.match(/data-index="([^"]+)"/)[1];
        let indexB = b.match(/data-index="([^"]+)"/)[1];
        return indexA.localeCompare(indexB);
    });

    // Insert sorted themes into the DOM
    themeElements.forEach(themeElm => {
        chrThemesList.insertBefore(MozXULElement.parseXULToFragment(themeElm), document.getElementById("gkwebstoretile"));
    });

    chrThemesList.querySelectorAll("button[data-theme-name]").forEach(item => {
        item.addEventListener("click", () => {
            applyTheme(item.dataset.themeName);
        });
    });

    selectChrTheme();

    let prefChoice = gkPrefUtils.tryGet("Geckium.chrTheme.fileName").string;
    if (prefChoice) {
        chrThemesList.querySelector(`button[data-theme-name="${prefChoice}"] input[type="radio"]`).checked = true;
    }
}

document.addEventListener("DOMContentLoaded", populateChrThemesList);


function selectChrTheme() {
	let prefChoice = gkPrefUtils.tryGet("Geckium.chrTheme.fileName").string;
	if (gkChrTheme.getEligible() && prefChoice) {
		chrThemesList.querySelector(`button[data-theme-name="${prefChoice}"] input[type="radio"]`).checked = true;
	} else {
		chrThemesList.querySelectorAll('button[data-theme-name] input[type="radio"]').forEach(item => {
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
	chrThemesList.querySelector(`button[data-theme-name="${themeid}"] input[type="radio"]`).checked = true;
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