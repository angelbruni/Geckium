// Initial variables
let lightLWTheme;
let darkLWTheme;

async function getInstalledLWThemes() {
	try {
		// Directly await the result if getAddonsByTypes returns a promise
		const themes = await AddonManager.getAddonsByTypes(["theme"]);
		if (Array.isArray(themes)) {
			console.log("Themes fetched successfully:", themes);
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
    const themes = await getInstalledLWThemes();

    for (const i in themes) {
        let theme = themes[i];
		// Map Light and Dark to theme modes if found
		if (theme.id.startsWith("firefox-compact-light@") && !lightLWTheme) {
			lightLWTheme = function(){
				theme.enable();
				gkPrefUtils.delete("Geckium.chrTheme.fileName");
			};
		} else if (theme.id.startsWith("firefox-compact-dark@") && !darkLWTheme) {
			darkLWTheme = function(){ theme.enable(); };
		}
		// Skip themes mapped to theme modes
		if (theme.id.startsWith("default-theme@") || theme.id.startsWith("firefox-compact-light@") ||
				theme.id.startsWith("firefox-compact-dark@")) {
			continue;
		}

        let mani = await getLWThemeData(`${theme.__AddonInternal__.rootURI}manifest.json`);

		let themeBanner;
		let themeBannerAlignment;
		let themeBannerTiling;
		let themeBannerSizing;
		if (mani.browser_specific_settings && mani.browser_specific_settings.geckium) {
			themeBanner = mani.browser_specific_settings.geckium.backgroundImage.map(obj => `url(${theme.__AddonInternal__.rootURI}${obj})`).join(', ');

			if (mani.browser_specific_settings.geckium.backgroundPosition)
				themeBannerAlignment = mani.browser_specific_settings.geckium.backgroundPosition;
			
			if (mani.browser_specific_settings.geckium.backgroundRepeat)
				themeBannerTiling = mani.browser_specific_settings.geckium.backgroundRepeat;
			
			if (mani.browser_specific_settings.geckium.backgroundSize)
				themeBannerSizing = mani.browser_specific_settings.geckium.backgroundSize;
			
		} else if (mani.theme.images) {
			if (mani.theme.images.theme_frame) {
				themeBanner = `url(${theme.__AddonInternal__.rootURI}/${mani.theme.images.theme_frame})`;
			} else if (mani.theme.images.additional_backgrounds) {
				themeBanner = mani.theme.images.additional_backgrounds.map(obj => `url(${theme.__AddonInternal__.rootURI}${obj})`).join(', ');

				if (mani.theme.properties.additional_backgrounds_alignment)
					themeBannerAlignment = mani.theme.properties.additional_backgrounds_alignment.map(obj => obj).join(', ');

				if (mani.theme.properties.additional_backgrounds_tiling)
					themeBannerTiling = mani.theme.properties.additional_backgrounds_tiling.map(obj => obj).join(', ');
			}
		}

        result.push({
            "type": "lwtheme",
            "name": theme.name,
            "desc": theme.description,
            "id": theme.id,
            "icon": theme.icons[128] ?
						theme.icons[128] : theme.icons[64] ?
							theme.icons[64] : theme.icons[32],
			"banner": themeBanner,
			"bannerAlignment": themeBannerAlignment ? themeBannerAlignment : null,
			"bannerTiling": themeBannerTiling ? themeBannerTiling : null,
			"bannerSizing": themeBannerSizing ? themeBannerSizing : null,
			"bannerColor": mani.theme.colors.frame || "white",
            "version": theme.version,
			"event": function(){ theme.enable(); }
        });
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

async function populateLWThemesList() {
	let themeElm;

	const themes = await getInstalledLWThemes();

    themesList.querySelectorAll("button[data-lwtheme-name]").forEach(item => {
        item.remove();
    });

	themes.forEach(async theme => {
		const mani = await getLWThemeData(`${theme.__AddonInternal__.rootURI}manifest.json`);

		

		let themeIcon;
		if (theme.icons[128])
			themeIcon = theme.icons[128];
		else if (theme.icons[64])
			themeIcon = theme.icons[64];
		else
			themeIcon = theme.icons[32]

		let themeDescription = theme.description
		? theme.description.replace(/[&<>"']/g, match => specialCharacters[match])
		: gSettingsBundle.GetStringFromName("themeHasNoDescription");

		themeElm = `
		<html:button
				class="link geckium-appearance ripple-enabled"
				data-lwtheme-name="${theme.id}"
				data-index="${theme.id}"
                style="background-color: ${themeBannerColor}; ${themeBanner} ${themeBannerAlignment} ${themeBannerTiling} ${themeBannerSizing}">
			<html:label class="wrapper">
				<div class="year">V${theme.version}</div>
				<div class="icon"><image style="width: 48px; height: 48px" src="${themeIcon}" /></div>
				<div class="identifier">
					<vbox style="min-width: 0">
						<div class="radio-parent">
							<html:input id="theme-${theme.id}" class="radio" type="radio" name="gktheme"></html:input>
							<div class="gutter" for="checked_check"></div>
							<html:label class="name label">${theme.name}</html:label>
						</div>
						<html:label class="description">${themeDescription}</html:label>
					</vbox>
				</div>
			</html:label>
		</html:button>
		`;

		themesList.insertBefore(MozXULElement.parseXULToFragment(themeElm), document.getElementById("gkwebstoretile"));

		document.querySelector(`button[data-lwtheme-name="${theme.id}"]`).addEventListener("click", () => {
			theme.enable();
		});
	});
}