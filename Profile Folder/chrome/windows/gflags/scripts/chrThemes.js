const chrThemesList = document.getElementById("chrthemes-list");

async function populateChrThemesList() {
	const themes = await chrTheme.getThemesList();

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
		let themeBannerPath = `jar:${chrTheme.getFolderPath}/${themeFile}.crx!/${themeBanner}`;
		if (!themeBanner)
			themeBannerPath = "";

		let themeIcon = theme.icon;``
		let themeIconPath = `jar:${chrTheme.getFolderPath}/${themeFile}.crx!/${themeIcon}`;

		if (themeIcon == "")
			themeIconPath = "chrome://userchrome/content/windows/gflags/imgs/logo.svg";
		
		const themeVersion = theme.version;
		
		let themeElm = `
		<html:label class="card item chrtheme ripple-enabled"
					 for="theme-${themeFile}"
					 data-theme-name="${themeFile}">
			<vbox flex="1">
				<html:div class="banner" style="background-image: url(${themeBannerPath})"></html:div>
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
			chrTheme.enable(item.dataset.themeName);
			document.getElementById("chrTheme-switch").checked = true;
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
		console.error("Error opening directory:", e);
	}
}