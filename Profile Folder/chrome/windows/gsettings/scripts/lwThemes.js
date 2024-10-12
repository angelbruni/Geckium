const lwThemesList = document.getElementById("lwthemes-grid");

async function getInstalledLwThemes() {
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

async function getLwThemeData(manipath) {
	try {
		const response = await fetch(manipath);
		const theme = await response.json();
		return theme;
	} catch (error) {
		console.error('Error fetching theme:', error);
		return null;
	}
}

async function populateLwThemesList() {
	let themeElm;

	const themes = await getInstalledLwThemes();

    lwThemesList.querySelectorAll("button[data-theme-name]").forEach(item => {
        item.remove();
    });

	themes.forEach(async theme => {
		const themeManifest = await getLwThemeData(`${theme.__AddonInternal__.rootURI}manifest.json`);

		let themeBanner;
		let themeBannerAlignment;
		let themeBannerTiling;
		let themeBannerSizing;
		
		if (themeManifest.browser_specific_settings && themeManifest.browser_specific_settings.geckium) {
			themeBanner = `background-image: ${themeManifest.browser_specific_settings.geckium.backgroundImage.map(obj => `url(${theme.__AddonInternal__.rootURI}${obj})`).join(', ')} !important;`;

			if (themeManifest.browser_specific_settings.geckium.backgroundPosition)
				themeBannerAlignment = `background-position: ${themeManifest.browser_specific_settings.geckium.backgroundPosition} !important;`;
			
			if (themeManifest.browser_specific_settings.geckium.backgroundRepeat)
				themeBannerTiling = `background-repeat: ${themeManifest.browser_specific_settings.geckium.backgroundRepeat} !important;`;
			
			if (themeManifest.browser_specific_settings.geckium.backgroundSize)
				themeBannerSizing = `background-size: ${themeManifest.browser_specific_settings.geckium.backgroundSize} !important;`;
			
		} else if (themeManifest.theme.images) {
			if (themeManifest.theme.images.theme_frame) {
				themeBanner = `background-image: url(${theme.__AddonInternal__.rootURI}/${themeManifest.theme.images.theme_frame});`;
			} else if (themeManifest.theme.images.additional_backgrounds) {
				themeBanner = `background-image: ${themeManifest.theme.images.additional_backgrounds.map(obj => `url(${theme.__AddonInternal__.rootURI}${obj})`).join(', ')} !important;`;

				if (themeManifest.theme.properties.additional_backgrounds_alignment)
					themeBannerAlignment = `background-position: ${themeManifest.theme.properties.additional_backgrounds_alignment.map(obj => obj).join(', ')} !important;`;

				if (themeManifest.theme.properties.additional_backgrounds_tiling)
					themeBannerTiling = `background-repeat: ${themeManifest.theme.properties.additional_backgrounds_tiling.map(obj => obj).join(', ')} !important;`;
			}
		}
		let themeBannerColor = themeManifest.theme.colors.frame || "white";

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
				data-theme-name="${theme.id}"
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

		lwThemesList.insertBefore(MozXULElement.parseXULToFragment(themeElm), document.getElementById("ffoxthemestile"));

		document.querySelector(`button[data-theme-name="${theme.id}"]`).addEventListener("click", () => {
			theme.enable();
			document.querySelector(`button[data-theme-name="${theme.id}"] input[type="radio"]`).checked = true;
		});

		document.querySelector(`button[data-theme-name="${theme.id}"] input[type="radio"]`).checked = theme.isActive;
	});
}

document.addEventListener("DOMContentLoaded", populateLwThemesList);