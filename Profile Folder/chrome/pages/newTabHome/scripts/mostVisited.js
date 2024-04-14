const { NewTabUtils } = ChromeUtils.importESModule("resource://gre/modules/NewTabUtils.sys.mjs");
let topFrecentSites;

const desiredRows = 2;
const desiredCols = 4;
const numTiles = desiredRows * desiredCols;

const { PageThumbs } = ChromeUtils.importESModule("resource://gre/modules/PageThumbs.sys.mjs");

// Map of special characters and their corresponding HTML entities
const specialCharacters = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#39;",
};

/* Temporary code for webpage colours until I pick a colour with canvas.

   These colours are based from the ones Internet Explorer 9 picked up.
   This is code from BeautyFox. */
const websiteColors = {
	'google':				'rgb(65,133,243)',
	'youtube':				'rgb(255,1,1)',
	'winclassic':			'rgb(3,28,145)',
	'github':				'rgb(33,39,44)',
	'instagram':			'rgb(253,20,123)',
	'deviantart':			'rgb(0,226,153)',
	'mega':					'rgb(236,13,19)',
	'deepl':				'rgb(15,42,70)',
	'gitlab':				'rgb(225,66,40)',
	'gitgud':				'rgb(225,66,40)',
	'betawiki':				'rgb(233,55,55)',
	'archive.org':			'rgb(8,8,8)',
	'microsoft':			'rgb(0,163,239)',
	'obsproject':			'rgb(34,32,35)',
	'last.fm':				'rgb(185,2,2)',
	'reddit':				'rgb(254,67,0)',
	'ftp.mozilla':			'rgb(239,4,1)',
	'steam':				'rgb(7,26,67)',
	'carl.gg':				'rgb(120,130,63)',
	'discord':				'rgb(89,103,242)',
	'sync-tube':			'rgb(208,73,73)',
	'riotgames':			'rgb(7,7,7)',
	'win7gadgets':			'rgb(232,134,42)',
	'twitch':				'rgb(144,69,255)',
	'proton.me':			'rgb(126,106,248)',
	'cssgradient':			'rgb(6,52,118)',
	'gamebanana':			'rgb(248,198,35)',
	'dropbox':				'rgb(2,97,253)',
	'css-mask-generator':	'rgb(21,21,21)',
	'twitter':				'rgb(27,159,241)',
	'x.com':				'rgb(27,159,241)',
	'wikipedia':			'rgb(12,12,12)',
	'windowswallpaper':		'rgb(139,131,48)',
	'searchfox':			'rgb(226,49,78)',
	'unitconverters':		'rgb(0,102,51)',
	'trello':				'rgb(0,132,209)',
	'curseforge':			'rgb(239,98,52)',
	'stackoverflow':		'rgb(241,126,32)',
	'adoptium':				'rgb(217,19,98)',
	'vencord':				'rgb(239,190,190)',
	'minecraftforum':		'rgb(107,183,56)',
	'glovo':				'rgb(252,191,89)',
	'w3schools':			'rgb(0,152,102)',
	'soundcloud':			'rgb(255,46,0)',
	'onedrive':				'rgb(18,137,215)',
	'jsdelivr':				'rgb(208,73,58)',
	'realityripple':		'rgb(6,7,7)',
	'mozilla':				'rgb(1,1,1)',
	'windhawk':				'rgb(51,51,51)',
	'tracker.gg':			'rgb(213,61,31)',
	'modrinth':				'rgb(0,174,91)',
	'bing':					'rgb(14,108,188)',
	'duckduckgo':			'rgb(22,90,52)',
	'searx':				'rgb(11,11,11)',
};

