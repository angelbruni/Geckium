const { LightweightThemeConsumer } = ChromeUtils.importESModule("resource://gre/modules/LightweightThemeConsumer.sys.mjs");
const { LightweightThemeManager } = ChromeUtils.importESModule("resource://gre/modules/LightweightThemeManager.sys.mjs");
Components.utils.import("resource://gre/modules/FileUtils.jsm");

const profRootDir = FileUtils.getDir("ProfD", [])
					.path
					.replace(/\\/g, "/");

function setProperties() {
	setTimeout(() => {
		document.documentElement.style.removeProperty("--toolbarbutton-icon-fill");
		document.documentElement.style.removeProperty("--toolbar-color");
		document.documentElement.style.removeProperty("--lwt-newtab-image");
		document.documentElement.style.removeProperty("--lwt-newtab-image-rendering");

		const lwThemeResource = LightweightThemeManager.themeData.theme;
		const toolbarButtonIconFill = lwThemeResource.icon_color;
		const toolbarText = lwThemeResource.toolbar_text;

		if (toolbarButtonIconFill)
			document.documentElement.style.setProperty("--toolbarbutton-icon-fill", toolbarButtonIconFill);			

		if (toolbarText)
			document.documentElement.style.setProperty("--toolbar-color", toolbarText);

		// New Tab Background code
        const activeThemeID = pref("extensions.activeThemeID").tryGet.string()
                                .replace("{", "")
                                .replace("}", "");

        const imagePath = `file:///${profRootDir}/chrome/lwThemes/${activeThemeID}/image`;
		
		const imageConfigPath = `file:///${profRootDir}/chrome/lwThemes/${activeThemeID}/config.json`;
		fetch(imageConfigPath)
			.then((response) => response.json())
			.then((json) => {
				document.documentElement.style.setProperty("--lwt-newtab-image-rendering", json.imageRendering);
				console.log(json)
			});

        // Check for supported image formats and set the background image accordingly
        const supportedFormats = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

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