function createRecentlyClosed() {
	const appearanceChoice = pref("Geckium.appearance.choice").tryGet.int();

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

			url = state.entries[0].url;

			if (appearanceChoice <= 2)
				recentlyClosedEntriesAmount = 5;
			else if (appearanceChoice == 3 || appearanceChoice == 4)
				recentlyClosedEntriesAmount = 10;

			if (visitedURLs.size >= recentlyClosedEntriesAmount) {
				return; // Return early if we already reached max amount of recently closed entries.
			}

			if (visitedURLs.has(url)) {
				return;
			}

			visitedURLs.add(url);

			title = state.entries[0].title;

			if (!state.image) {
				favicon = "chrome://userchrome/content/assets/img/toolbar/grayfolder.png";
			} else {
				favicon = state.image;
			}

			// #region Recently closed items
			if (appearanceChoice <= 1) {
				recentlyClosedItem = `
				<html:a class="item" href="${url}" style="list-style-image: url('${favicon}')">
					<image></image>
					<label>${title}</label>
				</html:a>
				`

				recentlyClosedContainer = "#recently-closed > .items"
			} else if (appearanceChoice == 2) {
				recentlyClosedItem = `
				<html:a class="item" href="${url}" style="list-style-image: url('${favicon}')">
					<image></image>
					<label>${title}</label>
				</html:a>
				`

				recentlyClosedContainer = "#recently-closed-content"
			} else if (appearanceChoice == 3 || appearanceChoice == 4) {
				recentlyClosedItem = `
				<html:a class="footer-menu-item" href="${url}" style="list-style-image: url('${favicon}')">
					<image></image>
					<label>${title}</label>
				</html:a>
				`
				
				recentlyClosedContainer = "#recently-closed-menu-button .footer-menu"
			}

			if (appearanceChoice <= 4) {
				waitForElm(recentlyClosedContainer).then(function() {
					document.querySelector(recentlyClosedContainer).appendChild(MozXULElement.parseXULToFragment(recentlyClosedItem));
				});
			}
			// #endregion
		});
	}
}