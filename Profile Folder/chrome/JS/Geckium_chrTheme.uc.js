// ==UserScript==
// @name        Geckium - Chromium Theme Parser
// @author      AngelBruni
// @loadorder   2
// ==/UserScript==

Components.utils.import("resource://gre/modules/FileUtils.jsm");
const profRootDir = FileUtils.getDir("ProfD", []).path.replace(/\\/g, "/");

const { ColorUtils } = ChromeUtils.importESModule("chrome://modules/content/ChromiumColorUtils.sys.mjs");

const chrThemesFolderName = "chrThemes";

class chrTheme {
	static get defaultToolbarButtonIconColour() {
		let appearanceChoice;
		switch (gkPrefUtils.tryGet("Geckium.main.overrideStyle").bool) {
			case true:
				appearanceChoice = gkPrefUtils.tryGet("Geckium.main.style").int;
				break;
			default:
				appearanceChoice = gkPrefUtils.tryGet("Geckium.appearance.choice").int;
				break;
		}

		if (appearanceChoice <= 4)
			return [65, 99, 154];
		else if (appearanceChoice == 5)
			return [78, 91, 116];
		else if (appearanceChoice <= 9)
			return [111, 111, 111];
	}

	static get getFolderPath() {
		return `file:///${profRootDir}/chrome/${chrThemesFolderName}`;
	}

	static get getFolderFileUtilsPath() {
		return Services.io.newURI(this.getFolderPath, null, null).QueryInterface(Components.interfaces.nsIFileURL).file.path;
	}

