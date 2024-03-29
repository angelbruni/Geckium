const { SessionStore } = ChromeUtils.importESModule("resource:///modules/sessionstore/SessionStore.sys.mjs");

function getClosedTabs() {
	const closedTabsList = SessionStore.getClosedTabDataForWindow(Services.wm.getMostRecentWindow('navigator:browser'));

	closedTabsList.forEach(tab => {
		const state = tab.state;

		const url = state.entries[0].url;
		const title = state.entries[0].title;
		const image = state.entries[0]

		console.log("Icon:", image)
		console.log("URL:", url);
		console.log("Title:", title);

		const menuItem = document.createElement("a");
		menuItem.setAttribute("href", url);
		menuItem.textContent = title;
		menuItem.style.listStyleImage = "url(" + image; + ")"
		document.getElementById("footer-menu-container").appendChild(menuItem)


	});
}