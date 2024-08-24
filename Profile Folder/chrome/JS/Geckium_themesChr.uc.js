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

    // Frame color is always used IF the frame image is satisfied
    //    Titlebar button background is used regardless of frame existing so long as titlebars AREN'T native
    // Toolbar color is NOT used until 68 enforces it as a fallback if the image is missing
    //      BUT its new tab button IS themed regardless

    //TODO: If there are no fallback colours, use the era's fallback palette if MD2+ - probably add this into systhemes as a [gkchrthemed] only System Theme override.

    static includeColorIfImage = [ //Colors added ONLY if their image variant exists, unless fallbacks are enabled, or amendments are enabled and manifest_version >= 2
        "frame"
    ]
    static fallbackOnlyColors = [ //Colors added ONLY if fallbacks are enabled or 68+ used, or amendments are enabled and manifest_version >= 2, and their image variant is missing
        "toolbar"
    ]

    static chrThemeFeatures = ["frame", "toolbar"];

    static accommodate(data) { //Makes amendments to theme data to include missing variables
        var accs = {
            "colors": {
                "ntp_section": ["toolbar"],
                "ntp_section_text": ["tab_text"],
                "ntp_section_link": ["tab_text"]
            }
        };
        for (const type of Object.keys(accs)) {
            if (!Object.keys(data.theme).includes(type)) {
                continue; //We need to accomodate non-existant variables to fallbacks of the same type
            }
            for (const i of Object.keys(accs[type])) {
                // For each value that DOESN'T exist...
                if (!Object.keys(data.theme[type]).includes(i)) {
                    // Use the first fallback value to exist
                    for (const ii of Object.values(accs[type][i])) {
                        if (data.theme[type][ii]) {
                            data.theme[type][i] = data.theme[type][ii];
                            break;
                        }
                    }
                }
            }
        }
        return data;
    }

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
        
        let features = []; // theme features to advertise to CSS
        let era = gkEras.getBrowserEra();
        let accman2plus = false;
        if (gkPrefUtils.tryGet("Geckium.chrTheme.accommodate").bool) {
            accman2plus = (getManVersion(theme) >= 2);
            // Modify theme data to include fallbacks for missing values
            theme = gkChrTheme.accommodate(theme);
        }
        let allowfbcolors = gkPrefUtils.tryGet("Geckium.chrTheme.fallbacks").int; // allow Fallback Colors

        // TODO: support colourable glare.

        // IMAGES
        if (theme.theme.images) {
            Object.entries(theme.theme.images).map(([key, value]) => {
                document.documentElement.style.setProperty(`${styleProperty(key)}`, `url('${file}/${value}')`);
                if (gkChrTheme.chrThemeFeatures.includes(key.substring(6))) {
                    features.push(key.substring(6));
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
        let hasframecol;
        let hasbuttoncol;
        if (theme.theme.colors) {
            Object.entries(theme.theme.colors).map(([key, value]) => {
                // Colours only included if their image is present pre-68
                if (gkChrTheme.includeColorIfImage.includes(key)) {
                    if (!theme.theme.images || !theme.theme.images["theme_" + key]) {
                        if (allowfbcolors == 2) {
                            return;
                        } else if (!accman2plus && era < 68 && allowfbcolors != 1) {
                            return;
                        }
                    }
                }
                // Colours only included as fallbacks pre-68
                if (gkChrTheme.fallbackOnlyColors.includes(key)) {
                    if (allowfbcolors == 2) {
                        return;
                    } else if (theme.theme.images && theme.theme.images["theme_" + key]) {
                        return;
                    } else if (!accman2plus && era < 68 && allowfbcolors != 1) {
                        return;
                    }
                }
                document.documentElement.style.setProperty(`${styleProperty(key)}`, `rgb(${value.join(', ')})`);
                if (key == "ntp_text") {
                    if (!ColorUtils.IsDark(value)) {
                        document.documentElement.style.setProperty("--chrtheme-ntp-logo-alternate", "1");
                    }
                } else if (key == "frame") {
                    hasframecol = true;
                } else if (key == "button_background") {
                    hasbuttoncol = true;
                }
                if (gkChrTheme.chrThemeFeatures.includes(key)) {
                    if (!features.includes(key)) {
                        features.push(key);
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
                    }
                    tintedColor = ColorUtils.HSLShift(tintMap[i], value);
                    if (i == "buttons" && JSON.stringify(tintedColor) == JSON.stringify(this.defaultToolbarButtonIconColour)) {
                        // If the tinted colour is the same as the default colour, do NOT tint.
                        continue;
                    }
                    document.documentElement.style.setProperty(
                        `${styleProperty(i == "buttons" ? "toolbar-button-icon" : i)}`,
                        `rgb(${tintedColor})`
                    );
                }
            }).join('\n');
        }

        if (isBrowserWindow) {
            // Windows 10 titlebutton foreground
            if (hasframecol && hasbuttoncol) {
                // Combine frame and titlebar backgrounds
                // FIXME: Surely there's a way better way to color-mix in JS...?
                var colorDiv = document.createElement("div");
                document.head.appendChild(colorDiv);
                colorDiv.style.backgroundColor=`color-mix(in srgb, rgb(${theme.theme.colors.button_background.join(', ')}) 100%, rgb(${theme.theme.colors.frame.join(', ')}))`;
                var color = window.getComputedStyle(colorDiv)["background-color"].match(/\d+/g);
                // Determine the colour using the combined frame colours
                if (ColorUtils.IsDark(color)) {
                    document.documentElement.style.setProperty(`${styleProperty("frame_color")}`, "white");
                } else {
                    document.documentElement.style.setProperty(`${styleProperty("frame_color")}`, "black");
                }
                document.head.removeChild(colorDiv);
            } else if (hasframecol) {
                // Determine the colour using the frame
                if (ColorUtils.IsDark(theme.theme.colors.frame)) {
                    document.documentElement.style.setProperty(`${styleProperty("frame_color")}`, "white");
                } else {
                    document.documentElement.style.setProperty(`${styleProperty("frame_color")}`, "black");
                }
            } else if (hasbuttoncol) {
                // Combine fallback frame and titlebar backgrounds
                // FIXME: Surely there's a way better way to do this too in JS...?
                var colorDiv = document.createElement("div");
                document.head.appendChild(colorDiv);
                colorDiv.style.backgroundColor=`color-mix(in srgb, rgb(${theme.theme.colors.button_background.join(', ')}) 100%, var(--default-titlebar-active))`;
                var color = window.getComputedStyle(colorDiv)["background-color"].match(/\d+/g);
                // Determine the colour using the combined frame colours
                if (ColorUtils.IsDark(color)) {
                    document.documentElement.style.setProperty(`${styleProperty("frame_color")}`, "white");
                } else {
                    document.documentElement.style.setProperty(`${styleProperty("frame_color")}`, "black");
                }
            }

            // Titlebar texture (native titlebar check)
            if (!features.includes("frame")) {
                isChrThemeNative = true;
            }
        }

        // Announce the theme usage
        isThemed = true;
        isChromeThemed = true;
        document.documentElement.setAttribute("gkthemed", true);
        document.documentElement.setAttribute("gkchrthemed", true);
        for (const i of gkChrTheme.chrThemeFeatures) {
            if (features.includes(i)) {
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