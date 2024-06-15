const cancelElm = document.getElementById("btn-cancel");
const backElm = document.getElementById("btn-back");
const nextElm = document.getElementById("btn-next");
const finishElm = document.getElementById("btn-finish");

function goToPage(direction) {
	const currentPage = document.querySelector('.pages .page[selected="true"]');
	const currentPageIndex = parseInt(currentPage.dataset.page);

	console.log(currentPageIndex, direction, currentPageIndex + 1,)

	if (direction == "next")
		skipToPage('main', currentPageIndex + 1)
	else if (direction == "back")
		skipToPage('main', currentPageIndex - 1)
}

backElm.addEventListener("click", () => {
	goToPage("back");
})

nextElm.addEventListener("click", () => {
	goToPage("next");
})

finishElm.addEventListener("click", () => {
	if (AppConstants.platform == "win") {
		gkPrefUtils.set("widget.ev-native-controls-patch.override-win-version").int(7);		// Force aero
		gkPrefUtils.set("gfx.webrender.dcomp-win.enabled").bool(false);						// Disable dcomp
		gkPrefUtils.set("browser.display.windows.non_native_menus").int(0);					// Enable native menus
	}

	gkPrefUtils.set("browser.urlbar.showSearchTerms.enabled").bool(false);					// Show URL after a search in URLbar

	if (parseInt(Services.appinfo.version.split(".")[0]) >= 126)
		gkPrefUtils.set("browser.urlbar.trimURLs").bool(false);								// Show protocol in URL in URLbar
	
	gkPrefUtils.set("browser.newtab.preload").bool(false)									// Disable New Tab preload to prevent new data from not loading
	gkPrefUtils.set("browser.theme.dark-private-windows").bool(false);						// Disable incognito dark mode

	if (!gkPrefUtils.tryGet("Geckium.newTabHome.appsList").string) {
		gkPrefUtils.set("Geckium.newTabHome.appsList").string(`
		{
			"0": {
				"pos": 0,
				"favicon": "chrome://userchrome/content/pages/newTabHome/assets/chrome-11/imgs/IDR_PRODUCT_LOGO_16.png",
				"oldIcon": "",
				"newIcon": "chrome://userchrome/content/pages/newTabHome/assets/chrome-21/imgs/1.png",
				"oldName": "Web Store",
				"newName": "Web Store",
				"url": "https://chromewebstore.google.com",
				"type": 0
			}
		}
		`);																					// Add default apps if the apps list is empty
	}

	gkPrefUtils.set("Geckium.firstRun.complete").bool(true);

	gkWindow.close();
})

document.addEventListener("pageChanged", () => {
	const currentPage = document.querySelector('.pages .page[selected="true"]');
	const currentPageIndex = parseInt(currentPage.dataset.page);
	console.log(currentPageIndex);

	if (currentPageIndex == 0)
		backElm.style.display = "none";
	else
		backElm.style.display = null;

	if (currentPageIndex == 2)
		nextElm.style.display = "none";
	else
		nextElm.style.display = null;

	if (currentPageIndex == 2)
		finishElm.style.display = null;
	else
		finishElm.style.display = "none";
})