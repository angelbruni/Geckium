const chrThemesList = document.getElementById("chrthemes-list");

async function populateChrThemesList() {
	const themes = await chrTheme.getThemesList();

	chrThemesList.innerHTML = ``;

	for (const themeName in themes) {
		const theme = themes[themeName];

		let themeDescription = theme.description;
		if (!themeDescription)
			themeDescription = "";

		const themeFile = theme.file.replace(".crx", "");

		let themeBanner = theme.banner;
		let themeBannerPath = `jar:${chrTheme.chrThemesFolderPath}/${themeFile}.crx!/${themeBanner}`;
		if (!themeBanner)
			themeBannerPath = "";

		let themeIcon = theme.icon;``
		let themeIconPath = `jar:${chrTheme.chrThemesFolderPath}/${themeFile}.crx!/${themeIcon}`;

		if (themeIcon == "")
			themeIconPath = "chrome://userchrome/content/windows/gflags/imgs/logo.svg";
		
		const themeVersion = theme.version;
		
		let themeElm = `
		<html:label class="card item ripple-enabled chrtheme"
					 for="theme-${themeFile}"
					 data-theme-name="${themeFile}">
			<vbox flex="1">
				<html:div class="banner" style="background-image: url(${themeBannerPath})"></html:div>
				<hbox style="align-items: center;">
					<image class="icon" style="width: 48px; height: 48px;" src="${themeIconPath}" />
					<vbox>
						<label class="name">${themeName}</label>
						<label class="description">${themeDescription}</label>
						<label class="description">Version: ${themeVersion}</label>
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

		chrThemesList.appendChild(MozXULElement.parseXULToFragment(themeElm))
	}

	chrThemesList.querySelectorAll("label.item").forEach(item => {
		item.addEventListener("click", () => {
			chrTheme.enable(item.dataset.themeName);
			document.getElementById("chrTheme-switch").checked = true;
		})
	})

	chrThemesList.querySelector(`label.item[data-theme-name="${pref("Geckium.chrTheme.fileName").tryGet.string()}"] input[type="radio"]`).checked = true;
}
document.addEventListener("DOMContentLoaded", populateChrThemesList);

function openChrThemesDir() {
	const { FileUtils } = ChromeUtils.import("resource://gre/modules/FileUtils.jsm");

	// Specify the path of the directory you want to open
	const directoryPath = chrTheme.chrThemeFileUtilsPath;

	try {
		// Create a file object representing the directory
		const directory = new FileUtils.File(directoryPath);

		// Open the directory
		directory.launch();
	} catch (e) {
		console.error("Error opening directory:", e);
	}
}