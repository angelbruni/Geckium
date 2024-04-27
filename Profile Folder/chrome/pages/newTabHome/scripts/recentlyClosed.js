function createRecentlyClosed() {
	let appearanceChoice;

	switch (gkPrefUtils.tryGet("Geckium.newTabHome.overrideStyle").bool) {
		case true:
			appearanceChoice = gkPrefUtils.tryGet("Geckium.newTabHome.style").int;
			break;
		default:
			appearanceChoice = gkPrefUtils.tryGet("Geckium.appearance.choice").int;
			break;
	}

	const closedTabsList = SessionStore.getClosedTabDataForWindow(Services.wm.getMostRecentWindow('navigator:browser'));

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

			if (appearanceChoice <= 4)
				recentlyClosedEntriesAmount = 5;
			else if (appearanceChoice == 6 || appearanceChoice == 7)
				recentlyClosedEntriesAmount = 10;

			if (visitedURLs.size >= recentlyClosedEntriesAmount)
				return; // Return early if we already reached max amount of recently closed entries.

			if (visitedURLs.has(url))
				return;

			visitedURLs.add(url);

			title = state.entries[0].title.replace(/[&<>"']/g, match => specialCharacters[match]);

			if (title == undefined)
				return;

			if (!state.image)
				favicon = "chrome://userchrome/content/assets/img/toolbar/grayfolder.png";
			else
				favicon = state.image.replace(/[&<>"']/g, match => specialCharacters[match]);

			// #region Recently closed items
			if (appearanceChoice == 0) {
				recentlyClosedItem = `
				<html:a class="recent-bookmark" href="${url}" style="list-style-image: url('${favicon}')">
					<image></image>
					<label>${title}</label>
				</html:a>
				`
				
				recentlyClosedContainer = "#recentlyClosedContainer";
			}
			else if (appearanceChoice == 1 || appearanceChoice <= 4 || appearanceChoice <= 5) {
				recentlyClosedItem = `
				<html:a class="item" href="${url}" style="list-style-image: url('${favicon}')">
					<image></image>
					<label>${title}</label>
				</html:a>
				`

				if (appearanceChoice == 1)
					recentlyClosedContainer = "#tab-items"
				else if (appearanceChoice <= 4)
					recentlyClosedContainer = "#recently-closed > .items"
				else
					recentlyClosedContainer = "#recently-closed-content"
			} else if (appearanceChoice == 6 || appearanceChoice == 7) {
				recentlyClosedItem = `
				<html:a class="footer-menu-item" href="${url}" style="list-style-image: url('${favicon}')">
					<image></image>
					<label>${title}</label>
				</html:a>
				`
				
				recentlyClosedContainer = "#recently-closed-menu-button .footer-menu"
			}

			if (appearanceChoice <= 7) {
				waitForElm(recentlyClosedContainer).then(function() {
					document.querySelector(recentlyClosedContainer).appendChild(MozXULElement.parseXULToFragment(recentlyClosedItem));
				});
			}
			// #endregion
		});
	}
}