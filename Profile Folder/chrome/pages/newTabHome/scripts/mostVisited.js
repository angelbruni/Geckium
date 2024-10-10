const { NewTabUtils } = ChromeUtils.importESModule("resource://gre/modules/NewTabUtils.sys.mjs");

let pinnedSites = [];
let topFrecentSites = [];
let storedForDeletion = [];

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

function getTilesAmount(string) {
	let appearanceChoice = gkEras.getNTPEra();
	
	let desiredRows;
	let desiredCols;
	
	if (appearanceChoice <= 2) {
		desiredRows = 3;
		desiredCols = 3;
	} else {
		desiredRows = 2;
		desiredCols = 4;
	}

	switch (string) {
		case "rows":
			return desiredRows;
		case "cols":
			return desiredCols;
		default:
			return desiredRows * desiredCols;
	}
}

function retrievePinnedSites() {
    const pinnedData = gkPrefUtils.tryGet("browser.newtabpage.pinned").string;

    if (pinnedData) {
		pinnedSites = JSON.parse(pinnedData).map(site => ({
			...site,
			pinned: true // Mark as pinned
		}));
	}
    else {
		pinnedSites = [];
	}
}

function pinSite(site, title) {
	let pinnedSites = [];

	if (gkPrefUtils.tryGet("browser.newtabpage.pinned").string)
		pinnedSites = JSON.parse(gkPrefUtils.tryGet("browser.newtabpage.pinned").string);

	// Normalize the URL (remove trailing slash if present)
    const normalizedSite = site.endsWith('/') ? site.slice(0, -1) : site;

    // Check if the site is already pinned (normalize for comparison)
    const isAlreadyPinned = pinnedSites.some(pinnedSite => {
        const normalizedPinnedUrl = pinnedSite.url.endsWith('/') ? pinnedSite.url.slice(0, -1) : pinnedSite.url;
        return normalizedPinnedUrl === normalizedSite;
    });		

	// Only add the site if it is not already pinned
	if (!isAlreadyPinned) {
		const pinnedObject = {
			url: site,
			label: title
		};

		pinnedSites.push(pinnedObject);

		// Update the pinned sites in preferences
		gkPrefUtils.set("browser.newtabpage.pinned").string(JSON.stringify(pinnedSites));

		// Refresh the pinned and frequent sites after a short delay
		setTimeout(() => {
			retrievePinnedSites();
			retrieveFrequentSites();
		}, 20);
	}
}

function unpinSite(site) {
    let pinnedSites;

    // Retrieve pinned sites
    if (gkPrefUtils.tryGet("browser.newtabpage.pinned").string) {
		pinnedSites = JSON.parse(gkPrefUtils.tryGet("browser.newtabpage.pinned").string);

		// Normalize the URL (remove trailing slash if present)
		const normalizedSite = site.endsWith('/') ? site.slice(0, -1) : site;

		// Filter out the site with the matching URL
		pinnedSites = pinnedSites.filter(pinnedSite => {
			const normalizedPinnedUrl = pinnedSite.url.endsWith('/') ? pinnedSite.url.slice(0, -1) : pinnedSite.url;
			return normalizedPinnedUrl !== normalizedSite;
		});
	
		// Update the pinned sites in preferences
		gkPrefUtils.set("browser.newtabpage.pinned").string(JSON.stringify(pinnedSites));
	
		// Refresh the pinned and frequent sites after a short delay
		setTimeout(() => {
			retrievePinnedSites();
			retrieveFrequentSites();
		}, 20);
	}
}

