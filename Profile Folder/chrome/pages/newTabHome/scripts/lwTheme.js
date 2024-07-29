const { LightweightThemeConsumer } = ChromeUtils.importESModule("resource://gre/modules/LightweightThemeConsumer.sys.mjs");
const { LightweightThemeManager } = ChromeUtils.importESModule("resource://gre/modules/LightweightThemeManager.sys.mjs");

function setFooterChoice() {
	document.documentElement.setAttribute("footer-themable", gkPrefUtils.tryGet("Geckium.newTabHome.themeFooter").bool)
}
const themeFooterObs = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			setFooterChoice();
		}
	},
};
document.addEventListener("DOMContentLoaded", setFooterChoice);
Services.prefs.addObserver("Geckium.newTabHome.themeFooter", themeFooterObs, false);

function setProperties() {
	setTimeout(() => {
		// Remove variables from CSS
        Array.from(getComputedStyle(document.documentElement)).forEach(propertyName => {
			if (propertyName.startsWith('--lwt-gk')) {
				document.documentElement.style.removeProperty(propertyName);
			}
		});

		if (!gkLWTheme.isThemed) {
			return;
		}
        const activeThemeID = gkPrefUtils.tryGet("extensions.activeThemeID").string;
		const lwThemeResource = LightweightThemeManager.themeData.theme;

		document.documentElement.style.removeProperty("--toolbarbutton-icon-color");
		const toolbarButtonIconFill = lwThemeResource.icon_color;
		if (toolbarButtonIconFill)
			document.documentElement.style.setProperty("--toolbarbutton-icon-color", toolbarButtonIconFill);	
		
		document.documentElement.style.removeProperty("--toolbar-bgcolor");
		const toolbarColor = lwThemeResource.toolbarColor;
		if (toolbarColor)
			document.documentElement.style.setProperty("--toolbar-bgcolor", toolbarColor);

		document.documentElement.style.removeProperty("--toolbar-color");
		const toolbarText = lwThemeResource.toolbar_text;
		if (toolbarText)
			document.documentElement.style.setProperty("--toolbar-color", toolbarText);

		if (gkPrefUtils.tryGet("extensions.activeThemeID").string == "firefox-alpenglow@mozilla.org") {
			// Custom new tab palette for Alpenglow
			document.documentElement.style.setProperty("--newtab-background-color", "var(--toolbar-field-background-color)");	
			document.documentElement.style.setProperty("--newtab-text-primary-color", "var(--toolbar-field-color)")

			// Alpenglow: Add new tab background
			document.documentElement.style.setProperty("--lwt-gknewtab-background-image", "var(--lwt-additional-images)");
			document.documentElement.style.setProperty("--lwt-gknewtab-background-repeat", "no-repeat,no-repeat,repeat-x");
			document.documentElement.style.setProperty("--lwt-gknewtab-background-position", "right top,left top,right top");
			document.documentElement.style.setProperty("--lwt-gknewtab-background-size", "auto 100%,auto 100%,100%");
		} else {
			document.documentElement.style.removeProperty("--newtab-background-color");
			const newTabBackgroundColor = lwThemeResource.ntp_background;
			if (newTabBackgroundColor)
				document.documentElement.style.setProperty("--newtab-background-color", newTabBackgroundColor);	

			document.documentElement.style.removeProperty("--newtab-text-primary-color");
			const newTabColor = lwThemeResource.ntp_text;
			if (newTabColor)
				document.documentElement.style.setProperty("--newtab-text-primary-color", newTabColor)

			// 3rd-party: Add new tab background
			const imagePath = `chrome://userchrome/content/lwThemes/${activeThemeID}/image`;
			
			const imageConfigPath = `chrome://userchrome/content/lwThemes/${activeThemeID}/config.json`;
			fetch(imageConfigPath)
				.then((response) => response.json())
				.then((json) => {
					if (json.backgroundImage) {
						let backgroundImageUrls = [];
						for (let key in json.backgroundImage) {
							if (json.backgroundImage.hasOwnProperty(key)) {
								backgroundImageUrls.push(`url(chrome://userchrome/content/lwThemes/${activeThemeID}/${json.backgroundImage[key]})`);
							}
						}
						document.documentElement.style.setProperty("--lwt-gknewtab-background-image", backgroundImageUrls.join(', '));
					}

					if (json.imageRendering)
						document.documentElement.style.setProperty("--lwt-gknewtab-image-rendering", json.imageRendering);
						
					if (json.backgroundSize)
						document.documentElement.style.setProperty("--lwt-gknewtab-background-size", json.backgroundSize);

					if (json.backgroundPosition)
						document.documentElement.style.setProperty("--lwt-gknewtab-background-position", json.backgroundPosition);

					if (json.backgroundPositionX)
						document.documentElement.style.setProperty("--lwt-gknewtab-background-position-x", json.backgroundPositionX);

					if (json.backgroundPositionY)
						document.documentElement.style.setProperty("--lwt-gknewtab-background-position-y", json.backgroundPositionY);

					if (json.backgroundRepeat)
						document.documentElement.style.setProperty("--lwt-gknewtab-background-repeat", json.backgroundRepeat);

					if (json.attributionImage)
						document.documentElement.style.setProperty("--lwt-gknewtab-attribution-image", `url(chrome://userchrome/content/lwThemes/${activeThemeID}/${json.attributionImage})`);

					if (json.attributionWidth)
						document.documentElement.style.setProperty("--lwt-gknewtab-attribution-width", json.attributionWidth);

					if (json.attributionHeight)
						document.documentElement.style.setProperty("--lwt-gknewtab-attribution-height", json.attributionHeight);
				});

			// Check for supported image formats and set the background image accordingly
			const supportedFormats = [
				".gif",
				".jpg",
				".jpeg",
				".png",
				".apng",
				".svg",
				".webp"
			];

			// Function to check if an image exists
			const imageExists = (src, callback) => {
				const img = new Image();
				img.onload = () => callback(true);
				img.onerror = () => callback(false);
				img.src = src;
			};

			// Check each supported format
			let backgroundImage;
			const checkNextFormat = (index) => {
				if (index >= supportedFormats.length) {
					if (backgroundImage)
						document.documentElement.style.setProperty("--lwt-gknewtab-image", backgroundImage);
					return;
				}

				const testImage = `${imagePath}${supportedFormats[index]}`;
				imageExists(testImage, (exists) => {
					if (exists) {
						backgroundImage = `url("${testImage}")`;
						document.documentElement.style.setProperty("--lwt-gknewtab-image", backgroundImage);
					} else {
						checkNextFormat(index + 1);
					}
				});
			};

			checkNextFormat(0);
		}
    }, 0);
}
document.addEventListener("DOMContentLoaded", setProperties);
Services.obs.addObserver(setProperties, "lightweight-theme-styling-update");

new LightweightThemeConsumer(document);