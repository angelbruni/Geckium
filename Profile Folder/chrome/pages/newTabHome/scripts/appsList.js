function setUpApps() {
	let appearanceChoice;

	switch (gkPrefUtils.tryGet("Geckium.newTabHome.overrideStyle").bool) {
		case true:
			appearanceChoice = gkPrefUtils.tryGet("Geckium.newTabHome.style").int;
			break;
		default:
			appearanceChoice = gkPrefUtils.tryGet("Geckium.appearance.choice").int;
			break;
	}

	let appsContainer;
	
	let pos;
	let icon;
	let favicon;
	let name;
	let type;
	let url;

	const appsList = JSON.parse(gkPrefUtils.tryGet("Geckium.newTabHome.appsList").string);
	const appsListArray = Object.values(appsList);
	appsListArray.sort((a, b) => a.pos - b.pos);

	if (appsListArray.length !== 0) {
		appsListArray.forEach(app => {
			console.log(app)

			let tile;

			pos = app.pos;
			url = app.url;

			if (appearanceChoice == 5) {
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
		
			if (appearanceChoice == 6 || appearanceChoice == 7) {
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
					<image class="icon" draggable="false" src="${icon}"></image>
					<label>${name}</label>
				</html:button>
				`
			}

			document.querySelectorAll(appsContainer + "> *").forEach(app => {
				app.remove();
			})

			waitForElm(appsContainer).then(function() {
				document.querySelector(appsContainer).appendChild(MozXULElement.parseXULToFragment(tile));

				if (appearanceChoice == 6 || appearanceChoice == 7) {
					let apps = document.querySelectorAll(appsContainer + "> .tile-container");
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
							console.log("WHAT")

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
				}
			});
		})
	}
}