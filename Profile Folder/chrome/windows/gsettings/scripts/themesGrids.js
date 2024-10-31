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
    var selector = document.getElementById("gkthemefilter");
    selector.querySelectorAll(".list .item").forEach(item => {
        item.addEventListener("click", () => {
            var value = item.getAttribute("value");
            if (value != "all") {
                document.documentElement.setAttribute("gkthemefilter", value);
            } else {
                document.documentElement.removeAttribute("gkthemefilter");
            }
        })
    })

    // Populate themes and modes lists
    await populateThemesList();

    // Generate theme modes list
    generateThemeModes();

    // Pre-select theme and theme mode
    selectSysTheme();
    selectChrTheme();
    selectLWTheme();
}
document.addEventListener("DOMContentLoaded", initGrids);

async function populateThemesList() {
    // Get info about all chrThemes and LWThemes
    var themeInfo = await getChrThemesList();
    themeInfo.push.apply(themeInfo, await getLWThemesList());

    // Sort themes by name
    themeInfo.sort((a, b) => {
        return a.name.localeCompare(b.name)
    });

    // Delete all existing cases of themes
    ["chrtheme", "lwtheme"].forEach(function (i) {
        themesList.querySelectorAll(`button[data-${i}-name]`).forEach(item => {
            item.remove();
        });
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
                class="link geckium-appearance"
                data-${themeInfo[i].type}-name="${themeInfo[i].id}" data-browser="${themeInfo[i].browser}"
                style="background-color: ${themeInfo[i].bannerColor}; background-image: ${themeInfo[i].banner};
${themeInfo[i].bannerAlignment ? `background-position: ${themeInfo[i].bannerAlignment} !important; ` : ""}
${themeInfo[i].bannerTiling ? `background-repeat: ${themeInfo[i].bannerTiling} !important; ` : ""}
${themeInfo[i].bannerSizing ? `background-size: ${themeInfo[i].bannerSizing} !important; ` : ""}">
            <html:label class="wrapper">
                <html:div class="year">V${themeInfo[i].version}</html:div>
                <html:div class="icon" style="width: 48px; height: 48px">
                    <html:img class="theme-type-icon" src="${themeIconPath}" />
                    <html:div class="theme-browser-icon" />
                </html:div>
                <html:div class="identifier">
                    <vbox style="min-width: 0">
                        <html:div class="radio-parent">
                            <html:input id="theme-${themeInfo[i].id}" class="radio" type="radio" name="gktheme"></html:input>
                            <html:div class="gutter" for="checked_check"></html:div>
                            <html:label class="name label">${themeName}</html:label>
                        </html:div>
                        <html:label class="description">${themeDescription}</html:label>
                    </vbox>
                </html:div>
            </html:label>
        </html:button>
        `;

        themesList.insertBefore(MozXULElement.parseXULToFragment(themeElm), document.getElementById("gkwebstoretile"));

		document.querySelector(`button[data-${themeInfo[i].type}-name="${themeInfo[i].id}"]`).addEventListener("click", themeInfo[i].event);
    }
}