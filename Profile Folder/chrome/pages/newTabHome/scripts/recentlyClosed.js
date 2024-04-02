function createRecentlyClosed() {
	const appearanceChoice = pref("Geckium.appearance.choice").tryGet.int();

	const closedTabsList = SessionStore.getClosedTabDataForWindow(Services.wm.getMostRecentWindow('navigator:browser'));

	let url;
	let title;
	let favicon;

	const maxEntries = 5;

	if (closedTabsList.length !== 0) {
		const visitedURLs = new Set();

		closedTabsList.forEach(tab => {
			let recentlyClosedItem = ``;

			const state = tab.state;

			url = state.entries[0].url;

			// If the visitedURLs Set has more than 10 items, remove the oldest URL
			if (visitedURLs.size >= maxEntries) {
				return; // Return early if we already have 10 visited URLs
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

				waitForElm("#recently-closed").then(function() {
					document.querySelector("#recently-closed > .items").appendChild(MozXULElement.parseXULToFragment(recentlyClosedItem));
				});
			} else if (appearanceChoice == 2) {
				recentlyClosedItem = `
				<html:a class="item" href="${url}" style="list-style-image: url('${favicon}')">
					<image></image>
					<label>${title}</label>
				</html:a>
				`
				
				waitForElm("#recently-closed-content").then(function() {
					document.querySelector("#recently-closed-content").appendChild(MozXULElement.parseXULToFragment(recentlyClosedItem));
				});
			} else if (appearanceChoice == 3 || appearanceChoice == 4) {
				recentlyClosedItem = `
				<html:a class="footer-menu-item" href="${url}" style="list-style-image: url('${favicon}')">
					<image></image>
					<label>${title}</label>
				</html:a>
				`
				
				waitForElm("#recently-closed-menu-button .footer-menu").then(function() {
					document.querySelector("#recently-closed-menu-button .footer-menu").appendChild(MozXULElement.parseXULToFragment(recentlyClosedItem));
				});
			}
			// #endregion
		});
	}
}