	static async getThemesList() {
        const themes = {};

        try {
            const directoryPath = this.getFolderFileUtilsPath;

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

	static async getCurrentTheme() {
		if (gkPrefUtils.tryGet("Geckium.chrTheme.status").bool) {
			const themeManifest = `jar:${gkPrefUtils.tryGet("Geckium.chrTheme.filePath").string}!/manifest.json`;
	
			try {
				const response = await fetch(themeManifest);
				const theme = await response.json();
				return theme;
			} catch (error) {
				console.error('Error fetching theme:', error);
				return null; // Or handle the error appropriately
			}
		}
	}

	static removeProperties() {
		Array.from(getComputedStyle(document.documentElement)).forEach(propertyName => {
			if (propertyName.startsWith('--chrt')) {
				document.documentElement.style.removeProperty(propertyName);
			}
		});
	}

	static enable(desiredCRX) {
		let crx = desiredCRX;
		setTimeout(() => {
			let storedCRX = gkPrefUtils.tryGet("Geckium.chrTheme.fileName").string;

			console.log(crx, desiredCRX, storedCRX);

			if (!desiredCRX) {
				if (!gkPrefUtils.tryGet("Geckium.chrTheme.status").bool)
					return;

				if (!gkPrefUtils.tryGet("extensions.activeThemeID").string.includes("compact-light"))
					return;

				if (storedCRX) {
					crx = storedCRX;
				} else {
					this.disable();
					return;
				}
			}
			let filePath = `file:///${profRootDir}/chrome/${chrThemesFolderName}/${crx}.crx`;

			gkPrefUtils.set("Geckium.chrTheme.status").bool(true);
			const chrThemeStatus = gkPrefUtils.tryGet("Geckium.chrTheme.status").bool;

			gkPrefUtils.set("Geckium.chrTheme.filePath").string(filePath);

			gkPrefUtils.set("Geckium.chrTheme.fileName").string(crx);
			const chrThemeFileName = gkPrefUtils.tryGet("Geckium.chrTheme.fileName").string;
			document.documentElement.setAttribute("chrtheme-file", chrThemeFileName);

			this.removeProperties();

			const file = `jar:${filePath}!`;
			console.log(file);

			function setStyleProperty(key) {
				return `--chrt-${key.replace(/_/g, '-')}`;
			}

			let themeFrame;

			fetch(`${file}/manifest.json`)
				.then((response) => response.json())
				.then(async (theme) => {
					console.log("Information:\nFile: " + crx + ".crx", "\nTheme Name: " + theme.name, "\nAll information:", theme);

					// Convert images to CSS custom properties
					if (theme.theme.images) {
						Object.entries(theme.theme.images).map(([key, value]) => {
							document.documentElement.style.setProperty(`${setStyleProperty(key)}`, `url('${file}/${value}')`);
						}).join('\n');

						const attributionImg = theme.theme.images.theme_ntp_attribution;
						if (attributionImg) {
							var imagePath = `${file}/${attributionImg}`; // Change this to the path of your image

							var img = new Image();
							img.src = imagePath;
							img.onload = function() {
								document.documentElement.style.setProperty("--chrt-theme-ntp-attribution-width", `${this.width}px`);
								document.documentElement.style.setProperty("--chrt-theme-ntp-attribution-height", `${this.height}px`);
							};
						}

						if (isBrowserWindow)
							themeFrame = theme.theme.images.theme_frame;
					}
					
					// Convert colors to CSS custom properties
					if (theme.theme.colors) {
						Object.entries(theme.theme.colors).map(([key, value]) => {
							document.documentElement.style.setProperty(`${setStyleProperty(key)}`, `rgb(${value.join(', ')})`);
						}).join('\n');
					}

					// Convert properties to CSS custom properties
					if (theme.theme.properties) {
						Object.entries(theme.theme.properties).map(([key, value]) => {
							document.documentElement.style.setProperty(`${setStyleProperty(key)}`, value);
						}).join('\n');
					}

					let themeTints;
					if (theme.theme.tints)
						themeTints = theme.theme.tints;
					else
						themeTints = theme.tints;

					// Convert tints to CSS custom properties
					if (themeTints) {
						Object.entries(themeTints).map(([key, value]) => {
							const percentageValue = value.map((value, index) => (index > 0 ? (value * 100) + '%' : value));

							let tintedColour;

							switch (key) {
								case "frame":
									const frame = theme.theme.colors.frame;

									if (!frame)
										return;

									tintedColour = ColorUtils.HSLShift(frame, value);

									document.documentElement.style.setProperty(
										`${setStyleProperty("frame")}`,
										`rgb(${tintedColour})`
									);
									break;
								case "frame_inactive":
									const frameInactive = theme.theme.colors.frame_inactive;

									if (!frameInactive)
										return;

									tintedColour = ColorUtils.HSLShift(frameInactive, value);

									document.documentElement.style.setProperty(
										`${setStyleProperty("frame-inactive")}`,
										`rgb(${tintedColour})`
									);
									break;
								case "background_tab":
									const backgroundTab = theme.theme.colors.background_tab;

									if (!backgroundTab) 
										return;

									tintedColour = ColorUtils.HSLShift(backgroundTab, value);

									document.documentElement.style.setProperty(
										`${setStyleProperty("background-tab")}`,
										`rgb(${tintedColour})`
									);
									break;
								case "buttons":
									tintedColour = ColorUtils.HSLShift(this.defaultToolbarButtonIconColour, value);

									// If the tinted colour is the same as the default colour, do NOT tint.
									if (JSON.stringify(tintedColour) == JSON.stringify(this.defaultToolbarButtonIconColour))
										return;

									document.documentElement.style.setProperty(
										`${setStyleProperty("toolbar-button-icon")}`,
										`rgb(${tintedColour})`
									);
									break;

							
								default: // If the tint is for none of the above, set it as HSL, basically discarding it.
									document.documentElement.style.setProperty(
										`${setStyleProperty("tints-" + key)}`,
										`hsl(${percentageValue.join(' ')})`
									);
									break;
							}
						}).join('\n');
					}

					document.documentElement.setAttribute("chrtheme", chrThemeStatus);

					await gkChromiumFrame.automatic();
				});
		}, 0);
	}

	static async disable() {
		gkPrefUtils.set("Geckium.chrTheme.status").bool(false);

		const chrThemeStatus = gkPrefUtils.tryGet("Geckium.chrTheme.status").bool;
		document.documentElement.setAttribute("chrtheme", chrThemeStatus);

		this.removeProperties();
		await gkChromiumFrame.automatic();
	}
}
window.addEventListener("load", () => {
	chrTheme.enable();
});
const chrThemeObs = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			if (gkPrefUtils.tryGet("Geckium.chrTheme.status").bool == true)
				chrTheme.enable();
			else
				chrTheme.disable();
		}
	},
};
Services.prefs.addObserver("Geckium.chrTheme.status", chrThemeObs, false);
Services.prefs.addObserver("Geckium.chrTheme.fileName", chrThemeObs, false);