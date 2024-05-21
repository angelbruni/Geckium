const { gkNTP } = ChromeUtils.importESModule("chrome://modules/content/GeckiumNTP.sys.mjs");

// Map of special characters and their corresponding HTML entities
const specialCharacters = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#39;",
};

function populateAppsList() {
    const container = document.getElementById("apps-list");

    container.innerHTML = "";

    let appsList = gkNTP.getAppsList;

    // Check if appsList is an object
    if (appsList && typeof appsList === 'object') {
        for (let key in appsList) {
            if (appsList.hasOwnProperty(key)) {
                let app = appsList[key];
				
				let appFavicon;
				if (!app.favicon)
					appFavicon = "";
				else
					appFavicon = app.favicon.replace(/[&<>"']/g, match => specialCharacters[match]);

				let appOldIcon;
				if (!app.oldIcon)
					appOldIcon = "";
				else
					appOldIcon = app.oldIcon.replace(/[&<>"']/g, match => specialCharacters[match]);

				let appNewIcon;
				if (!app.newIcon)
					appNewIcon = "";
				else
					appNewIcon = app.newIcon.replace(/[&<>"']/g, match => specialCharacters[match]);

				let appOldName;
				if (!app.oldName)
					appOldName = "";
				else
					appOldName = app.oldName.replace(/[&<>"']/g, match => specialCharacters[match]);

				let appNewName;
				if (!app.newName)
					appNewName = "";
				else
					appNewName = app.newName.replace(/[&<>"']/g, match => specialCharacters[match]);

				let appURL;
				if (!app.url)
					appURL = "";
				else
					appURL = app.url.replace(/[&<>"']/g, match => specialCharacters[match]);

                let item = `
                <html:button class="item app ripple-enabled"
							 style="list-style-image: url('${appNewIcon}')"
							 data-app="${key}"
							 data-app-old-favicon="${appFavicon}"
							 data-app-old-icon="${appOldIcon}"
							 data-app-new-icon="${appNewIcon}"
							 data-app-old-name="${appOldName}"
							 data-app-new-name="${appNewName}"
							 data-app-url="${appURL}"
							 data-toggle-modal="editApp_modal">
                    <hbox>
						<image />
                        <label class="name">${appOldName} - ${appNewName}</label>
                    </hbox>
                </html:button>
                `;
                container.appendChild(MozXULElement.parseXULToFragment(item));
            }
        }
    }

	container.appendChild(MozXULElement.parseXULToFragment(`
	<html:button class="item ripple-enabled" data-toggle-modal="editApp_modal">
		<vbox>
			<label class="name">${gSettingsBundle.GetStringFromName("addAnApp")}</label>
		</vbox>
	</html:button>
	`));

	container.querySelectorAll(".item").forEach(item => {
		item.addEventListener("click", () => {
			const modal = document.querySelector(`.modal[data-modal="${item.dataset.toggleModal}"]`);
			modal.classList.add("active");

			const modalTitle = modal.querySelector("span#app-name");
			const modalOldFavicon = modal.querySelector("input#image-app-old-favicon");
			const modalOldIcon = modal.querySelector("input#image-app-old-icon");
			const modalNewIcon = modal.querySelector("input#image-app-new-icon");

			const modalButtonOldFavicon = modal.querySelector("label[for='image-app-old-favicon']");
			const modalButtonOldIcon = modal.querySelector("label[for='image-app-old-icon']");
			const modalButtonNewIcon = modal.querySelector("label[for='image-app-new-icon']");

			const modalOldName = modal.querySelector("input#input-app-old-name");
			const modalNewName = modal.querySelector("input#input-app-new-name");

			const modalURL = modal.querySelector("input#input-app-url");

			modal.dataset.app = null;

			modalTitle.textContent = "";

			modalButtonOldFavicon.style.listStyleImage = null;
			modalButtonOldIcon.style.listStyleImage = null;
			modalButtonNewIcon.style.listStyleImage = null;
			
			modalOldName.value = "";
			modalNewName.value = "";

			modalURL.value = "";

			modalOldFavicon.addEventListener("change", () => {
				modalButtonOldFavicon.style.listStyleImage = `url("file://${modalOldFavicon.value.replace(/\\/g, "/")}")`;
			})
			modalOldIcon.addEventListener("change", () => {
				modalButtonOldIcon.style.listStyleImage = `url("file://${modalOldIcon.value.replace(/\\/g, "/")}")`;
			})
			modalNewIcon.addEventListener("change", () => {
				modalButtonNewIcon.style.listStyleImage = `url("file://${modalNewIcon.value.replace(/\\/g, "/")}")`;
			})

			// if !app
			if (item.dataset.app == undefined)
				return;

			modal.dataset.app = item.dataset.app;

			modalTitle.textContent = item.dataset.appNewName;

			modalOldFavicon.value = item.dataset.appOldFavicon;
			modalOldIcon.value = item.dataset.appOldIcon;
			modalNewIcon.value = item.dataset.appNewIcon;
			modalButtonOldFavicon.style.listStyleImage = `url("${item.dataset.appOldFavicon}")`;
			modalButtonOldIcon.style.listStyleImage = `url("${item.dataset.appOldIcon}")`;
			modalButtonNewIcon.style.listStyleImage = `url("${item.dataset.appNewIcon}")`;
			
			modalOldName.value = item.dataset.appOldName;
			modalNewName.value = item.dataset.appNewName;

			modalURL.value = item.dataset.appUrl;
		})
	})
}

document.addEventListener("DOMContentLoaded", populateAppsList);

const modal = document.querySelector(`.modal[data-modal="editApp_modal"]`)
modal.querySelector(".button#deleteBtn").addEventListener("click", () => {
	currentModal = document.querySelector(`.modal[data-modal="editApp_modal"]`);

	const newAppsList = gkNTP.getAppsList;

	delete newAppsList[currentModal.dataset.app];

	console.log(newAppsList, "\n", JSON.stringify(newAppsList));

	gkPrefUtils.set("Geckium.newTabHome.appsList").string(JSON.stringify(newAppsList))

	setTimeout(() => {
		populateAppsList();
	}, 10);
});
modal.querySelector(".button#cancelBtn");
modal.querySelector(".button#OKBtn").addEventListener("click", () => {
	currentModal = document.querySelector(`.modal[data-modal="editApp_modal"]`);

	let newApp = {};

	const newAppsList = gkNTP.getAppsList;

	/*const modalTitle = modal.querySelector("span#app-name");*/
	const modalOldFavicon = modal.querySelector("input#image-app-old-favicon");
	const modalOldIcon = modal.querySelector("input#image-app-old-icon");
	const modalNewIcon = modal.querySelector("input#image-app-new-icon");
	const modalOldName = modal.querySelector("input#input-app-old-name");
	const modalNewName = modal.querySelector("input#input-app-new-name");

	const modalURL = modal.querySelector("input#input-app-url");

	newApp.pos = parseInt(currentModal.dataset.app);

	if (modalOldFavicon.value)
		newApp.favicon = "file://" + modalOldFavicon.value.replace(/\\/g, "/");
	else
		newApp.favicon = newAppsList[currentModal.dataset.app]["favicon"];

	if (modalOldIcon.value)
		newApp.oldIcon = "file://" + modalOldIcon.value.replace(/\\/g, "/");
	else
		newApp.oldIcon = newAppsList[currentModal.dataset.app]["oldIcon"];

	if (modalNewIcon.value)
		newApp.newIcon = "file://" + modalNewIcon.value.replace(/\\/g, "/");
	else
		newApp.newIcon = newAppsList[currentModal.dataset.app]["newIcon"];

	newApp.oldName = modalOldName.value;
	newApp.newName = modalNewName.value;

	newApp.url = modalURL.value;

	newApp.type = 0;

	newAppsList[currentModal.dataset.app] = newApp;

	console.log(newAppsList, "\n", JSON.stringify(newAppsList));

	gkPrefUtils.set("Geckium.newTabHome.appsList").string(JSON.stringify(newAppsList))

	setTimeout(() => {
		populateAppsList();
	}, 10);
});
modal.querySelector(".button#createBtn").addEventListener("click", () => {
	currentModal = document.querySelector(`.modal[data-modal="editApp_modal"]`);

	const newAppsList = gkNTP.getAppsList;

	let maxKey = -1;
	for (let key in newAppsList) {
		if (newAppsList.hasOwnProperty(key) && !isNaN(parseInt(key))) {
			maxKey = Math.max(maxKey, parseInt(key));
		}
	}

	// Calculate the new key
	let newKey = maxKey + 1;

	let newApp = {};

	/*const modalTitle = modal.querySelector("span#app-name");*/
	const modalOldFavicon = modal.querySelector("input#image-app-old-favicon");
	const modalOldIcon = modal.querySelector("input#image-app-old-icon");
	const modalNewIcon = modal.querySelector("input#image-app-new-icon");
	const modalOldName = modal.querySelector("input#input-app-old-name");
	const modalNewName = modal.querySelector("input#input-app-new-name");

	const modalURL = modal.querySelector("input#input-app-url");

	newApp.pos = newKey;

	newApp.favicon = "file://" + modalOldFavicon.value.replace(/\\/g, "/");
	newApp.oldIcon = "file://" + modalOldIcon.value.replace(/\\/g, "/");
	newApp.newIcon = "file://" + modalNewIcon.value.replace(/\\/g, "/");
	newApp.oldName = modalOldName.value;
	newApp.newName = modalNewName.value;

	newApp.url = modalURL.value;

	newApp.type = 0;

	newAppsList[newKey] = newApp;

	console.log(newAppsList, "\n", JSON.stringify(newAppsList));
	
	gkPrefUtils.set("Geckium.newTabHome.appsList").string(JSON.stringify(newAppsList))

	setTimeout(() => {
		populateAppsList();
	}, 10);
});