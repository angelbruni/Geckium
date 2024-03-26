// ==UserScript==
// @name        Geckium - Thumbnail Manager
// @author      AngelBruni
// @loadorder   3
// ==/UserScript==

const { NewTabUtils } = ChromeUtils.importESModule("resource://gre/modules/NewTabUtils.sys.mjs");

function setThumbnailResolution() {
	const browserPage = document.querySelector(".browserStack > browser");

	pref("toolkit.pageThumbs.minWidth").set.int(browserPage.clientWidth);
	pref("toolkit.pageThumbs.minHeight").set.int(browserPage.clientHeight);
}
addEventListener("resize", setThumbnailResolution) 

function captureCurrentPageThumbnail() {
	setTimeout(() => {
		PageThumbs.captureAndStoreIfStale(gBrowser.selectedBrowser);
	}, 4000);
}

function saveCurrentPageThumbnail() {

	// If the page is still loading, do not save a thumbnail.
	if (gBrowser.selectedTab.hasAttribute("busy"))
		return;

	const currentURI = gBrowser.selectedBrowser.currentURI.spec;

	NewTabUtils.activityStreamProvider.getTopFrecentSites({ numItems: 8 }).then(topSites => {
		// Check if topSites is not empty or undefined
		if (topSites && topSites.length > 0) {
			// Iterate through the top sites
			for (let i = 0; i < topSites.length; i++) {
				let website = topSites[i];

				const websiteURL = website.url;
	
				// Check if website URL matches the current URI
				if (websiteURL === currentURI) {
					// Do something if the URLs match
					console.log("websiteURL matches currentURI:", websiteURL);

					captureCurrentPageThumbnail();
				} else {
					console.error("websiteURL does not match currentURI:", websiteURL);

					let websiteURLnoWWW = websiteURL.split("://")[1];
					const currentURInoWWW = gBrowser.selectedBrowser.currentURI.displayHost.split("www.")[1];

					if (websiteURLnoWWW.includes("www")) {
						websiteURLnoWWW = websiteURL.split("://www")[1];
					} else {
						websiteURLnoWWW = websiteURL.split("://")[1];
					}
					
					if (websiteURLnoWWW === currentURInoWWW) {
						console.log("websiteURLnoWWW matches currentURInoWWW:", websiteURLnoWWW);
						captureCurrentPageThumbnail();
						console.log(gBrowser.selectedBrowser.currentURI.spec)
					} else {
						console.error("websiteURLnoWWW does not match currentURInoWWW:", websiteURLnoWWW);
					}
				}
			}
		} else {
			console.error("Top sites list is empty or undefined.");
			// Handle this case as needed
		}
	}).catch(error => {
		console.error("Error retrieving top sites:", error);
	});
}

window.addEventListener("TabAttrModified", saveCurrentPageThumbnail)