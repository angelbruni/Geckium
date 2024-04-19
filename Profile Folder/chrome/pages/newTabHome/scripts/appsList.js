function setUpApps() {
	let appearanceChoice;

	switch (pref("Geckium.newTabHome.styleMode").tryGet.string()) {
		case "forced":
			appearanceChoice = pref("Geckium.newTabHome.style").tryGet.int();
			break;
		default:
			appearanceChoice = pref("Geckium.appearance.choice").tryGet.int();
			break;
	}

	let appsContainer;
	
	let pos;
	let icon;
	let favicon;
	let name;
	let type;
	let url;

	const appsList = JSON.parse(pref("Geckium.newTabHome.appsList").tryGet.string());
	const appsListArray = Object.values(appsList);
	appsListArray.sort((a, b) => a.pos - b.pos);

	if (appsListArray.length !== 0) {
		appsListArray.forEach(app => {
			let tile;

			pos = app.pos;
			url = app.url;

			if (appearanceChoice == 2 || appearanceChoice == 2) {
				appsContainer = "#apps-content";

				icon = app.oldIcon;

				favicon = app.favicon;
				if (!favicon)
					favicon = "chrome://userchrome/content/assets/img/toolbar/grayfolder.png";

				name = app.oldName;

				tile = `
				<html:a data-index="${pos}" class="item" href="${url}" style="list-style-image: url('${favicon}')">
					<image></image>
					<label>${name}</label>
				</html:a>
				`
			}
		
			if (appearanceChoice == 3 || appearanceChoice == 4) {
				appsContainer = "#apps-page .tile-grid";

				icon = app.newIcon;
				name = app.newName;
				type = app.type;
				
				tile = `
				<html:button class="tile-container"
						data-index="${pos}"
						data-type="${type}"
						data-url="${url}"
				>
					<html:img class="icon" draggable="false" src="${icon}"></html:img>
					<label>${name}</label>
				</html:button>
				`
				waitForElm(appsContainer + "> [data-url='" + url + "'").then(function() {
					let apps = document.querySelectorAll(appsContainer + "> [data-url='" + url + "'");
					apps.forEach(app => {
						// #region App Dragging
						let allowDragging; // Only allow dragging after it's being dragged for a while.
						const allowDraggingPxOffset = 4;

						let initialMouseX;
						let initialMouseY;
						
						let isDragging = false;
						let offsetX;
						let offsetY;

						app.addEventListener("mousedown", (event) => {
							initialMouseX = event.clientX;
							initialMouseY = event.clientY;
							
							isDragging = true;
							offsetX = event.clientX;
							offsetY = event.clientY;
						});

						window.addEventListener("mousemove", (event) => {
							if (isDragging) {
								let mouseX = event.clientX;
								let mouseY = event.clientY;

								let posX = mouseX - offsetX;
								let posY = mouseY - offsetY;

								if (mouseX > initialMouseX + allowDraggingPxOffset || mouseX < initialMouseX - allowDraggingPxOffset || mouseY > initialMouseY + allowDraggingPxOffset || mouseY < initialMouseY - allowDraggingPxOffset)
									allowDragging = true;

								if (allowDragging)
									app.style.transform = `translate(${posX}px, ${posY}px)`;
							}
						});

						window.addEventListener("mouseup", () => {
							setTimeout(() => {
								allowDragging = false;
							}, 0);
							isDragging = false;
							app.style.transform = null;
							app.style.pointerEvents = null;
						});
						// #endregion

						// #region App Opening
						app.addEventListener("click", () => {
							if (!allowDragging) {
								if (!app.dataset.type || app.dataset.type == 0 || app.dataset.type == 1) {
									/*	If app opens as a regular tab or pinned tab
										(functionality not implemented yet), open the
										link in the current tab. */
									window.location.replace(app.dataset.url);
								}
							}
						});
						// #endregion
					});
				});
			}

			document.querySelectorAll(appsContainer + "> *").forEach(app => {
				app.remove();
			})

			waitForElm(appsContainer).then(function() {
				document.querySelector(appsContainer).appendChild(MozXULElement.parseXULToFragment(tile));
			});
		})
	}
}