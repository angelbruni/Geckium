function createRecentlyClosed() {
	let appearanceChoice = gkEras.getNTPEra();

	let closedTabsList = [];
	if (!gkPrefUtils.tryGet("Geckium.devOptions.disableRecentlyClosed").bool)
		closedTabsList = SessionStore.getClosedTabDataForWindow(Services.wm.getMostRecentWindow('navigator:browser'));

	let url;
	let title;
	let favicon;

	let recentlyClosedEntriesAmount;
	let recentlyClosedContainer;

	if (closedTabsList.length !== 0) {
		const visitedURLs = new Set();

		closedTabsList.forEach(tab => {
			let recentlyClosedItem = ``;

			const state = tab.state;

			url = state.entries[0].url.replace(/[&<>"']/g, match => specialCharacters[match]);

			if (appearanceChoice <= 11)
				recentlyClosedEntriesAmount = 5;
			else if (appearanceChoice >= 17 && appearanceChoice <= 25)
				recentlyClosedEntriesAmount = 10;

			if (visitedURLs.size >= recentlyClosedEntriesAmount)
				return; // Return early if we already reached max amount of recently closed entries.

			if (visitedURLs.has(url))
				return;

			visitedURLs.add(url);

			title = state.entries[0].title;

			if (title == undefined)
				return;

			title = title.replace(/[&<>"']/g, match => specialCharacters[match]);

			if (!state.image)
				favicon = "chrome://userchrome/content/assets/img/chrome-1/toolbar/grayfolder.png";
			else
				favicon = state.image.replace(/[&<>"']/g, match => specialCharacters[match]);

			// #region Recently closed items
			if (appearanceChoice <= 2) {
				recentlyClosedItem = `
				<html:a class="recent-bookmark" href="${url}" style="list-style-image: url('${favicon}')">
					<image></image>
					<label>${title}</label>
				</html:a>
				`
				
				recentlyClosedContainer = "#recentlyClosedContainer";
			}
			else if (appearanceChoice == 3 || appearanceChoice <= 6 || appearanceChoice <= 11) {
				recentlyClosedItem = `
				<html:a class="item" href="${url}" style="list-style-image: url('${favicon}')">
					<image class="favicon"></image>
					<label>${title}</label>
				</html:a>
				`

				if (appearanceChoice == 3)
					recentlyClosedContainer = "#tab-items"
				else if (appearanceChoice <= 6)
					recentlyClosedContainer = "#recently-closed > .items"
				else
					recentlyClosedContainer = "#recently-closed-content"
			} else if (appearanceChoice >= 17 && appearanceChoice <= 25) {
				recentlyClosedItem = `
				<html:a class="footer-menu-item" href="${url}" style="list-style-image: url('${favicon}')">
					<image></image>
					<label>${title}</label>
				</html:a>
				`
				
				recentlyClosedContainer = "#recently-closed-menu-button .footer-menu"
			}

			if (appearanceChoice == 11)
				gkInsertElm.before(MozXULElement.parseXULToFragment(recentlyClosedItem), document.querySelector("#recently-closed-menu > hr"));

			if (appearanceChoice <= 25) {
				waitForElm(recentlyClosedContainer).then(function() {
					document.querySelector(recentlyClosedContainer).appendChild(MozXULElement.parseXULToFragment(recentlyClosedItem));
				});
			}
			// #endregion
		});
	} else {
		if (appearanceChoice >= 17 && appearanceChoice <= 25) {
			const recentlyClosedMenuButton = document.getElementById("recently-closed-menu-button");

			const verticalSeparator = document.getElementById("vertical-separator")

			recentlyClosedMenuButton.style.display = "none";
			verticalSeparator.style.display = "none";
		}
	}
}