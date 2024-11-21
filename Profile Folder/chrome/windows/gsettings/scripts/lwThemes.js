// Initial variables
let lightLWTheme;
let darkLWTheme;

async function getInstalledLWThemes() {
	try {
		// Directly await the result if getAddonsByTypes returns a promise
		const themes = await AddonManager.getAddonsByTypes(["theme"]);
		if (Array.isArray(themes)) {
			if (gkPrefUtils.tryGet("devtools.debugger.lwthemes-enabled").bool)
				console.log("getInstalledLWThemes: Themes fetched successfully:", themes);
			return themes;  // Return the list of themes
		} else {
			throw new Error("No valid themes found");
		}
	} catch (error) {
		console.error("Error while fetching themes:", error);
		throw error;
	}
}

async function getLWThemesList() {
    const result = [];

	if (gkPrefUtils.tryGet("devtools.debugger.lwthemes-enabled").bool)
		console.log(`getLWThemesList: Looking for themes...`);

    const themes = await getInstalledLWThemes();
    for (const i in themes) {
        let theme = themes[i];
		// Map Light and Dark to theme modes if found
		if (theme.id.startsWith("firefox-compact-light@") && !lightLWTheme) {
			lightLWTheme = function(){
				theme.enable();
				gkPrefUtils.delete("Geckium.chrTheme.fileName");
			};

			if (gkPrefUtils.tryGet("devtools.debugger.lwthemes-enabled").bool)
				console.log(`getLWThemesList: Mapped Light to ${theme.id}`);
		} else if (theme.id.startsWith("firefox-compact-dark@") && !darkLWTheme) {
			darkLWTheme = function(){ theme.enable(); };

			if (gkPrefUtils.tryGet("devtools.debugger.lwthemes-enabled").bool)
				console.log(`getLWThemesList: Mapped Dark to ${theme.id}`);
		}
		// Skip themes mapped to theme modes
		if (theme.id.startsWith("default-theme@") || theme.id.startsWith("firefox-compact-light@") ||
				theme.id.startsWith("firefox-compact-dark@")) {
			if (gkPrefUtils.tryGet("devtools.debugger.lwthemes-enabled").bool)
				console.log(`getLWThemesList: Skipping ${theme.id} as it is mapped to the top...`);
			continue;
		}

		if (gkPrefUtils.tryGet("devtools.debugger.lwthemes-enabled").bool)
			console.log(`getLWThemesList: Trying to get ${theme.id}'s manifest...`);
        let mani = await getLWThemeData(`${theme.__AddonInternal__.rootURI}manifest.json`);
		if (!mani) {
			if (gkPrefUtils.tryGet("devtools.debugger.lwthemes-enabled").bool)
				console.log(`getLWThemesList: Skipping ${theme.id} as it has no manifest`);
			continue;
		}

		let themeSourceURL;
		if (theme.__AddonInternal__.installTelemetryInfo && theme.__AddonInternal__.installTelemetryInfo.sourceURL)
			themeSourceURL = theme.__AddonInternal__.installTelemetryInfo.sourceURL;

		let themeBanner;
		let themeBannerAlignment;
		let themeBannerTiling;
		let themeBannerSizing;
		if (mani.browser_specific_settings && mani.browser_specific_settings.geckium) {
			themeBanner = mani.browser_specific_settings.geckium.backgroundImage.map(obj => `url('${theme.__AddonInternal__.rootURI}${obj}')`).join(', ');

			if (mani.browser_specific_settings.geckium.backgroundPosition)
				themeBannerAlignment = mani.browser_specific_settings.geckium.backgroundPosition;
			
			if (mani.browser_specific_settings.geckium.backgroundRepeat)
				themeBannerTiling = mani.browser_specific_settings.geckium.backgroundRepeat;
			
			if (mani.browser_specific_settings.geckium.backgroundSize)
				themeBannerSizing = mani.browser_specific_settings.geckium.backgroundSize;

			if (gkPrefUtils.tryGet("devtools.debugger.lwthemes-enabled").bool)
				console.log(`getLWThemesList: Supplied Geckium-exclusive values to ${theme.id}'s thumbnail`);
			
		} else if (mani.theme.images) {
			if (mani.theme.images.theme_frame) {
				themeBanner = `url('${theme.__AddonInternal__.rootURI}/${mani.theme.images.theme_frame}')`;

				if (gkPrefUtils.tryGet("devtools.debugger.lwthemes-enabled").bool)
					console.log(`getLWThemesList: Set ${theme.id} banner to titlebar theme_frame`);
			} else if (mani.theme.images.additional_backgrounds && mani.theme.properties) {
				themeBanner = mani.theme.images.additional_backgrounds.map(obj => `url('${theme.__AddonInternal__.rootURI}${obj}')`).join(', ');

				if (mani.theme.properties.additional_backgrounds_alignment)
					themeBannerAlignment = mani.theme.properties.additional_backgrounds_alignment.map(obj => obj).join(', ');

				if (mani.theme.properties.additional_backgrounds_tiling)
					themeBannerTiling = mani.theme.properties.additional_backgrounds_tiling.map(obj => obj).join(', ');
			}

			if (gkPrefUtils.tryGet("devtools.debugger.lwthemes-enabled").bool)
				console.log(`getLWThemesList: Set ${theme.id} banner to titlebar additional_backgrounds`);
		}

        result.push({
            "type": "lwtheme",
			"browser": "firefox",
			"builtin": theme.__AddonInternal__._key.includes("app-builtin:"),
            "name": theme.name,
            "desc": theme.description,
            "id": theme.id,
			"page": themeSourceURL,
            "icon": theme.icons[128] ?
						theme.icons[128] : theme.icons[64] ?
							theme.icons[64] : theme.icons[32],
			"banner": themeBanner,
			"bannerAlignment": themeBannerAlignment ? themeBannerAlignment : "right top",
			"bannerTiling": themeBannerTiling ? themeBannerTiling : "no-repeat",
			"bannerSizing": themeBannerSizing ? themeBannerSizing : null,
			"bannerColor": mani.theme.colors.frame || "white",
            "version": theme.version,
			"apply": function() { theme.enable(); },
			"uninstall": function() { theme.uninstall(false); }
        });

		if (gkPrefUtils.tryGet("devtools.debugger.lwthemes-enabled").bool)
			console.log(`getLWThemesList: Added ${theme.id} to themes grid!`);
    }
    return result;
}


async function getLWThemeData(manipath) {
	try {
		const response = await fetch(manipath);
		const theme = await response.json();
		return theme;
	} catch (error) {
		console.error('Error fetching theme:', error);
		return null;
	}
}

function selectLWTheme() {
	let prefChoice = gkPrefUtils.tryGet("extensions.activeThemeID").string;
	if (!prefChoice.startsWith("default-theme@") && !prefChoice.startsWith("firefox-compact-light@") &&
			!prefChoice.startsWith("firefox-compact-dark@")) {
        themesList.querySelector(`button[data-lwtheme-name="${prefChoice}"] input[type="radio"]`).checked = true;
        document.getElementById("thememode-themed").checked = true;
	} else {
		themesList.querySelectorAll('button[data-lwtheme-name] input[type="radio"]').forEach(item => {
			item.checked = false;
		})
	}
}
const lwGridObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			selectLWTheme();
		}
	},
};
Services.prefs.addObserver("extensions.activeThemeID", lwGridObserver, false);