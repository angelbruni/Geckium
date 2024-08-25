// ==UserScript==
// @name        Geckium - Chromium Theme Manager
// @author      Dominic Hayes
// @loadorder   2
// @include		main
// ==/UserScript==

Components.utils.import("resource://gre/modules/FileUtils.jsm");
const { ColorUtils } = ChromeUtils.importESModule("chrome://modules/content/ChromiumColorUtils.sys.mjs");
// Initial variables
let isChromeThemed;
let isChrThemeNative;
const chrThemesFolder = `file://${FileUtils.getDir("ProfD", []).path.replace(/\\/g, "/")}/chrome/chrThemes`; // bruni, you could SO make this a custom-settable path now btw

// Chrome Themes
class gkChrTheme {
	static get defaultToolbarButtonIconColour() {
		let appearanceChoice = gkEras.getBrowserEra();

		if (appearanceChoice <= 6)
			return [88, 118, 171];
		else if (appearanceChoice == 11)
			return [87, 102, 128];
		else if (appearanceChoice <= 68)
			return [111, 111, 111];
	}

	static get getFolderFileUtilsPath() {
		return Services.io.newURI(chrThemesFolder, null, null).QueryInterface(Components.interfaces.nsIFileURL).file.path;
	}

    static async getThemes() {
        function hasImage(data, imageid) {
            if (data.theme.images) {
                return Object.keys(data.theme.images).includes(imageid);
            }
            return false;
        }

        var themes = {};
        try {
            const directory = FileUtils.File(gkChrTheme.getFolderFileUtilsPath);

            if (directory.exists() && directory.isDirectory()) {
                var directoryEntries = directory.directoryEntries;
                var fetchPromises = [];

                while (directoryEntries.hasMoreElements()) {
                    const file = directoryEntries.getNext().QueryInterface(Components.interfaces.nsIFile);
                    if (file.leafName.endsWith(".crx")) {
                        const themeManifest = `jar:${chrThemesFolder}/${file.leafName}!/manifest.json`;

                        const fetchPromise = fetch(themeManifest)
                            .then((response) => response.json())
                            .then((theme) => {
                                if (!theme.theme) {
                                    console.error("Error fetching theme manifest: not a theme");
                                    return;
                                }

                                let themeBanner;
                                let themeBannerColor;
                                if (hasImage(theme, "theme_ntp_background")) {
                                    themeBanner = theme.theme.images.theme_ntp_background;
                                    try {
                                        themeBannerColor = theme.theme.colors.ntp_background;
                                    } catch {
                                        themeBannerColor = undefined;
                                    }
                                } else if (hasImage(theme, "theme_frame")) {
                                    themeBanner = theme.theme.images.theme_frame;
                                    try {
                                        themeBannerColor = theme.theme.colors.frame;
                                    } catch {
                                        themeBannerColor = undefined;
                                    }
                                } else { // Colours only - use fallback hierachy on both colors
                                    try {
                                        if (theme.theme.colors.ntp_background) {
                                            themeBannerColor = theme.theme.colors.ntp_background;
                                        } else if (theme.theme.colors.frame) {
                                            themeBannerColor = theme.theme.colors.frame;
                                        }
                                    } catch {
                                        themeBannerColor = undefined;
                                    }
                                }

                                let themeIcon;
                                try {
                                    themeIcon = theme.theme.icons[48];
                                } catch {
                                    try {
                                        themeIcon = theme.icons[48];
                                    } catch {
                                        themeIcon = undefined;
                                    }
                                }

                                themes[theme.name] = {
                                    banner: themeBanner,
                                    color: themeBannerColor,
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

    static getEligible() {
        let prefChoice = gkPrefUtils.tryGet("extensions.activeThemeID").string;
        // Chromium Themes require Light Theme
        if (prefChoice.startsWith("firefox-compact-light@") && gkLWTheme.palettesMatch("light")) {
            return true;
        }
        return false;
    }

    static async getThemeData(manipath) {
        try {
            const response = await fetch(manipath);
            const theme = await response.json();
            return theme;
        } catch (error) {
            console.error('Error fetching theme:', error);
            return null; // Or handle the error appropriately
        }
	}
    
    /** Fallback colors:
     * colorRequiresImage: Colors only included if:
     *  - their image counterpart exists
     *  - fallbacks are enabled*
     * 
     * fallbackOnlyColors: Colors only included if:
     *  - fallbacks are enabled* and their image counterpart does not exist
     * 
     *  * if fallbacks are set to automatic, they will be enabled if Accommodation is
     *      enabled and manifest_version is 2 or higher, or Geckium's Design is 68 or newer.
    */
    static colorRequiresImage = {
        "frame": "frame", // Frame color is always used IF the frame image is satisfied
        "frame_inactive": "frame"
    }
    static fallbackOnlyColors = {
        "toolbar": "toolbar" // Toolbar color is NOT used until 68+ enforced it as a fallback if the image is missing
    }
    //TODO: If there are no fallback colours, use the era's fallback palette if MD2+ - probably add this into systhemes as a [gkchrthemed] only System Theme override.

    /** Colour over tints prioritisation
     * These tints are only used if:
     *  - their colour counterpart doesn't exist
     *  - fallbacks are disabled
     */
    static noTintIfColor = {
        "buttons": "toolbar_button_icon" // Since 68, the colour is used instead of tints if it's present
    }

    /** excludeFallback: Returns True if the colour is a fallback that shouldn't be used given current preferences
     * 
     * key: The ID of the colour
     * data: The current theme metadata
     * usefallbacks: Self-explanatory
     */
    static excludeFallback(key, data, usefallbacks) {
        // Omit colours based on colorRequiresImage
        if (Object.keys(gkChrTheme.colorRequiresImage).includes(key)) {
            if (!data.images || !data.images["theme_" + gkChrTheme.colorRequiresImage[key]]) {
                if (!usefallbacks) {
                    return true;
                }
            }
        }
        // Omit colours based on fallbackOnlyColors
        if (Object.keys(gkChrTheme.fallbackOnlyColors).includes(key)) {
            if (data.images && data.images["theme_" + gkChrTheme.fallbackOnlyColors[key]]) {
                return true; // ALWAYS exclude if the image exists for Grass and others' benefit
            } else if (!usefallbacks) {
                return true;
            }
        }
        return false;
    }

    // themeCSSIndicators: Theming to advertise to the CSS that the Chromium Theme has
    static themeCSSIndicators = ["frame", "toolbar"];

    /** accommodate: Adjust theme metadata to include values missing in old and modern themes respectively
     * Uses manifest_version to determine which adjustments should be made - 'all' means any theme
     * 
     * data: The theme's unmodified metadata
     * maniver: manifest_version value identified during metadata initialisation
     */
    static accommodate(data, maniver) {
        if (maniver > 2) {
            maniver = 2; // Themes newer than version 2 use V2's accommodations
        }
        var maniAdj = {
            "all": {
                "colors": {
                    "ntp_section": ["toolbar"],
                    "ntp_section_text": ["tab_text"],
                    "ntp_section_link": ["tab_text"]
                }
            },
            "2": {
                "colors": {
                    "ntp_header": ["frame"]
                }
            }
        };
        for (const ver of ["all", maniver.toString()]) {
            // Don't adjust for manivers we don't have accommodations for
            if (!Object.keys(maniAdj).includes(ver)) {
                continue;
            }
            for (const type of Object.keys(maniAdj[ver])) {
                // Don't attempt to accommodate values of types the theme doesn't include
                if (!Object.keys(data.theme).includes(type)) {
                    continue;
                }
                for (const id of Object.keys(maniAdj[ver][type])) {
                    // For each value that DOESN'T exist...
                    if (!Object.keys(data.theme[type]).includes(id)) {
                        // Use the first existing fallback value to supplement it
                        for (const fallback of Object.values(maniAdj[ver][type][id])) {
                            if (data.theme[type][fallback]) {
                                data.theme[type][id] = data.theme[type][fallback];
                                break; // Don't try for more supplement values
                            }
                        }
                    }
                }
            }
        }
        return data;
    }

    /** setVariables: Applies the selected Chromium Theme
     * 
     * theme: The theme's unmodified metadata
     * file: Path to the CRX file
     */
    static setVariables(theme, file) {
        function styleProperty(key) {
            return `--chrtheme-${key.replace(/_/g, '-')}`;
        }
        function getManVersion(data) {
            if (data.manifest_version) {
                return data.manifest_version;
            }
            return 0;
        }
        function useFallbacks(accommodate, maniver, era) {
            switch (gkPrefUtils.tryGet("Geckium.chrTheme.fallbacks").int) {
                case 1: // Enabled
                    return true;
                case 2: // Disabled
                    return false;
                default: // aka 0 - Automatic
                    if ((accommodate && maniver >= 2) || era >= 68) {
                        return true;
                    } else {
                        return false;
                    }
            }
        }
        
        let indicators = []; // themed elements to advertise to CSS
        let era = gkEras.getBrowserEra();
        let maniver = getManVersion(theme);
        let accommodate = gkPrefUtils.tryGet("Geckium.chrTheme.accommodate").bool;
        if (accommodate) {
            // Modify theme data to include fallbacks for missing values
            theme = gkChrTheme.accommodate(theme, maniver);
        }
        let usefallbacks = useFallbacks(accommodate, maniver, era);

        // IMAGES
        if (theme.theme.images) {
            Object.entries(theme.theme.images).map(([key, value]) => {
                document.documentElement.style.setProperty(`${styleProperty(key)}`, `url('${file}/${value}')`);
                if (gkChrTheme.themeCSSIndicators.includes(key.substring(6))) {
                    indicators.push(key.substring(6)); // Exclude the 'theme_' portion
                }
            }).join('\n');

            // Theme Attribution
            const attributionImg = theme.theme.images.theme_ntp_attribution;
            if (attributionImg) {
                var imagePath = `${file}/${attributionImg}`;
                // Note the attribution image's size
                var img = new Image();
                img.src = imagePath;
                img.onload = function() {
                    document.documentElement.style.setProperty("--chrtheme-theme-ntp-attribution-width", `${this.width}px`);
                    document.documentElement.style.setProperty("--chrtheme-theme-ntp-attribution-height", `${this.height}px`);
                };
            }
        }

        // COLORS
        let framecol;
        if (theme.theme.colors) {
            Object.entries(theme.theme.colors).map(([key, value]) => {
                if (gkChrTheme.excludeFallback(key, theme.theme, usefallbacks)) {
                    return;
                }
                // The colour passed omissions - proceed with inclusion
                document.documentElement.style.setProperty(`${styleProperty(key)}`, `rgb(${value.join(', ')})`);
                if (key == "ntp_text") {
                    if (!ColorUtils.IsDark(value)) {
                        document.documentElement.style.setProperty("--chrtheme-ntp-logo-alternate", "1");
                    }
                } else if (key == "frame") {
                    framecol = value;
                }
                if (gkChrTheme.themeCSSIndicators.includes(key)) {
                    if (!indicators.includes(key)) {
                        indicators.push(key);
                    }
                }
            }).join('\n');
        }

        // MISC. PROPERTIES
        if (theme.theme.properties) {
            Object.entries(theme.theme.properties).map(([key, value]) => {
                switch (key) {
                    case "ntp_logo_alternate":
                        if (theme.theme.colors.ntp_text) {
                            if (!ColorUtils.IsDark(theme.theme.colors.ntp_text))
                                document.documentElement.style.setProperty(`${styleProperty(key)}`, value);
                        }
                        break;
                    default:
                        document.documentElement.style.setProperty(`${styleProperty(key)}`, value);
                        break;
                }
            }).join('\n');
        }

        // TINTS
        let themeTints = (theme.theme.tints) ? theme.theme.tints : theme.tints;
        if (themeTints) {
            Object.entries(themeTints).map(([key, value]) => {
                const percentageValue = value.map((value, index) => (index > 0 ? (value * 100) + '%' : value));
                let tintedColor;
                const tintMap = {
                    "frame": theme.theme.colors.frame,
                    "frame_inactive": theme.theme.colors.frame_inactive,
                    "background_tab": theme.theme.colors.background_tab,
                    "buttons": gkChrTheme.defaultToolbarButtonIconColour
                };
                for (const i of Object.keys(tintMap)) {
                    if (!Object.keys(themeTints).includes(i) || !tintMap[i]) {
                        continue;
                    } else if (gkChrTheme.excludeFallback(i, theme.theme, usefallbacks)) {
                        continue; // Don't tint excluded colors
                    } else if (Object.keys(gkChrTheme.noTintIfColor).includes(i)) {
                        if (theme.theme.colors && theme.theme.colors[gkChrTheme.noTintIfColor[i]]) {
                            if ((accommodate && maniver >= 2) || era >= 68) {
                                continue; // Don't tint in 68+, or accommodated manifest_version 2+, if the modern Chromium toolbar icon fill value is present
                            }
                        }
                    }
                    tintedColor = ColorUtils.HSLShift(tintMap[i], value);
                    if (i == "buttons" && JSON.stringify(tintedColor) == JSON.stringify(this.defaultToolbarButtonIconColour)) {
                        // If the tinted colour is the same as the default colour, do NOT tint.
                        continue;
                    } else if (i == "frame") {
                        framecol = tintedColor;
                    }
                    document.documentElement.style.setProperty(
                        `${styleProperty(i == "buttons" ? "toolbar-button-icon" : i)}`,
                        `rgb(${tintedColor.join(', ')})`
                    );
                }
            }).join('\n');
        }

        // Extra titlebar exclusive values
        if (isBrowserWindow) {
            // Native titlebar chrTheme eligibility
            if (!indicators.includes("frame")) {
                isChrThemeNative = true;
            }

            // Titlebar foreground
            if (framecol) {
                // Determine the colour using the frame
                if (ColorUtils.IsDark(framecol)) {
                    document.documentElement.style.setProperty(`${styleProperty("frame_color")}`, "white");
                } else {
                    document.documentElement.style.setProperty(`${styleProperty("frame_color")}`, "black");
                }
            }
            // Button foreground
            if (theme.theme.colors && theme.theme.colors.button_background) {
                // Extract opacity value from the colour
                let buttopacity = "100%";
                var buttonbg = theme.theme.colors.button_background;
                if (buttonbg.length == 4) {
                    buttopacity = (buttonbg[3] > 0 ? (buttonbg[3] * 100) + '%' : "0%");
                }
                // Combine frame and titlebar backgrounds
                var titlebarbg = framecol ? 
                                    `rgb(${framecol.join(', ')})` :
                                    `var(--default-titlebar-color)`
                // FIXME: Surely there's a way better way to color-mix in JS...?
                var colorDiv = document.createElement("div");
                document.head.appendChild(colorDiv);
                colorDiv.style.backgroundColor=`color-mix(in srgb, rgb(${buttonbg[0]},${buttonbg[1]},${buttonbg[2]}) 100%, ${titlebarbg})`;
                var color = window.getComputedStyle(colorDiv)["background-color"].match(/\d+/g);
                // Determine the colour using the combined frame colours
                if (ColorUtils.IsDark(color)) {
                    document.documentElement.style.setProperty(`${styleProperty("button_color")}`, "white");
                } else {
                    document.documentElement.style.setProperty(`${styleProperty("button_color")}`, "black");
                }
                document.head.removeChild(colorDiv);
            }
        }

        // Announce the theme usage
        isThemed = true;
        isChromeThemed = true;
        document.documentElement.setAttribute("gkthemed", true);
        document.documentElement.setAttribute("gkchrthemed", true);
        for (const i of gkChrTheme.themeCSSIndicators) {
            if (indicators.includes(i)) {
                document.documentElement.setAttribute("gkchrthemehas" + i, "");
            } else {
                document.documentElement.removeAttribute("gkchrthemehas" + i);
            }
        }
        if (isBrowserWindow) {
            // Reapply titlebar to toggle native mode if applicable to
            gkTitlebars.applyTitlebar();
        }
    }

    /** removeVariables: Removes all Chromium Theme variables, unapplying the current Chromium Theme
     */
    static removeVariables() {
        // Deactivate theme checks
        isChromeThemed = false;
        if (isBrowserWindow) { isChrThemeNative = false; }
        document.documentElement.removeAttribute("gkchrthemed");
        if (!gkLWTheme.isThemed) {
            isThemed = false;
            document.documentElement.removeAttribute("gkthemed");
        }
        // Remove variables from CSS
        Array.from(getComputedStyle(document.documentElement)).forEach(propertyName => {
			if (propertyName.startsWith('--chrtheme-')) {
				document.documentElement.style.removeProperty(propertyName);
			}
		});
    }

    /** applyTheme: Performs required sanity checks and then initiates the Chromium Theme applying process
     */
    static applyTheme() {
        // FIXME: This one needs to default to True
        if (!gkPrefUtils.prefExists("Geckium.chrTheme.accommodate")) {
		    gkPrefUtils.set("Geckium.chrTheme.accommodate").bool(true);																			    // Add default apps if the apps list is empty
	    }
        gkChrTheme.removeVariables(); // Not all variables can be ensured to be replaced, thus pre-emptively remove EVERY possible variable.
        let prefChoice = gkPrefUtils.tryGet("Geckium.chrTheme.fileName").string;
        setTimeout(async () => { // same situation as themesLW, plus we NEED async. :/
            if (gkChrTheme.getEligible() && prefChoice) {
                let file = `jar:${chrThemesFolder}/${prefChoice}.crx!`;
                // Load and apply the selected Chromium Theme
                let theme = await gkChrTheme.getThemeData(`${file}/manifest.json`);
                if (theme != null && theme.theme) {
                    gkChrTheme.setVariables(theme, file);
                    return;
                }
            }
            if (isBrowserWindow) {
                // Reapply titlebar just in case since theme application failed
                gkTitlebars.applyTitlebar();
            }
        }, 0);
    }

    /** LWThemeChanged: Disables the Chromium Theme entirely if another Firefox theme is switched to
     */
    static LWThemeChanged() {
        setTimeout(async () => {
            let prefChoice = gkPrefUtils.tryGet("extensions.activeThemeID").string;
            if (!prefChoice.startsWith("firefox-compact-light@")) {
                // If the user is not using Light, it signifies they want to use normal themes, thus reset their setting
                gkPrefUtils.set("Geckium.chrTheme.fileName").string("");
            }
        }, 0);
    }
}
window.addEventListener("load", gkChrTheme.applyTheme);
Services.obs.addObserver(gkChrTheme.applyTheme, "lightweight-theme-styling-update"); //Disable upon failing criteria

window.addEventListener("load", gkChrTheme.LWThemeChanged);
Services.obs.addObserver(gkChrTheme.LWThemeChanged, "lightweight-theme-styling-update");

const chrThemeObs = {
	observe: function (subject, topic, data) {
		gkChrTheme.applyTheme();
	},
};
Services.prefs.addObserver("Geckium.chrTheme.fileName", chrThemeObs, false);
Services.prefs.addObserver("Geckium.chrTheme.accommodate", chrThemeObs, false);
Services.prefs.addObserver("Geckium.chrTheme.fallbacks", chrThemeObs, false);
Services.prefs.addObserver("Geckium.appearance.choice", chrThemeObs, false);
Services.prefs.addObserver("Geckium.main.overrideStyle", chrThemeObs, false);
Services.prefs.addObserver("Geckium.main.style", chrThemeObs, false);