function retrieveFrequentSites() {
    NewTabUtils.activityStreamProvider.getTopFrecentSites({ numItems: numTiles })
		.then(result => {
			/* Count the number of websites with no title, with
			   searchquery or a cdn to prevent duplicates in new tab
			   (there might be a better way to do this). */

			const invalidWebsite = result.filter(website => !website.title || website.title == "" || website.url.includes("?") && website.url.includes("cdn") ).length;
			
			// Calculate the total number of websites to retrieve again, filtering out the ones with no icon or title.
			const totalTiles = (desiredCols + invalidWebsite) * desiredRows;
			return NewTabUtils.activityStreamProvider.getTopFrecentSites({ numItems: totalTiles + 4 });
		})
		.then(result => {
			// Filter out websites with no title, with searchquery or a cdn.
			topFrecentSites = result.filter(website => website.title && website.title.trim() !== "" && !website.url.includes("?") && !website.url.includes("cdn") );

			// Sort the topFrecentSites array by frecency in descending order
			topFrecentSites.sort((a, b) => b.frecency - a.frecency);

			populateRecentSitesGrid();
		})
		.catch(error => {
			console.error('Error occurred when retrieving the top recent sites:', error);
		});
}

function createTile(website) {
	const appearanceChoice = pref("Geckium.appearance.choice").tryGet.int();

    try {
		let tile;

        if (website) {
			let favicon;

			let close;
			let thumbnail;
		
			const thumbnailImageFb1 = PageThumbs.getThumbnailURL(website.url.split("://")[0] + "://www." + website.url.split("://")[1] + "/");
			const thumbnailImageFb2 = PageThumbs.getThumbnailURL(website.url);
			const thumbnailImageFb3 = PageThumbs.getThumbnailURL(website.url + "/");
			const thumbnailImageFb4 = PageThumbs.getThumbnailURL(website.url.split("://www")[1]);
			const thumbnailImageFb5 = PageThumbs.getThumbnailURL(website.url.split("://")[1]);
			let thumbnailImageFb6;

			if (!website.favicon)
				favicon = "chrome://userchrome/content/assets/img/toolbar/grayfolder.png";
			else
				favicon = website.favicon;
			
			// Replace special characters with their corresponding HTML entities.
			const title = website.title.replace(/[&<>"']/g, match => specialCharacters[match]);

			if (appearanceChoice <= 2) {
				tile = `
				<html:a class="thumbnail-container" href="${website.url}">
					<vbox class="edit-mode-border">
						<hbox class="edit-bar">
							<button class="pin" title="Keep on this page"></button>
							<spacer></spacer>
							<button class="remove" title="Don't show on this page"></button>
						</hbox>
						<html:div class="thumbnail-wrapper">
							<html:div class="thumbnail"></html:div>
						</html:div>
					</vbox>
					<html:div class="title">
						<hbox style="list-style-image: url('${favicon}')">
							<image class="favicon"></image>
							<label>${title}</label>
						</hbox>
					</html:div>
				</html:a>
				`

				close = ".thumbnail-container[href='"+ website.url +"'] .remove";

				thumbnailImageFb6 = "chrome://userchrome/content/pages/newTabHome/assets/chrome-5/imgs/default_thumbnail.png";
				thumbnail = ".thumbnail-container[href='"+ website.url +"'] .thumbnail-wrapper";
			} else if (appearanceChoice == 3 || appearanceChoice == 4) {
				for (const key in websiteColors) {
					const websiteURL = website.url.toLowerCase();

					if (websiteURL.includes(key)) {
						activityColour = websiteColors[key];
						break;
					}
				}

				tile = `
				<html:div class="tile">
					<html:a class="most-visited" href="${website.url}">
						<html:div class="thumbnail-wrapper">
							<html:button class="close-button" title="Don't show on this page"></html:button>
							<html:div class="thumbnail">
								<html:div class="thumbnail-shield"></html:div>
							</html:div>
							<html:img class="favicon" src="${favicon}"></html:img>
						</html:div>
						<html:div class="color-stripe" style="background-color: ${activityColour}"></html:div>
						<html:p class="title">${title}</html:p>
					</html:a>
				</html:div>
				`

				close = ".most-visited[href='"+ website.url +"'] .close-button";
				
				thumbnail = ".most-visited[href='"+ website.url +"'] .thumbnail";
			} else {
				if (pref("Geckium.crflag.enable.icon.ntp").tryGet.bool()) {
					document.documentElement.setAttribute("icon-ntp", true);

					tile = `
					<html:a class="mv-tile" style="list-style-image: url(${favicon})" href="${website.url}" title="${title}" data-letter="${Array.from(title)[0]}">
						<image class="mv-favicon"></image>
						<label class="mv-title">${title}</label>
						<html:button class="mv-x"></html:button>
					</html:a>
					`
				} else {
					tile = `
					<html:a class="mv-tile" style="list-style-image: url(${favicon})" href="${website.url}" title="${title}">
						<hbox class="title-container">
							<image class="mv-favicon"></image>
							<label class="mv-title">${title}</label>
							<html:button class="mv-x"></html:button>
						</hbox>
						<html:div class="mv-thumb"></html:div>
					</html:a>
					`
				}

				close = ".mv-tile[href='" + website.url + "'] .mv-x";

				thumbnail = ".mv-tile[href='"+ website.url +"'] .mv-thumb";
			}

			waitForElm(close).then(function() {
				document.querySelector(close).addEventListener("click", function(e) {
					e.stopPropagation();
					e.preventDefault();
	
					NewTabUtils.activityStreamLinks.deleteHistoryEntry(website.url);
					NewTabUtils.activityStreamLinks.deleteHistoryEntry(website.url.split("://")[0] + "://www." + website.url.split("://")[1]);
					
					setTimeout(() => {
						retrieveFrequentSites();
					},20);
				})
			});

			if (!pref("Geckium.crflag.enable.icon.ntp").tryGet.bool()) {
				waitForElm(thumbnail).then(function() {
					for (let i = 0; i < numTiles; i++) {
						document.querySelector(thumbnail).style.backgroundImage = "url(" + thumbnailImageFb1 + "), url(" + thumbnailImageFb2 + "), url(" + thumbnailImageFb3 + "), url(" + thumbnailImageFb4 + "), url(" + thumbnailImageFb5 + "), url(" + thumbnailImageFb6 + ")";
					}
				});
			}
        } else {
			if (appearanceChoice <= 2) {
				tile = `
				<html:a class="thumbnail-container" disabled="true">
					<vbox class="edit-mode-border">
						<hbox class="edit-bar">
							<button class="pin" title="Keep on this page"></button>
							<spacer></spacer>
							<button class="remove" title="Don't show on this page"></button>
						</hbox>
						<html:div class="thumbnail-wrapper">
							<html:div class="thumbnail"></html:div>
						</html:div>
					</vbox>
					<html:div class="title">
						<hbox>
							<image></image>
							<label></label>
						</hbox>
					</html:div>
				</html:a>
				`
			} else if (appearanceChoice == 3 || appearanceChoice == 4) {
				tile = `
				<html:div class="tile">
					<html:a class="most-visited" disabled="true">
						<html:div class="thumbnail-wrapper">
							<html:button class="close-button" title="Don't show on this page"></html:button>
							<html:div class="thumbnail">
								<html:div class="thumbnail-shield"></html:div>
							</html:div>
							<html:img class="favicon"></html:img>
						</html:div>
						<html:div class="color-stripe"></html:div>
						<html:p class=""></html:p>
					</html:a>
				</html:div>
				`
			} else {
				if (!pref("Geckium.crflag.enable.icon.ntp").tryGet.bool()) {
					tile = `
					<html:a class="mv-tile" disabled="true"></html:a>
					`
				}
			}
		}

		console.log(tile);

        return MozXULElement.parseXULToFragment(tile);
    } catch (e) {
        console.error(e);
    }
}

function populateRecentSitesGrid() {
	const appearanceChoice = pref("Geckium.appearance.choice").tryGet.int()
	let mostViewed;

	if (appearanceChoice <= 1)
		mostViewed = "#most-visited";
	else if (appearanceChoice == 2)
		mostViewed = "#most-viewed-content";
	else if (appearanceChoice == 3 || appearanceChoice == 4)
		mostViewed = "#most-visited-page .tile-grid";
	else
		mostViewed = "#mv-tiles";

	// Delete the tiles to update with new information (there might be a better way to do this).
    document.querySelectorAll(mostViewed + "> *").forEach(element => {
        element.remove();
    });

    if (topFrecentSites) {
		waitForElm(mostViewed).then(function() {
			let mostVisited;

			mostVisited = document.querySelector(mostViewed);

			for (let i = 0; i < numTiles; i++) {
				const tile = createTile(topFrecentSites[i]);

				try {
					mostVisited.appendChild(tile);
				} catch (e) {
					console.error(e)
				}
			}
		});
    }
}