function retrieveFrequentSites() {
    const totalTiles = getTilesAmount(); // Calculate the total amount of tiles

	// Fetch more frequent sites to compensate for any that might get filtered out
	NewTabUtils.activityStreamProvider.getTopFrecentSites({ numItems: totalTiles + 10 })  // Fetch extra to account for filtered out
	.then(result => {
		const validFrequentSites = result.filter(website => 
			website.title && website.title.trim() !== "" && !website.url.includes("?") && !website.url.includes("cdn")
		);

		// Exclude frequent sites that are already pinned
		topFrecentSites = validFrequentSites.filter(website => 
			!pinnedSites.some(pinnedSite => pinnedSite.url === website.url)
		);

		// Sort by frecency
		topFrecentSites.sort((a, b) => b.frecency - a.frecency);

		// Populate the grid
		populateRecentSitesGrid();
	})
	.catch(error => {
		console.error('Error occurred when retrieving the top recent sites:', error);
	});
}

function markForDeletion(url) {
	storedForDeletion.push(url);		
}

function deleteFromRecent(url) {
	NewTabUtils.activityStreamLinks.deleteHistoryEntry(url);
	NewTabUtils.activityStreamLinks.deleteHistoryEntry(url.split("://")[0] + "://www." + url.split("://")[1]);
}

function deleteStoredFromDeletionSites() {
	storedForDeletion.forEach(url => deleteFromRecent(url));

	storedForDeletion = [];
}

