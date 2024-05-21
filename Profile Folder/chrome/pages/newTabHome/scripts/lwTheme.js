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
		document.documentElement.style.removeProperty("--lwt-newtab-image");
		document.documentElement.style.removeProperty("--lwt-newtab-image-rendering");
		
		const lwThemeResource = LightweightThemeManager.themeData.theme;

		document.documentElement.style.removeProperty("--newtab-background-color");
		const newTabBackgroundColor = lwThemeResource.ntp_background;
		if (newTabBackgroundColor)
			document.documentElement.style.setProperty("--newtab-background-color", newTabBackgroundColor);	

		document.documentElement.style.removeProperty("--newtab-text-primary-color");
		const newTabColor = lwThemeResource.ntp_text;
		if (newTabColor)
			document.documentElement.style.setProperty("--newtab-text-primary-color", newTabColor)

		document.documentElement.style.removeProperty("--toolbarbutton-icon-fill");
		const toolbarButtonIconFill = lwThemeResource.icon_color;
		if (toolbarButtonIconFill)
			document.documentElement.style.setProperty("--toolbarbutton-icon-fill", toolbarButtonIconFill);	
		
		document.documentElement.style.removeProperty("--toolbar-bgcolor");
		const toolbarColor = lwThemeResource.toolbarColor;
		if (toolbarColor)
			document.documentElement.style.setProperty("--toolbar-bgcolor", toolbarColor);

		document.documentElement.style.removeProperty("--toolbar-color");
		const toolbarText = lwThemeResource.toolbar_text;
		if (toolbarText)
			document.documentElement.style.setProperty("--toolbar-color", toolbarText);

		// New Tab Background code
        const activeThemeID = gkPrefUtils.tryGet("extensions.activeThemeID").string;

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
					document.documentElement.style.setProperty("--lwt-newtab-background-image", backgroundImageUrls.join(', '));
				}

				if (json.imageRendering)
					document.documentElement.style.setProperty("--lwt-newtab-image-rendering", json.imageRendering);
					
				if (json.backgroundSize)
					document.documentElement.style.setProperty("--lwt-newtab-background-size", json.backgroundSize);

				if (json.backgroundPosition)
					document.documentElement.style.setProperty("--lwt-newtab-background-position", json.backgroundPosition);

				if (json.backgroundPositionX)
					document.documentElement.style.setProperty("--lwt-newtab-background-position-x", json.backgroundPositionX);

				if (json.backgroundPositionY)
					document.documentElement.style.setProperty("--lwt-newtab-background-position-y", json.backgroundPositionY);

				if (json.backgroundRepeat)
					document.documentElement.style.setProperty("--lwt-newtab-background-repeat", json.backgroundRepeat);

				if (json.attributionImage)
					document.documentElement.style.setProperty("--lwt-newtab-attribution-image", `url(chrome://userchrome/content/lwThemes/${activeThemeID}/${json.attributionImage})`);

				if (json.attributionWidth)
					document.documentElement.style.setProperty("--lwt-newtab-attribution-width", json.attributionWidth);

				if (json.attributionHeight)
					document.documentElement.style.setProperty("--lwt-newtab-attribution-height", json.attributionHeight);
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
					document.documentElement.style.setProperty("--lwt-newtab-image", backgroundImage);
                return;
            }

            const testImage = `${imagePath}${supportedFormats[index]}`;
            imageExists(testImage, (exists) => {
                if (exists) {
                    backgroundImage = `url("${testImage}")`;
                    document.documentElement.style.setProperty("--lwt-newtab-image", backgroundImage);
                } else {
                    checkNextFormat(index + 1);
                }
            });
        };

        checkNextFormat(0);
    }, 0);
}
document.addEventListener("DOMContentLoaded", setProperties);
Services.obs.addObserver(setProperties, "lightweight-theme-styling-update");

new LightweightThemeConsumer(document);