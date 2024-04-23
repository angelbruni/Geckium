const { LightweightThemeConsumer } = ChromeUtils.importESModule("resource://gre/modules/LightweightThemeConsumer.sys.mjs");
const { LightweightThemeManager } = ChromeUtils.importESModule("resource://gre/modules/LightweightThemeManager.sys.mjs");

function setFooterChoice() {
	document.documentElement.setAttribute("footer-themable", pref("Geckium.newTabHome.themeFooter").tryGet.bool())
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
        const activeThemeID = pref("extensions.activeThemeID").tryGet.string();

        const imagePath = `chrome://userchrome/content/lwThemes/${activeThemeID}/image`;
		
		const imageConfigPath = `chrome://userchrome/content/lwThemes/${activeThemeID}/config.json`;
		fetch(imageConfigPath)
			.then((response) => response.json())
			.then((json) => {
				document.documentElement.style.setProperty("--lwt-newtab-image-rendering", json.imageRendering);
				console.log(json)
			});

        // Check for supported image formats and set the background image accordingly
        const supportedFormats = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];

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
                if (backgroundImage) {
					document.documentElement.style.setProperty("--lwt-newtab-image", backgroundImage);
				} else {
					console.error("No supported image format found for the specified path:", imagePath);
				}
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