const years = gkNTP.getAppYears;

let appsListInitialized = false;

function populateAppsList() {
	destroyAppsList();

    const container = document.getElementById("apps-list");
	container.setAttribute("loading", true);
	const addAppFAB = document.getElementById("add-app-fab");
	addAppFAB.setAttribute("disabled", true);

    const appsList = gkNTP.getAppsList;

    if (appsList && typeof appsList === 'object') {
		for (let key in appsList) {
			if (appsList.hasOwnProperty(key)) {
				const app = gkNTP.getAppsList[key];
	
				const appNames = {};
				const appIcons = {};
	
				years.forEach(year => {
					appNames[year] = app.names[year] ? app.names[year].replace(/[&<>"']/g, match => specialCharacters[match]) : null;
					appIcons[year] = app.icons[year] ? app.icons[year].replace(/[&<>"']/g, match => specialCharacters[match]) : null;
				});
	
				const reversedYears = [...years].reverse(); // Reverse the years array to prioritize the latest available icon and name
	
				const appName = reversedYears.map(year => appNames[year]).find(name => name) || "";
				const appIcon = reversedYears.map(year => appIcons[year]).find(icon => icon) || "";
	
				const item = `
					<html:button class="item app ripple-enabled"
								 data-app="${key}"
								 data-toggle-modals="editApp_modal"
								 style="list-style-image: url('${appIcon}')">
						<hbox>
							<image />
							<label class="name">${appName}</label>
						</hbox>
					</html:button>
				`;
				gkInsertElm.before(MozXULElement.parseXULToFragment(item), container.querySelector(".spinner-container"));
			}
		}
	}	
	
	document.querySelectorAll("#apps-list > .item, #add-app-fab").forEach(item => {
		item.addEventListener("click", () => {
			const modal = document.querySelector(`.modal[data-modal="${item.dataset.toggleModals}"]`);
			modal.classList.add("active");
			const modalTitle = modal.querySelector("#app-name.header");
	
			const index = item.dataset.app;
			modal.dataset.app = index || null;
	
			modalTitle.textContent = document.getElementById("add-app-fab").getAttribute("label");
	
			years.forEach(year => {
				const modalFaviconInput = modal.querySelector(`input#image-app-${year}-favicon`);
				const modalFaviconLabel = modal.querySelector(`label[for='image-app-${year}-favicon']`);
				const modalIconInput = modal.querySelector(`input#image-app-${year}-icon`);
				const modalIconLabel = modal.querySelector(`label[for='image-app-${year}-icon']`);
				const modalNameInput = modal.querySelector(`input#input-app-${year}-name`);
				const modalDeleteBtn = modal.querySelector(`#delete-${year}-icon`);
	
				if (modalFaviconInput && modalFaviconLabel) {
					modalFaviconInput.addEventListener("change", () => {
						const value = modalFaviconInput.value.replace(/\\/g, "/");
						
						if (value.includes("://")) {
							modalFaviconLabel.dataset.favicon = value;
							modalFaviconLabel.style.listStyleImage = `url("${value}")`;
						} else {
							modalFaviconLabel.dataset.favicon = `file://${value}`;
							modalFaviconLabel.style.listStyleImage = `url("file://${value}")`;
						}
							
					});
					delete modalFaviconLabel.dataset.favicon;
					modalFaviconLabel.style.listStyleImage = null;
				}

				if (modalIconInput && modalIconLabel) {
					modalIconInput.addEventListener("change", () => {
						const value = modalIconInput.value.replace(/\\/g, "/");
						
						if (value) {
							if (value.includes("://")) {
								modalIconLabel.dataset.icon = value;
								modalIconLabel.style.listStyleImage = `url("${value}")`;
							} else {
								modalIconLabel.dataset.icon = `file://${value}`;
								modalIconLabel.style.listStyleImage = `url("file://${value}")`;
							}
						} else {
							delete modalIconLabel.dataset.icon;
							modalIconLabel.style.listStyleImage = null;
						}
							
					});
					delete modalIconLabel.dataset.icon;
					modalIconLabel.style.listStyleImage = null;
				}
	
				if (modalDeleteBtn) {
					modalDeleteBtn.addEventListener("click", () => {
						modalIconInput.value = null;
						delete modalIconLabel.dataset.icon;
						modalIconInput.dispatchEvent(new Event("change"));
					});
				}
	
				if (modalNameInput)
					modalNameInput.value = null;
			});
	
			const modalURL = modal.querySelector("input#input-app-url");
			if (modalURL)
				modalURL.value = null;
	
			const app = gkNTP.getAppsList[index];
			if (app) {
				years.forEach(year => {
					const appFavicon = app.favicons[year] || null;
					const appIcon = app.icons[year] || null;
					const appName = app.names[year] || null;
	
					const modalFaviconLabel = modal.querySelector(`label[for='image-app-${year}-favicon']`);
					const modalIconLabel = modal.querySelector(`label[for='image-app-${year}-icon']`);
					const modalNameInput = modal.querySelector(`input#input-app-${year}-name`);

					if (modalFaviconLabel && appFavicon) {
						modalFaviconLabel.dataset.favicon = appFavicon;
						modalFaviconLabel.style.listStyleImage = `url("${appFavicon}")`;
					}
	
					if (modalIconLabel && appIcon) {
						modalIconLabel.dataset.icon = appIcon;
						modalIconLabel.style.listStyleImage = `url("${appIcon}")`;
					}
	
					if (modalNameInput)
						modalNameInput.value = appName;
				});
	
				const appName = years.map(year => app.names[year]).find(name => name) || "";
				modalTitle.textContent = gSettingsBundle
					.GetStringFromName("editApp")
					.replace("{{app}}", appName);
	
				if (modalURL)
					modalURL.value = app.url;
			}
		});
	});

	container.removeAttribute("loading");
	addAppFAB.removeAttribute("disabled");
	appsListInitialized = true;
}
function destroyAppsList() {
	document.querySelectorAll("#apps-list > button.app").forEach(appItem => {
		appItem.remove();
	})

	appsListInitialized = false;
}
document.addEventListener("pageChanged", () => {
	if (gmPages.getCurrentPage("main") == 12) {
		populateAppsList();
	} else {
		if (appsListInitialized == true)
			destroyAppsList();
	}
})

const editAppModal = document.querySelector(`.modal[data-modal="editApp_modal"]`)
const deleteAppConfirmationModal = document.querySelector(`.modal[data-modal="deleteAppConfirmation_modal"]`)
deleteAppConfirmationModal.querySelector(".button#app_deleteBtn").addEventListener("click", () => {
	gkNTP.deleteApp(editAppModal.dataset.app);
	populateAppsList();
});
editAppModal.querySelector(".button#app_OKBtn").addEventListener("click", () => {
    const currentModal = document.querySelector(`.modal[data-modal="editApp_modal"]`);

    const getAppData = (year) => {
        const faviconLabel = editAppModal.querySelector(`label[for='image-app-${year}-favicon']`);
        const iconLabel = editAppModal.querySelector(`label[for='image-app-${year}-icon']`);
        const nameInput = editAppModal.querySelector(`#input-app-${year}-name`);

        return {
            favicon: faviconLabel ? faviconLabel.dataset.favicon || "" : "",
            icon: iconLabel ? iconLabel.dataset.icon || "" : "",
            name: nameInput ? nameInput.value || "" : ""
        };
    };

    const appData = {
        favicons: {},
        icons: {},
        names: {},
        url: editAppModal.querySelector("input#input-app-url").value,
        type: "tab"
    };

    years.forEach(year => {
        const { favicon, icon, name } = getAppData(year);
        appData.favicons[year] = favicon;
        appData.icons[year] = icon;
        appData.names[year] = name;
    });

    gkNTP.editApp(currentModal.dataset.app, appData);

    populateAppsList();
});

editAppModal.querySelector(".button#createBtn").addEventListener("click", () => {
    const getData = (year, type) => {
        const label = editAppModal.querySelector(`label[for='image-app-${year}-${type}']`);
        return label ? label.dataset[type] || "" : "";
    };

    const getName = (year) => {
        const input = editAppModal.querySelector(`#input-app-${year}-name`);
        return input ? input.value || "" : "";
    };

    const appData = {
        favicons: {},
        icons: {},
        names: {},
        url: editAppModal.querySelector("input#input-app-url").value,
        type: "tab"
    };

    years.forEach(year => {
        appData.favicons[year] = getData(year, 'favicon');
        appData.icons[year] = getData(year, 'icon');
        appData.names[year] = getName(year);
    });

    gkNTP.addApp(appData);

    populateAppsList();
});