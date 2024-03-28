// ==UserScript==
// @name        Geckium - Thumbnail Manager
// @author      AngelBruni
// @loadorder   3
// @long-description
/*
The purpose of this is to save thumbnails of websites in the internal frecency list.

It was made because I don't understand the requirements that Firefox needs to meet
to save a thumbnail, so instead, for now, I will force capture thumbnails.
*/
// ==/UserScript==

const { NewTabUtils } = ChromeUtils.importESModule("resource://gre/modules/NewTabUtils.sys.mjs");

function setThumbnailResolution() {
	/* Set thumbnail resolution to the same as page resolution.
   
   	   Australis used to have the thumbnail resolution set to the
   	   one in newTab.css, but that stylesheet does not exist anymore
	   and as fallback they also had these prefs that exist til this day. */

	const browserPage = document.querySelector(".browserStack > browser");

	pref("toolkit.pageThumbs.minWidth").set.int(browserPage.clientWidth);
	pref("toolkit.pageThumbs.minHeight").set.int(browserPage.clientHeight);
}
addEventListener("resize", setThumbnailResolution);

function captureCurrentPageThumbnail() {
	/* Add a timeout because sometimes the capture happens while the
	   page is still loading even though the tab is not busy anymore. */
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
		// Check if topSites is not empty or undefined.
		if (topSites && topSites.length > 0) {
			// Iterate through the top sites.
			for (let i = 0; i < topSites.length; i++) {
				let website = topSites[i];

				const websiteURL = website.url;
	
				/* Check if website URL matches the current URI and capture
				   a screenshot if so. */
				if (websiteURL === currentURI) {
					captureCurrentPageThumbnail();
				} else {
					/* This has some really dumb code because sometimes the 
					   webpage in frecency is missing the "www" subdomain but 
					   the actual loaded page has it. */
					   
					let websiteURLnoWWW = websiteURL.split("://")[1];
					const currentURInoWWW = gBrowser.selectedBrowser.currentURI.displayHost.split("www.")[1];

					if (websiteURLnoWWW.includes("www"))
						websiteURLnoWWW = websiteURL.split("://www")[1];
					else
						websiteURLnoWWW = websiteURL.split("://")[1];
					
					if (websiteURLnoWWW === currentURInoWWW) {
						captureCurrentPageThumbnail();
					} else {
						/* If nothing matches at all, do not capture a thumbnail.
						   we don't want to take screenshots of websites that is not in
						   the frecency list, it's unnecessary and we don't want to fill
						   the user's storage. */

						//console.error("websiteURLnoWWW does not match currentURInoWWW:", websiteURLnoWWW);
					}
				}
			}
		} else {
			//console.error("Top sites list is empty or undefined.");
		}
	}).catch(error => {
		//console.error("Error retrieving top sites:", error);
	});
}

window.addEventListener("TabAttrModified", saveCurrentPageThumbnail)