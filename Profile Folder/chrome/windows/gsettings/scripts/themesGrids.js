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
				data-builtin="${themeInfo[i].builtin}" style="background-color: ${themeInfo[i].bannerColor}; background-image: ${themeInfo[i].banner};
${themeInfo[i].bannerAlignment ? `background-position: ${themeInfo[i].bannerAlignment} !important; ` : ""}
${themeInfo[i].bannerTiling ? `background-repeat: ${themeInfo[i].bannerTiling} !important; ` : ""}
${themeInfo[i].bannerSizing ? `background-size: ${themeInfo[i].bannerSizing} !important; ` : ""}">
			<vbox class="wrapper">
				<html:div class="year">V${themeInfo[i].version}</html:div>
				<html:button class="action-item icon-settings" id="manage" data-toggle-modal="manageTheme_modal"/>
				<html:div class="theme-icons" style="width: 48px; height: 48px">
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
			</vbox>
		</html:button>
		`;

		themesList.insertBefore(MozXULElement.parseXULToFragment(themeElm), document.getElementById("gkwebstoretile"));

		document.querySelector(`button[data-${themeInfo[i].type}-name="${themeInfo[i].id}"]`).addEventListener("click", themeInfo[i].apply);
		document.querySelector(`button[data-${themeInfo[i].type}-name="${themeInfo[i].id}"] #manage`).addEventListener("click", (e) => {
			e.stopPropagation();

			const manageThemeModal = document.querySelector(`.modal[data-modal="${e.target.dataset.toggleModal}"]`)
			manageThemeModal.classList.add("active");

			manageThemeModal.dataset.browser = themeInfo[i].browser;

			manageThemeModal.querySelector(".theme-type-icon").src = themeIconPath;

			const headerTitleElm = manageThemeModal.querySelector(".header p");
			if (themeInfo[i].builtin)
				headerTitleElm.textContent = gSettingsBundle.GetStringFromName("builtInTheme").replace("{{themeName}}", themeInfo[i].name);
			else
				headerTitleElm.textContent = themeInfo[i].name;

			manageThemeModal.querySelector(".year").textContent = `V${themeInfo[i].version}`;

			manageThemeModal.querySelector("#preview").style.backgroundColor = null;
			manageThemeModal.querySelector("#preview").style.backgroundColor = themeInfo[i].bannerColor;
			manageThemeModal.querySelector("#preview").style.backgroundImage = null;
			manageThemeModal.querySelector("#preview").style.backgroundImage = themeInfo[i].banner;
			manageThemeModal.querySelector("#preview").style.backgroundPosition = null;
			manageThemeModal.querySelector("#preview").style.backgroundPosition = themeInfo[i].bannerAlignment;
			manageThemeModal.querySelector("#preview").style.backgroundRepeat = null;
			manageThemeModal.querySelector("#preview").style.backgroundRepeat = themeInfo[i].bannerTiling;
			manageThemeModal.querySelector("#preview").style.backgroundSize = null;
			manageThemeModal.querySelector("#preview").style.backgroundSize = themeInfo[i].bannerSizing;

			manageThemeModal.querySelector(".description p").textContent = themeDescription;

			const viewStorePageBtn = manageThemeModal.querySelector("#viewStorePageBtn");
			viewStorePageBtn.removeAttribute("disabled");

			const searchBtn = manageThemeModal.querySelector("#searchBtn");
			searchBtn.removeAttribute("disabled");

			let deleteBtn = manageThemeModal.querySelector("#deleteBtn");
			deleteBtn.removeAttribute("disabled");

			let showInFolderBtn = manageThemeModal.querySelector("#showInFolderBtn");
			if (showInFolderBtn)
				showInFolderBtn.remove();
			showInFolderBtn = document.createElement("button");
			showInFolderBtn.id = "showInFolderBtn";
			showInFolderBtn.classList.add("button", "ripple-enabled", "text");
			showInFolderBtn.textContent = gSettingsBundle.GetStringFromName("showInFolder");
			gkInsertElm.after(showInFolderBtn, searchBtn);

			let applyBtn = manageThemeModal.querySelector("#applyBtn");
			if (applyBtn)
				applyBtn.remove();
			applyBtn = document.createElement("button");
			applyBtn.id = "applyBtn";
			applyBtn.classList.add("button", "ripple-enabled", "text", "color");
			applyBtn.textContent = gSettingsBundle.GetStringFromName("apply");
			gkInsertElm.before(applyBtn, manageThemeModal.querySelector("#OKBtn"));

			let storePageLink;

			if (themeInfo[i].id.includes("Geckium_Tan")) {
				deleteBtn.setAttribute("disabled", true);
				storePageLink = `https://github.com/angelbruni/Geckium/tree/main/Profile%20Folder/chrThemes/${themeInfo[i].id}.crx`;
				searchBtn.setAttribute("disabled", true);
			}

			let searchLink;
			let pathToTheme;

			switch (themeInfo[i].browser) {
				case "firefox":
					pathToTheme = `${Services.dirsvc.get("ProfD", Ci.nsIFile).path}/extensions/${themeInfo[i].id}.xpi`
					searchLink = `https://addons.mozilla.org/en-US/firefox/search/?q=${themeInfo[i].name}`
					storePageLink = themeInfo[i].page;

					if (themeInfo[i].builtin) {
						viewStorePageBtn.setAttribute("disabled", true);
						deleteBtn.setAttribute("disabled", true);
						searchBtn.setAttribute("disabled", true);
						showInFolderBtn.setAttribute("disabled", true);
					}
					break;
				case "msedge":
					pathToTheme = `${gkChrTheme.getFolderFileUtilsPath}/${themeInfo[i].id}.crx`;
					searchLink = `https://microsoftedge.microsoft.com/addons/search/${themeInfo[i].name}?filteredAddon=2`;
					viewStorePageBtn.setAttribute("disabled", true);
					break;
				case "chrome":
					pathToTheme = `${gkChrTheme.getFolderFileUtilsPath}/${themeInfo[i].id}.crx`;
					searchLink = `https://chromewebstore.google.com/search/${themeInfo[i].name}?itemTypes=THEME`;

					if (!themeInfo[i].id.includes("Geckium_Tan"))
						storePageLink = `https://chromewebstore.google.com/detail/${themeInfo[i].name.replaceAll(" ", "-").toLowerCase()}/${themeInfo[i].id.split("_")[0].toLowerCase()}`;
					break;
			}

			manageThemeModal.querySelector("#filename").textContent = ` ${themeInfo[i].id}`;

			deleteBtn.addEventListener("click", (e) => {
				const deleteThemeConfirmModal = document.querySelector(`.modal[data-modal="${e.target.dataset.toggleModal}"]`)
				deleteThemeConfirmModal.classList.add("active");

				let yesDeleteBtn = deleteThemeConfirmModal.querySelector("#yesDeleteBtn");
				if (yesDeleteBtn)
					yesDeleteBtn.remove();
	
				yesDeleteBtn = document.createElement("button");
				yesDeleteBtn.id = "yesDeleteBtn";
				yesDeleteBtn.classList.add("button", "ripple-enabled", "text");
				yesDeleteBtn.textContent = gSettingsBundle.GetStringFromName("yes");
				gkInsertElm.after(yesDeleteBtn, deleteThemeConfirmModal.querySelector("#cancelDeleteBtn"));
				yesDeleteBtn.addEventListener("click", () => {
					populateThemesList();

					themeInfo[i].uninstall();

					deleteThemeConfirmModal.classList.remove("active");
					manageThemeModal.classList.remove("active");
				});
			});

			searchBtn.setAttribute("href", searchLink);

			viewStorePageBtn.setAttribute("href", storePageLink);

			showInFolderBtn.addEventListener("click", () => {
				gkFileUtils.showFileInDirectory(pathToTheme);
			});

			applyBtn.addEventListener("click", () => {
				themeInfo[i].apply();
			});
		})
	}
}