// ==UserScript==
// @name        Geckium - Chromium Theme Parser
// @author      AngelBruni
// @loadorder   2
// ==/UserScript==

Components.utils.import("resource://gre/modules/FileUtils.jsm");
const profRootDir = FileUtils.getDir("ProfD", []).path.replace(/\\/g, "/");
const chrThemesFolderName = "chrThemes";

class chrTheme {
	static get chrThemesFolderPath() {
		return `file:///${profRootDir}/chrome/${chrThemesFolderName}`;
	}

	static get chrThemeFileUtilsPath() {
		return Services.io.newURI(chrTheme.chrThemesFolderPath, null, null).QueryInterface(Components.interfaces.nsIFileURL).file.path;
	}

	static async getThemesList() {
        const themes = {};

        try {
            const directoryPath = chrTheme.chrThemeFileUtilsPath;

            const directory = FileUtils.File(directoryPath);

            if (directory.exists() && directory.isDirectory()) {
                const directoryEntries = directory.directoryEntries;

                const fetchPromises = [];

                while (directoryEntries.hasMoreElements()) {
                    const file = directoryEntries.getNext().QueryInterface(Components.interfaces.nsIFile);
                    const themeManifest = `jar:file:///${profRootDir}/chrome/${chrThemesFolderName}/${file.leafName}!/manifest.json`;

                    const fetchPromise = fetch(themeManifest)
                        .then((response) => response.json())
                        .then((theme) => {
							let themeBanner;
							try {
								themeBanner = theme.theme.images.theme_ntp_background;
							} catch (error) {
								themeBanner = "";
							}

							let themeIcon;
							try {
								themeIcon = theme.theme.icons[48];
							} catch (error) {
								try {
									themeIcon = theme.icons[48];
								} catch (error) {
									themeIcon = "";
								}
							}

                            themes[theme.name] = {
								banner: themeBanner,
								icon: themeIcon,
                                description: theme.description,
								file: file.leafName,
                                version: theme.version
                            };
                        })
                        .catch((error) => {
                            console.error("Error fetching theme manifest:", error);
                        });

                    fetchPromises.push(fetchPromise);
                }

                await Promise.all(fetchPromises);
            } else {
                console.error("Directory does not exist or is not a directory:", directoryPath);
            }
        } catch (error) {
            console.error("Error accessing directory:", error);
        }

        return themes;
    }

	static removeProperties() {
		Array.from(getComputedStyle(docElm)).forEach(propertyName => {
			if (propertyName.startsWith('--chrt')) {
				docElm.style.removeProperty(propertyName);
			}
		});
	}

	static enable(desiredCRX) {
		let crx = desiredCRX;
		setTimeout(() => {
			let storedCRX = pref("Geckium.chrTheme.fileName").tryGet.string();

			console.log(crx, desiredCRX, storedCRX);

			if (!desiredCRX) {
				if (!pref("Geckium.chrTheme.status").tryGet.bool())
					return;

				if (pref("extensions.activeThemeID").tryGet.string() !== "default-theme@mozilla.org")
					return;

				if (storedCRX) {
					crx = storedCRX;
				} else {
					chrTheme.disable();
					return;
				}
			}
			let filePath = `file:///${profRootDir}/chrome/${chrThemesFolderName}/${crx}.crx`;

			pref("Geckium.chrTheme.status").set.bool(true);
			const chrThemeStatus = pref("Geckium.chrTheme.status").tryGet.bool();

			pref("Geckium.chrTheme.filePath").set.string(filePath);
			const chrThemeFilePath = pref("Geckium.chrTheme.filePath").tryGet.string();

			pref("Geckium.chrTheme.fileName").set.string(crx);
			const chrThemeFileName = pref("Geckium.chrTheme.fileName").tryGet.string();
			docElm.setAttribute("chrtheme-file", chrThemeFileName);

			chrTheme.removeProperties();

			const file = `jar:${filePath}!`;
			console.log(file);

			function setStyleProperty(key) {
				return `--chrt-${key.replace(/_/g, '-')}`;
			}

			fetch(`${file}/manifest.json`)
				.then((response) => response.json())
				.then((theme) => {
					console.log("Information:\nFile: " + crx + ".crx", "\nTheme Name: " + theme.name, "\nAll information:", theme);

					// Convert images to CSS custom properties
					Object.entries(theme.theme.images).map(([key, value]) => {
						docElm.style.setProperty(`${setStyleProperty(key)}`, `url('${file}/${value}')`);
					}).join('\n');

					if (isBrowserWindow) {
						const themeFrame = theme.theme.images.theme_frame;

						console.log(themeFrame);

						if (themeFrame) {
							gkLWTheme.classicWindowFrame.enable();
						} else {
							gkLWTheme.classicWindowFrame.disable();
						}
					}

					const attributionImg = theme.theme.images.theme_ntp_attribution;
					if (attributionImg) {
						var imagePath = `${file}/${attributionImg}`; // Change this to the path of your image

						var img = new Image();
						img.src = imagePath;
						img.onload = function() {
							docElm.style.setProperty("--chrt-theme-ntp-attribution-width", `${this.width}px`);
							docElm.style.setProperty("--chrt-theme-ntp-attribution-height", `${this.height}px`);
						};
					}
					
					// Convert colors to CSS custom properties
					if (theme.theme.colors) {
						Object.entries(theme.theme.colors).map(([key, value]) => {
							docElm.style.setProperty(`${setStyleProperty(key)}`, `rgb(${value.join(', ')})`);
						}).join('\n');
					}

					// Convert properties to CSS custom properties
					if (theme.theme.properties) {
						Object.entries(theme.theme.properties).map(([key, value]) => {
							docElm.style.setProperty(`${setStyleProperty(key)}`, value);
						}).join('\n');
					}

					// Convert tints to CSS custom properties
					if (theme.theme.tints) {
						Object.entries(theme.theme.tints).map(([key, value]) => {
							const percentageValue = value.map((value, index) => (index > 0 ? (value * 100) + '%' : value));
							docElm.style.setProperty(`${setStyleProperty("tints-" + key)}`, `hsl(${percentageValue.join(' ')})`);
						}).join('\n');
					}

					docElm.setAttribute("chrtheme", chrThemeStatus);
				});
		}, 0);
	}

	static disable() {
		pref("Geckium.chrTheme.status").set.bool(false);

		const chrThemeStatus = pref("Geckium.chrTheme.status").tryGet.bool();
		docElm.setAttribute("chrtheme", chrThemeStatus);

		if (isBrowserWindow)
			gkLWTheme.classicWindowFrame.disable();

		chrTheme.removeProperties();
	}
}
window.addEventListener("load", () => {
	chrTheme.enable();
});
const chrThemeObs = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			console.log(pref("Geckium.chrTheme.status").tryGet.bool())
			if (pref("Geckium.chrTheme.status").tryGet.bool() == true)
				chrTheme.enable();
			else
				chrTheme.disable();
		}
	},
};
Services.prefs.addObserver("Geckium.chrTheme.status", chrThemeObs, false);
Services.prefs.addObserver("Geckium.chrTheme.fileName", chrThemeObs, false);