function createTile(website) {
	let appearanceChoice = gkEras.getNTPEra();

    try {
		let tile;

        if (website !== undefined) {
			let url = website.url.replace(/[&<>"']/g, match => specialCharacters[match]);

			let pinned;
			if (website.pinned == true)
				pinned = true;
			else
				pinned = false;

			let favicon;

			let title;

			let pin;
			let close;
			let thumbnail;

			let pinTitle;
			if (pinned)
				pinTitle = ntpBundle.GetStringFromName("dontKeepOnThisPage");
			else
				pinTitle = ntpBundle.GetStringFromName("keepOnThisPage");
		
			const thumbnailImageFb1 = PageThumbs.getThumbnailURL(website.url.split("://")[0] + "://www." + website.url.split("://")[1] + "/");
			const thumbnailImageFb2 = PageThumbs.getThumbnailURL(website.url);
			const thumbnailImageFb3 = PageThumbs.getThumbnailURL(website.url + "/");
			const thumbnailImageFb4 = PageThumbs.getThumbnailURL(website.url.split("://www")[1]);
			const thumbnailImageFb5 = PageThumbs.getThumbnailURL(website.url.split("://")[1]);
			let thumbnailImageFb6;
			
			const defaultColor = 'rgb(14,108,188)'; // Default color
			let websiteColor = defaultColor;

			if (!website.favicon) {
				favicon = "chrome://userchrome/content/assets/img/toolbar/grayfolder.png";

				if (pinned)
					favicon = `page-icon:${url}`;
			} else {
				favicon = website.favicon;
			}
			
			// Replace special characters with their corresponding HTML entities.
			if (website.title)
				title = website.title.replace(/[&<>"']/g, match => specialCharacters[match]);
			else if (website.label)
				title = website.label.replace(/[&<>"']/g, match => specialCharacters[match]);
			else
				title = url;

			if (appearanceChoice == 1) {
				tile = `
				<html:a href="${url}" title="${title}" pinned="${pinned}">
					<hbox class="thumbnail-title" style="list-style-image: url('${favicon}')">
						<image />
						<label>${title}</label>
					</hbox>
					<image class="thumbnail" />
				</html:a>
				`

				thumbnail = "a[href='"+ url +"'] .thumbnail";
			} else if (appearanceChoice == 2) {
				tile = `
				<vbox href="${url}" pinned="${pinned}" class="most-visited-container">
					<html:a href="${url}" title="${title}" class="disabled-on-edit">
						<hbox class="thumbnail-title" style="list-style-image: url('${favicon}')">
							<image />
							<label>${title}</label>
						</hbox>
						<image class="thumbnail" />
					</html:a>
					<hbox class="edit-container edit-visible">
						<html:div class="edit-pin"/>
						<html:div class="edit-cross"/>
					</hbox>
				</vbox>
				`

				pin = ".most-visited-container[href='"+ url +"'] .edit-pin";
				close = ".most-visited-container[href='"+ url +"'] .edit-cross";

				thumbnail = "a[href='"+ url +"'] .thumbnail";
			} else if (appearanceChoice <= 11) {
				tile = `
				<html:a class="thumbnail-container" href="${url}" pinned="${pinned}">
					<vbox class="edit-mode-border">
						<hbox class="edit-bar">
							<html:button class="pin" title="${pinTitle}"></html:button>
							<spacer></spacer>
							<html:button class="remove" title="${ntpBundle.GetStringFromName("doNotShowOnThisPage")}"></html:button>
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

				pin = ".thumbnail-container[href='"+ url +"'] .pin";
				close = ".thumbnail-container[href='"+ url +"'] .remove";

				thumbnailImageFb6 = "chrome://userchrome/content/pages/newTabHome/assets/chrome-5/imgs/default_thumbnail.png";
				thumbnail = ".thumbnail-container[href='"+ url +"'] .thumbnail-wrapper";
			} else if (appearanceChoice == 21 || appearanceChoice == 25) {
				for (const key in websiteColors) {
					const websiteURL = url.toLowerCase();
					
					if (websiteURL.includes(key)) {
						websiteColor = websiteColors[key];
						break;	
					}
				}

				tile = `
				<html:div class="tile" pinned="${pinned}">
					<html:a class="most-visited" href="${url}">
						<html:div class="thumbnail-wrapper">
							<html:button class="pin-button" title="${pinTitle}"></html:button>
							<html:button class="close-button" title="${ntpBundle.GetStringFromName("doNotShowOnThisPage")}"></html:button>
							<html:div class="thumbnail">
								<html:div class="thumbnail-shield"></html:div>
							</html:div>
							<html:img class="favicon" src="${favicon}"></html:img>
						</html:div>
						<html:div class="color-stripe" style="background-color: ${websiteColor}"></html:div>
						<html:p class="title">${title}</html:p>
					</html:a>
				</html:div>
				`

				pin = ".most-visited[href='"+ url +"'] .pin-button";
				close = ".most-visited[href='"+ url +"'] .close-button";
				
				thumbnail = ".most-visited[href='"+ url +"'] .thumbnail";
			} else if (appearanceChoice >= 47) {
				if (appearanceChoice == 47 && gkPrefUtils.tryGet("Geckium.chrflag.enable.icon.ntp").bool) {
					document.documentElement.setAttribute("icon-ntp", true);

					tile = `
					<html:a class="mv-tile" style="list-style-image: url(${favicon})" href="${url}" title="${title}" data-letter="${Array.from(title)[0]}" pinned="${pinned}">
						<image class="mv-favicon"></image>
						<label class="mv-title">${title}</label>
						<html:button class="mv-pin"></html:button>
						<html:button class="mv-x"></html:button>
					</html:a>
					`
				} else {
					tile = `
					<html:a class="mv-tile" style="list-style-image: url(${favicon})" href="${url}" title="${title}" pinned="${pinned}">
						<hbox class="title-container">
							<image class="mv-favicon"></image>
							<label class="mv-title">${title}</label>
							<html:button class="mv-pin"></html:button>
							<html:button class="mv-x"></html:button>
						</hbox>
						<html:div class="mv-thumb"></html:div>
					</html:a>
					`
				}

				pin = ".mv-tile[href='" + url + "'] .mv-pin";
				close = ".mv-tile[href='" + url + "'] .mv-x";

				thumbnail = ".mv-tile[href='"+ url +"'] .mv-thumb";
			}

			waitForElm(close).then(function() {
				document.querySelector(close).addEventListener("click", function(e) {
					e.stopPropagation();
					e.preventDefault();

					if (pinned)
						unpinSite(url);

					if (appearanceChoice == 2) {
						markForDeletion(url);

						document.querySelector(".most-visited-container[href='"+ url +"']").style.display = "none";
					} else {
						deleteFromRecent(url);
					
						setTimeout(() => {
							retrievePinnedSites();
							retrieveFrequentSites();
						},20);
					}
				})
			});

			waitForElm(pin).then(function() {
				document.querySelector(pin).addEventListener("click", function(e) {
					e.stopPropagation();
					e.preventDefault();

					if (pinned)
						unpinSite(url);
					else
						pinSite(url, title);
				})
			})

			if (!(gkPrefUtils.tryGet("Geckium.chrflag.enable.icon.ntp").bool && appearanceChoice == 25)) {
				waitForElm(thumbnail).then(function() {
					for (let i = 0; i < getTilesAmount(); i++) {
						document.querySelector(thumbnail).style.backgroundImage = "url(" + thumbnailImageFb1 + "), url(" + thumbnailImageFb2 + "), url(" + thumbnailImageFb3 + "), url(" + thumbnailImageFb4 + "), url(" + thumbnailImageFb5 + "), url(" + thumbnailImageFb6 + ")";
					}
				});
			}
        } else {
			if (appearanceChoice <= 2) {
				tile = `
				<!--<html:div class="thumbnail" />-->
				`
			} else if (appearanceChoice <= 11) {
				tile = `
				<html:a class="thumbnail-container" disabled="true">
					<vbox class="edit-mode-border">
						<hbox class="edit-bar">
							<html:button class="pin"></html:button>
							<spacer></spacer>
							<html:button class="remove" title="${ntpBundle.GetStringFromName("doNotShowOnThisPage")}"></html:button>
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
			} else if (appearanceChoice == 21 || appearanceChoice == 25) {
				tile = `
				<html:div class="tile">
					<html:a class="most-visited" disabled="true">
						<html:div class="thumbnail-wrapper">
							<html:button class="pin-button"></html:button>
							<html:button class="close-button" title="${ntpBundle.GetStringFromName("doNotShowOnThisPage")}"></html:button>
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
			}  else if (appearanceChoice >= 47) {
				if (appearanceChoice == 47 && gkPrefUtils.tryGet("Geckium.chrflag.enable.icon.ntp").bool) {
					tile = ``;
				} else {
					tile = `
					<html:a class="mv-tile" disabled="true"></html:a>
					`
				}
			}
		}

        return MozXULElement.parseXULToFragment(tile);
    } catch (e) {
        console.error(e);
    }
}

function populateRecentSitesGrid() {
	let appearanceChoice = gkEras.getNTPEra();

	let mostViewed;

	if (appearanceChoice <= 2)
		mostViewed = "#mostvisitedtiles";
	else if (appearanceChoice <= 6)
		mostViewed = "#most-visited";
	else if (appearanceChoice == 11)
		mostViewed = "#most-viewed-content";
	else if (appearanceChoice == 21 || appearanceChoice == 25)
		mostViewed = "#most-visited-page .tile-grid";
	else if (appearanceChoice >= 47)
		mostViewed = "#mv-tiles";

	// Delete the tiles to update with new information (there might be a better way to do this).
    document.querySelectorAll(mostViewed + "> *").forEach(elm => {
        elm.remove();
    });

    // Get the total number of tiles needed
    const totalTiles = getTilesAmount();

    // Merge pinned and frequent sites, but only take up to the number of required tiles
    const combinedSites = [...pinnedSites];

    // Add frequent sites until we fill up the total number of tiles
    for (let i = 0; i < topFrecentSites.length && combinedSites.length < totalTiles; i++) {
        combinedSites.push(topFrecentSites[i]);
    }

    // Populate the grid with the combined list
	console.log(combinedSites.length);		

    if (combinedSites.length) {
		const mostVisited = document.querySelector(mostViewed);

		waitForElm(mostViewed).then(function() {
			combinedSites.forEach(site => {
				const tile = createTile(site);
				try {
					mostVisited.appendChild(tile);
				} catch (e) {
					console.error(e);
				}
			});

			for (let i = 0; i < getTilesAmount() - combinedSites.length; i++) {
				console.log(getTilesAmount() - combinedSites.length)
	
				const emptyTile = createTile();
	
				mostVisited.appendChild(emptyTile);
			}
		});

		
    }
}