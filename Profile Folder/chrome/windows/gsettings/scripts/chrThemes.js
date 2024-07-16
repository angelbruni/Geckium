const chrThemesList = document.getElementById("chrthemes-list");

async function populateChrThemesList() {
	const themes = await gkChrTheme.getThemes();

	chrThemesList.innerHTML = ``;

	for (const themeName in themes) {
		let theme = themes[themeName];

		let themeDescription;
		if (!themeDescription)
			themeDescription = "This theme has no description.";
		else
			themeDescription = theme.description.replace(/[&<>"']/g, match => specialCharacters[match]);


		const themeFile = theme.file.replace(".crx", "");

		let themeBanner = theme.banner;
		let themeBannerPath = `jar:${chrThemesFolder}/${themeFile}.crx!/${themeBanner}`;
		if (!themeBanner)
			themeBannerPath = "";

		let themeBannerColor = theme.color;
		if (!themeBannerColor)
			themeBannerColor = (themeBannerPath == "") ? "black" : "transparent";

		let themeIcon = theme.icon;
		let themeIconPath;
		if (themeIcon) {
			themeIconPath = `jar:${chrThemesFolder}/${themeFile}.crx!/${themeIcon}`;
		} else {
			themeIconPath = "chrome://userchrome/content/windows/gsettings/imgs/logo.svg";
		}
		
		const themeVersion = theme.version;
		
		let themeElm = `
		<html:label class="card item chrtheme ripple-enabled"
					 for="theme-${themeFile}"
					 data-theme-name="${themeFile}">
			<vbox flex="1">
				<html:div class="banner" style="background-color: ${themeBannerColor}; background-image: url(${themeBannerPath})"></html:div>
				<hbox style="align-items: center; padding-block: 6px">
					<image class="icon" style="width: 48px; height: 48px; border-radius: 100%" src="${themeIconPath}" />
					<vbox style="min-width: 0">
						<label class="name">${themeName.replace(/[&<>"']/g, match => specialCharacters[match])}</label>
						<label class="description">${themeDescription}</label>
						<label class="version">V${themeVersion}</label>
					</vbox>
					<spacer />
					<div class="radio-parent">
						<html:input class="radio" type="radio" id="theme-${themeFile}" name="chrtheme"/>
						<div class="gutter"></div>
					</div>
				</hbox>
			</vbox>
		</html:label>
		`

		const themeElmWrapper = document.createElement("div");
		themeElmWrapper.classList.add("chrthemewrapper");
		chrThemesList.appendChild(themeElmWrapper);

		themeElmWrapper.appendChild(MozXULElement.parseXULToFragment(themeElm));
	}

	chrThemesList.querySelectorAll("label.item").forEach(item => {
		item.addEventListener("click", () => {
			// TODO: Use actual event from about:addons to apply the right theme
			gkPrefUtils.set("extensions.activeThemeID").string("firefox-compact-light@mozilla.org");
			gkPrefUtils.set("Geckium.chrTheme.fileName").string(item.dataset.themeName);
		})
	})

	chrThemesList.querySelector(`label.item[data-theme-name="${gkPrefUtils.tryGet("Geckium.chrTheme.fileName").string}"] input[type="radio"]`).checked = true;
}
document.addEventListener("DOMContentLoaded", populateChrThemesList);

function openChrThemesDir() {
	const { FileUtils } = ChromeUtils.import("resource://gre/modules/FileUtils.jsm");

	// Specify the path of the directory you want to open
	const directoryPath = chrTheme.getFolderFileUtilsPath;

	try {
		// Create a file object representing the directory
		const directory = new FileUtils.File(directoryPath);

		// Open the directory
		directory.launch();
	} catch (e) {
		window.alert(`Could not open ${directoryPath} - ensure the directory exists before trying again.`);
	}
}