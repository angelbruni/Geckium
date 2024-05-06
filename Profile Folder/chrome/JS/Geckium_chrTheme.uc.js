// ==UserScript==
// @name        Geckium - Chromium Theme Parser
// @author      AngelBruni
// @loadorder   2
// ==/UserScript==

Components.utils.import("resource://gre/modules/FileUtils.jsm");
const profRootDir = FileUtils.getDir("ProfD", []).path.replace(/\\/g, "/");
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

	static HSLtoFloat(colorInHSL) {
		const floatH = colorInHSL[0] / 360;
		const floatS = colorInHSL[1] / 100;
		const floatL = colorInHSL[2] / 100;

		return [floatH, floatS, floatL];
	}

	static floatToHSL(floatFromHSL) {
		const colorH = floatFromHSL[0] * 360;
		const colorS = floatFromHSL[1] * 100;
		const colorL = floatFromHSL[2] * 100;

		return [colorH, colorS, colorL];
	}

	static RGBtoHSL(rgb) {
		const r = rgb[0] / 255;
		const g = rgb[1] / 255;
		const b = rgb[2] / 255;

		// Find greatest and smallest channel values
		let cmin = Math.min(r, g, b),
			cmax = Math.max(r, g, b),
			delta = cmax - cmin,
			h = 0,
			s = 0,
			l = 0;

		// Calculate hue
		// No difference
		if (delta == 0)
			h = 0;
		// Red is max
		else if (cmax == r)
			h = ((g - b) / delta) % 6;
		// Green is max
		else if (cmax == g)
			h = (b - r) / delta + 2;
		// Blue is max
		else
			h = (r - g) / delta + 4;

		h = Math.round(h * 60);

		// Make negative hues positive behind 360°
		if (h < 0)
			h += 360;

		// Calculate lightness
		l = (cmax + cmin) / 2;

		// Calculate saturation
		s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

		// Multiply l and s by 100
		s = +(s * 100).toFixed(1);
		l = +(l * 100).toFixed(1);

		return [h, s, l];
	}

	static HSLtoRGB(hsl) {
		let h = hsl[0];
		let s = hsl[1] / 100;
		let l = hsl[2] / 100;

		let a = s * Math.min(l, 1 - l);
		let f = (n, k = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);

		return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
	}

	static MakeHSLShiftValid(hsl) {
		let hslH = hsl[0];
		let hslS = hsl[1];
		let hslL = hsl[2];

		if (hslH < 0 || hslH > 1)
			hslH = -1;
		if (hslS < 0 || hslS > 1)
			hslS = -1;
		if (hslL < 0 || hslL > 1)
			hslL = -1;

		return ([hslH, hslS, hslL]);
	}

	static handleTint(color, shiftHSL) {
		//validate HSL Shift
		shiftHSL = this.MakeHSLShiftValid(shiftHSL);

		//Convert from RGB to HSL, then HSL to float
		let hslHSL = this.HSLtoFloat(this.RGBtoHSL(color));
		let hslH = hslHSL[0];
		let hslS = hslHSL[1];
		let hslL = hslHSL[2];

		let shiftH = shiftHSL[0];
		let shiftS = shiftHSL[1];
		let shiftL = shiftHSL[2];

		//Saturation shift
		if (shiftH >= 0 || shiftS >= 0) {
			//Hue shift
			// Replace the hue with the tint's hue.
			if (shiftH >= 0 && shiftH != 0.5)
				hslH = shiftH;

			// Change the saturation.
			if (shiftS >= 0) {
				if (shiftS <= 0.5)
					hslS = hslS * (shiftS * 2.0);
				else
					hslS = hslS + ((1 - hslS) * ((shiftS - 0.5) * 2.0));
			}
		}

		//convert from float to HSL
		//convert HSL to RGB to do Lightness shifts
		const color2 = this.HSLtoRGB(this.floatToHSL([hslH, hslS, hslL]));
		if (shiftL < 0 || shiftL > 1)
			return color2;

		// Lightness shifts in the style of popular image editors aren't actually
		// represented in HSL - the L value does have some effect on saturation.
		//RGB
		var r = color2[0];
		var g = color2[1];
		var b = color2[2];

		if (shiftL <= 0.5) {
			r = r * (shiftL * 2.0);
			g = g * (shiftL * 2.0);
			b = b * (shiftL * 2.0);
		} else {
			r = r + ((255 - r) * ((shiftL - 0.5) * 2.0));
			g = g + ((255 - g) * ((shiftL - 0.5) * 2.0));
			b = b + ((255 - b) * ((shiftL - 0.5) * 2.0));
		}
		return [Math.round(r), Math.round(g), Math.round(b)];
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

									tintedColour = this.handleTint(frame, value);

									document.documentElement.style.setProperty(
										`${setStyleProperty("frame")}`,
										`rgb(${tintedColour})`
									);
									break;
								case "frame_inactive":
									const frameInactive = theme.theme.colors.frame_inactive;

									if (!frameInactive)
										return;

									tintedColour = this.handleTint(frameInactive, value);

									document.documentElement.style.setProperty(
										`${setStyleProperty("frame-inactive")}`,
										`rgb(${tintedColour})`
									);
									break;
								case "background_tab":
									const backgroundTab = theme.theme.colors.background_tab;

									if (!backgroundTab) 
										return;

									tintedColour = this.handleTint(backgroundTab, value);

									document.documentElement.style.setProperty(
										`${setStyleProperty("background-tab")}`,
										`rgb(${tintedColour})`
									);
									break;
								case "buttons":
									tintedColour = this.handleTint(this.defaultToolbarButtonIconColour, value);

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