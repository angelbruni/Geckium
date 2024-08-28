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

			setTimeout(async () => {
				// 3rd-party (legacy debug override): Add Geckium-exclusive values
				// NOTE: This should ONLY be used for debugging Geckium-enhanced lwtheme configs
				try {
					const legacyConfigPath = `chrome://userchrome/content/lwTesting/${activeThemeID}/config.json`;
					const response = await fetch(legacyConfigPath);
					const json = await response.json();
					if (json.backgroundImage) {
						let backgroundImageUrls = [];
						for (let key in json.backgroundImage) {
							if (json.backgroundImage.hasOwnProperty(key)) {
								backgroundImageUrls.push(`url(chrome://userchrome/content/lwTesting/${activeThemeID}/${json.backgroundImage[key]})`);
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
						document.documentElement.style.setProperty("--lwt-gknewtab-attribution-image", `url(chrome://userchrome/content/lwTesting/${activeThemeID}/${json.attributionImage})`);

					if (json.attributionWidth)
						document.documentElement.style.setProperty("--lwt-gknewtab-attribution-width", json.attributionWidth);

					if (json.attributionHeight)
						document.documentElement.style.setProperty("--lwt-gknewtab-attribution-height", json.attributionHeight);

					// Do not load original lwtheme's values
					return;
				} catch {}

				// 3rd-party: Add Geckium-exclusive values
				//  FIXME: Can someone make this get the manifest via built-in APIs?
				let fullmani;
				let xpipath;
				try {
					var addon = await AddonManager.getAddonByID(activeThemeID);
					xpipath = addon.__AddonInternal__.rootURI;
					const response = await fetch(xpipath + "manifest.json");
					fullmani = await response.json();
				} catch (error) {
					console.error('Error fetching lwtheme - WHAT:', error);
					return;
				}
				if (!fullmani.browser_specific_settings || !fullmani.browser_specific_settings.geckium) {
					return; // Nothing to do here as Geckium's settings aren't included.
				}
				// Ensure colours match their advertised counterparts (anti-Firefox Color/etc. check)
				for (const i of Object.keys(fullmani.theme.colors)) {
					if (Object.keys(lwThemeResource).includes(i)) {
						if (lwThemeResource[i] != fullmani.theme.colors[i]) {
							return;
						}
					}
				}

				fullmani = fullmani.browser_specific_settings.geckium;
				if (fullmani.backgroundImage) {
					let backgroundImageUrls = [];
					for (let key in fullmani.backgroundImage) {
						if (fullmani.backgroundImage.hasOwnProperty(key)) {
							backgroundImageUrls.push(`url(${xpipath}${fullmani.backgroundImage[key]})`);
						}
					}
					document.documentElement.style.setProperty("--lwt-gknewtab-background-image", backgroundImageUrls.join(', '));
				}

				if (fullmani.imageRendering)
					document.documentElement.style.setProperty("--lwt-gknewtab-image-rendering", fullmani.imageRendering);
					
				if (fullmani.backgroundSize)
					document.documentElement.style.setProperty("--lwt-gknewtab-background-size", fullmani.backgroundSize);

				if (fullmani.backgroundPosition)
					document.documentElement.style.setProperty("--lwt-gknewtab-background-position", fullmani.backgroundPosition);

				if (fullmani.backgroundPositionX)
					document.documentElement.style.setProperty("--lwt-gknewtab-background-position-x", fullmani.backgroundPositionX);

				if (fullmani.backgroundPositionY)
					document.documentElement.style.setProperty("--lwt-gknewtab-background-position-y", fullmani.backgroundPositionY);

				if (fullmani.backgroundRepeat)
					document.documentElement.style.setProperty("--lwt-gknewtab-background-repeat", fullmani.backgroundRepeat);

				if (fullmani.attributionImage)
					document.documentElement.style.setProperty("--lwt-gknewtab-attribution-image", `url(${xpipath}${fullmani.attributionImage})`);

				if (fullmani.attributionWidth)
					document.documentElement.style.setProperty("--lwt-gknewtab-attribution-width", fullmani.attributionWidth);

				if (fullmani.attributionHeight)
					document.documentElement.style.setProperty("--lwt-gknewtab-attribution-height", fullmani.attributionHeight);
			}, 0);
		}
    }, 0);
}
document.addEventListener("DOMContentLoaded", setProperties);
Services.obs.addObserver(setProperties, "lightweight-theme-styling-update");

new LightweightThemeConsumer(document);