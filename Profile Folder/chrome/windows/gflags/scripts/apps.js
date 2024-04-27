const { gkNTP } = ChromeUtils.importESModule("chrome://modules/content/GeckiumNTP.sys.mjs");

function populateAppsList() {
    const container = document.getElementById("apps-list");

    container.innerHTML = "";

    let appsList = gkNTP.getAppsList;

    // Check if appsList is an object
    if (appsList && typeof appsList === 'object') {
        for (let key in appsList) {
            if (appsList.hasOwnProperty(key)) {
                let app = appsList[key];
                let item = `
                <html:button class="item app ripple-enabled" style="list-style-image: url(${app.newIcon})"  data-app-old-favicon="${app.favicon}" data-app-old-icon="${app.oldIcon}" data-app-new-icon="${app.newIcon}" data-app-old-name="${app.oldName}" data-app-new-name="${app.newName}" data-toggle-modal="editApp_modal">
                    <hbox>
						<image />
                        <label class="name">${app.oldName} - ${app.newName}</label>
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
			<label class="name">Add an app</label>
		</vbox>
	</html:button>
	`));

	container.querySelectorAll(".item").forEach(item => {
		item.addEventListener("click", () => {
			console.log(item.dataset.dataToggleModal)
			const modal = document.querySelector(`.modal[data-modal="${item.dataset.toggleModal}"]`);
			modal.classList.add("active");

			const modalTitle = modal.querySelector("span#app-name");
			const modalOldFavicon = modal.querySelector("button#image-app-old-favicon");
			const modalOldIcon = modal.querySelector("button#image-app-old-icon");
			const modalNewIcon = modal.querySelector("button#image-app-new-icon");
			const modalOldName = modal.querySelector("input#input-app-old-name");
			const modalNewName = modal.querySelector("input#input-app-new-name");

			modalTitle.textContent = "";

			modalOldFavicon.style.listStyleImage = null;
			modalOldIcon.style.listStyleImage = null;
			modalNewIcon.style.listStyleImage = null;
			
			modalOldName.value = "";
			modalNewName.value = "";

			if (item.dataset.appNewName == undefined)
				return;

			modalTitle.textContent = item.dataset.appNewName;

			modalOldFavicon.style.listStyleImage = `url(${item.dataset.appOldFavicon})`;
			modalOldIcon.style.listStyleImage = `url(${item.dataset.appOldIcon})`;
			modalNewIcon.style.listStyleImage = `url(${item.dataset.appNewIcon})`;
			
			modalOldName.value = item.dataset.appOldName;
			modalNewName.value = item.dataset.appNewName;
		})
	})
}

document.addEventListener("DOMContentLoaded", populateAppsList);
