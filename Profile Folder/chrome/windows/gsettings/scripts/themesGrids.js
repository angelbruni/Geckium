const modesList = document.getElementById("thememode-grid");

function generateThemeModes() {
    var modes = {
        "auto": disableTheme,
        "light": lightLWTheme,
        "dark": darkLWTheme,
        "themed": null
    }

    for (const mode in modes) {
        if (!modes[mode] && mode != "themed") {
            continue; // Don't add modes if they aren't mapped to an LWTheme
        }

        let modeElm = document.createElement("input");
		modeElm.type = "radio";
        modeElm.id = `thememode-${mode}`;
		modeElm.name = "thememode";
		modeElm.classList.add("thememode", "ripple-enabled");

        if (modes[mode]) {
		    modeElm.addEventListener("click", modes[mode]);
        }
        modesList.appendChild(modeElm);
    }
}


const themesList = document.getElementById("gkthemes-grid");

async function initGrids() {
    // Map filter dropdown


    // Populate themes and modes lists
    await populateThemesList();

    // Generate theme modes list
    generateThemeModes();

    // Pre-select theme and theme mode
    selectTheme();
}
document.addEventListener("DOMContentLoaded", initGrids);

async function populateThemesList() {
    // Delete all existing cases of themes
    for (const i in ["chrtheme", "lwtheme"]) {
        themesList.querySelectorAll(`button[data-${i}-name]`).forEach(item => {
            item.remove();
        });
    }

    // Get info about all chrThemes and LWThemes
    var themeInfo = await getChrThemesList();
    themeInfo.push.apply(themeInfo, await getLWThemesList());

    // Sort themes by name
    themeInfo.sort((a, b) => {
        return a.name.localeCompare(b.name)
    });

    // Create representations for the themes
    for (const i in themeInfo) {
        let themeName = themeInfo[i].name.replace(/[&<>"']/g, match => specialCharacters[match]);
        let themeDescription = themeInfo[i].desc
            ? themeInfo[i].desc.replace(/[&<>"']/g, match => specialCharacters[match])
            : gSettingsBundle.GetStringFromName("themeHasNoDescription");

        let themeIconPath = themeInfo[i].icon
            ? themeInfo[i].icon
            : "chrome://userchrome/content/windows/gsettings/imgs/logo.svg";

        let themeElm = `
        <html:button
                class="link geckium-appearance ripple-enabled"
                data-${themeInfo[i].type}-name="${themeInfo[i].id}"
                style="background-color: ${themeInfo[i].bannerColor}; background-image: ${themeInfo[i].banner};
                    background-position: ${themeInfo[i].bannerAlignment} !important; background-repeat: ${themeInfo[i].bannerTiling} !important;
                    background-size: ${themeInfo[i].bannerSizing} !important;">
            <html:label class="wrapper">
                <div class="year">V${themeInfo[i].version}</div>
                <div class="icon"><image style="width: 48px; height: 48px" src="${themeIconPath}" /></div>
                <div class="identifier">
                    <vbox style="min-width: 0">
                        <div class="radio-parent">
                            <html:input id="theme-${themeInfo[i].id}" class="radio" type="radio" name="gktheme"></html:input>
                            <div class="gutter" for="checked_check"></div>
                            <html:label class="name label">${themeName}</html:label>
                        </div>
                        <html:label class="description">${themeDescription}</html:label>
                    </vbox>
                </div>
            </html:label>
        </html:button>
        `;

        themesList.insertBefore(MozXULElement.parseXULToFragment(themeElm), document.getElementById("gkwebstoretile"));

		document.querySelector(`button[data-${themeInfo[i].type}-name="${themeInfo[i].id}"]`).addEventListener("click", themeInfo[i].event);
    }
}

function selectTheme() {
    // TODO: optimise?
    let sysChoice = gkPrefUtils.tryGet("Geckium.appearance.systemTheme").string;
	if (!gkSysTheme.systhemes.includes(sysChoice) && sysChoice != "auto") {
		sysChoice = "auto";
	}
    document.getElementById("thememode-themed").style.setProperty("display", "none");
	// Mark the current System Theme as fallback
	themesList.querySelectorAll("button[data-systheme]").forEach(item => {
		if (item.dataset.systheme == sysChoice) {
			item.querySelector(".year").style.removeProperty("display");
		} else {
			item.querySelector(".year").style.setProperty("display", "none");
		}
	})

    let lwChoice = gkPrefUtils.tryGet("extensions.activeThemeID").string;
    // Custom LWThemes
    if (!lwChoice.startsWith("default-theme@") && !lwChoice.startsWith("firefox-compact-light@") &&
				!lwChoice.startsWith("firefox-compact-dark@")) {
        themesList.querySelector(`button[data-lwtheme-name="${lwChoice}"] input[type="radio"]`).checked = true;
        document.getElementById("thememode-themed").checked = true;
        document.getElementById("thememode-themed").style.removeProperty("display");
    } else {
        // System Theme
        themesList.querySelector(`button[data-systheme="${sysChoice}"] input[type="radio"]`).checked = true;
        if (lwChoice.startsWith("firefox-compact-light@")) {
            // Check if a Chromium Theme is in use
            let chrChoice = gkPrefUtils.tryGet("Geckium.chrTheme.fileName").string;
            if (chrChoice) {
                themesList.querySelector(`button[data-chrtheme-name="${chrChoice}"] input[type="radio"]`).checked = true;
                document.getElementById("thememode-themed").checked = true;
                document.getElementById("thememode-themed").style.removeProperty("display");
            } else { // Firefox Light's in use
                document.getElementById("thememode-light").checked = true;
            }
        } else if (lwChoice.startsWith("firefox-compact-dark@")) {
            document.getElementById("thememode-dark").checked = true;
        } else {
            document.getElementById("thememode-auto").checked = true;
        }
    }
}
const themeGridObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			selectTheme();
		}
	},
};
Services.prefs.addObserver("extensions.activeThemeID", themeGridObserver, false);
Services.prefs.addObserver("Geckium.appearance.systemTheme", themeGridObserver, false);
Services.prefs.addObserver("Geckium.chrTheme.fileName", themeGridObserver, false);