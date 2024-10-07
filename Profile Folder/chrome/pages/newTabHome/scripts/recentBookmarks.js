// Import required modules
const { PlacesUtils } = ChromeUtils.importESModule("resource://gre/modules/PlacesUtils.sys.mjs");

// Get the most recent 9 bookmarks
async function getRecentBookmarks() {
	let appearanceChoice = gkEras.getNTPEra();

	if (appearanceChoice >= 3)
		return;


	let bookmarks = [];

	// Retrieve the most recent 9 bookmarks
	let recentBookmarks = await PlacesUtils.bookmarks.getRecent(9);

	// Extract bookmark details
	for (let bookmark of recentBookmarks) {
        bookmarks.push({
            title: bookmark.title,
            url: bookmark.url.href,
        });

        let recentlyBookmarkedItem = `
            <html:a class="recent-bookmark" href="${bookmark.url.href.replace(/[&<>"']/g, match => specialCharacters[match])}" style="list-style-image: url('page-icon:${bookmark.url.href.replace(/[&<>"']/g, match => specialCharacters[match])}')">
                <image></image>
                <label>${bookmark.title.replace(/[&<>"']/g, match => specialCharacters[match])}</label>
            </html:a>
        `;

        let recentBookmarksContainer = "#recentlyBookmarkedContainer";
        document.querySelector(recentBookmarksContainer).appendChild(MozXULElement.parseXULToFragment(recentlyBookmarkedItem));
    }
}