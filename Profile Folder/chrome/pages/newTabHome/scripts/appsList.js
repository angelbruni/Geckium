function setUpApps() {
	let appearanceChoice = gkEras.getNTPEra();

	let appsPosContainer;
	let appsContainer;
	let icon;
	let favicon;
	let name;
	let url;
	let type;

	const appsList = gkNTP.getAppsList;

	if (appsList.length !== 0) {
		// Loop through the appsList array
		appsList.forEach((app, index) => {
			let tilePos;
			let tile;
			let item;

			type = app.type;
			url = app.url;

			if (appearanceChoice == 11) {
				appsContainer = "#apps-content";
				icon = app.icons["2011"];
				favicon = app.favicons["2011"] || "chrome://userchrome/content/assets/img/chrome-1/toolbar/grayfolder.png";
				name = app.names["2011"];

				tile = `
				<html:a class="item" data-type="${type}" href="${url}" data-index="${index}">
					<image class="favicon" src="${favicon}"></image>
					<image class="icon" src="${icon}"></image>
					<label>${name}</label>
				</html:a>
				`;

				item = `
				<html:a class="item" href="${url}" data-index="${index}">
					<image class="favicon" src="${favicon}"></image>
					<label>${name}</label>
				</html:a>
				`;
			}

			if (appearanceChoice >= 17 && appearanceChoice <= 25) {
				appsPosContainer = "#apps-page .tile-pos-grid"
				appsContainer = "#apps-page .tile-grid";

				if (appearanceChoice == 17) {
					icon = app.icons["2011"];
					name = app.names["2011"];
				} else if (appearanceChoice == 21) {
					icon = app.icons["2012"] || app.icons["2011"];
					name = app.names["2012"] || app.names["2011"];
				} else if (appearanceChoice == 25) {
					icon = app.icons["2013"] || app.icons["2012"] || app.icons["2011"];
					name = app.names["2013"] || app.names["2012"] || app.names["2011"];
				}

				tilePos = `
				<html:div class="tile-container placeholder" data-index="${index}" />
				`

				tile = `
				<html:button class="tile-container" data-type="${type}" data-url="${url}" data-index="${index}">
					<image class="icon" draggable="false" src="${icon}"></image>
					<label>${name}</label>
				</html:button>
				`;
			}

			// Clear the container before adding new apps
			document.querySelectorAll(`${appsContainer} > *, ${appsPosContainer} > *`).forEach(app => {
				app.remove();
			});

			// Wait for the container to be available before appending new tiles
			waitForElm(appsContainer).then(function() {
				// Append the tile to the container
				if (appsPosContainer)
					document.querySelector(appsPosContainer).appendChild(MozXULElement.parseXULToFragment(tilePos));

				document.querySelector(appsContainer).appendChild(MozXULElement.parseXULToFragment(tile));

				if (appearanceChoice == 11)
					gkInsertElm.before(MozXULElement.parseXULToFragment(item), document.querySelector("#apps-menu > hr"));

				if (appearanceChoice >= 17 || appearanceChoice <= 25) {
					const appsContainerElm = document.querySelector(appsContainer);
					const appsPosContainerElm = document.querySelector(appsPosContainer);

					new ResizeObserver(() => {
						appsContainerElm.style.width = `${appsPosContainerElm.getBoundingClientRect().width}px`;
						appsContainerElm.style.height = `${appsPosContainerElm.getBoundingClientRect().height}px`;
						appsContainerElm.querySelector(`.tile-container[data-index="${index}"]`).style.left = `${appsPosContainerElm.querySelector(`.tile-container[data-index="${index}"]`).getBoundingClientRect().left - appsPosContainerElm.getBoundingClientRect().left}px`;
						appsContainerElm.querySelector(`.tile-container[data-index="${index}"]`).style.top = `${appsPosContainerElm.querySelector(`.tile-container[data-index="${index}"]`).getBoundingClientRect().top - appsPosContainerElm.getBoundingClientRect().top}px`;
					}).observe(appsPosContainerElm);

					let apps = document.querySelectorAll(appsContainer + "> .tile-container");
					apps.forEach(app => {
						// #region App Dragging
						let allowDragging; // Only allow dragging after it's being dragged for a while.
						const allowDraggingPxOffset = 4;

						let currentlyMovingAppIndex;
						let overlappingApp;

						let initialMouseX;
						let initialMouseY;

						let isDragging = false;
						let mouseX;
						let mouseY;
						let offsetX;
						let offsetY;

						app.addEventListener("mousedown", (e) => {
							if (e.buttons == 1) {
								initialMouseX = e.clientX;
								initialMouseY = e.clientY;

								isDragging = true;
								offsetX = e.clientX;
								offsetY = e.clientY;
							}
						});

						app.addEventListener("mousemove", (e) => {
							if (e.buttons == 1 && isDragging) {
								currentlyMovingAppIndex = app.dataset.index;

								mouseX = e.clientX;
								mouseY = e.clientY;

								let posX = mouseX - offsetX;
								let posY = mouseY - offsetY;

								if (mouseX > initialMouseX + allowDraggingPxOffset || mouseX < initialMouseX - allowDraggingPxOffset || mouseY > initialMouseY + allowDraggingPxOffset || mouseY < initialMouseY - allowDraggingPxOffset) {
									allowDragging = true;
									app.setAttribute("dragging", true);
								}

								if (allowDragging)
									app.style.transform = `translate(${posX}px, ${posY}px)`;

								if (document.elementsFromPoint(mouseX, mouseY)[3].hasAttribute("data-url"))
									overlappingApp = document.elementsFromPoint(mouseX, mouseY)[3];
								else
									overlappingApp = null;
							}
						});

						app.addEventListener("mouseup", (e) => {
							if (app.dataset.index == currentlyMovingAppIndex) {
								if (overlappingApp) {
									gkNTP.moveApp(app.dataset.index, overlappingApp.dataset.index);
									e.stopImmediatePropagation();
								}

								currentlyMovingAppIndex = null;

								setTimeout(() => {
									allowDragging = false;
								}, 0);
								
								app.removeAttribute("dragging");

								isDragging = false;
								app.style.transform = null;
								app.style.pointerEvents = null;
							}
						});
						// #endregion

						// #region App Opening
						app.addEventListener("click", (e) => {
							if (!allowDragging) {
								// Open as regular tab
								if (app.dataset.type == "tab")
									window.location.replace(app.dataset.url);

								// Open full screen
								else if (app.dataset.type == "fullscreen") {
									window.fullScreen = true;
									window.location.replace(app.dataset.url);
								}
							}
						});
						// #endregion
					});
				}
			});
		});
	}
}
