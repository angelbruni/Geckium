const { NewTabUtils } = ChromeUtils.importESModule("resource://gre/modules/NewTabUtils.sys.mjs");
let topFrecentSites;

const desiredRows = 2;
const desiredCols = 4;
const numTiles = desiredRows * desiredCols;

const { PageThumbs } = ChromeUtils.importESModule("resource://gre/modules/PageThumbs.sys.mjs");

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
	// Delete the tiles to update with new information (there might be a better way to do this).
    document.querySelectorAll('.tile').forEach(element => {
        element.remove();
    });

    NewTabUtils.activityStreamProvider.getTopFrecentSites({ numItems: numTiles })
		.then(result => {
			/* Count the number of websites with no title, with
			   searchquery or a cdn to prevent duplicates in new tab
			   (there might be a better way to do this). */

			const invalidWebsite = result.filter(website => !website.title || website.title == "" || website.url.includes("?") && website.url.includes("cdn") ).length;
			
			// Calculate the total number of websites to retrieve again, filtering out the ones with no icon or title.
			const totalTiles = (desiredCols + invalidWebsite) * desiredRows;
			return NewTabUtils.activityStreamProvider.getTopFrecentSites({ numItems: totalTiles });
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

document.addEventListener("DOMContentLoaded", retrieveFrequentSites);

function createTile(website) {
    try {
        const tile = document.createElement('a');
        tile.classList.add('tile');

		const thumbnailWrapper = document.createXULElement('vbox');
		thumbnailWrapper.classList.add("thumbnail-wrapper");
		tile.appendChild(thumbnailWrapper);

		const thumbnail = document.createElement("div");
		thumbnail.classList.add("thumbnail");
		thumbnailWrapper.appendChild(thumbnail);

		const thumbnailShield = document.createElement("div");
		thumbnailShield.classList.add("thumbnail-shield");
		thumbnail.appendChild(thumbnailShield);

        if (website) {
            tile.href = website.url;
			tile.setAttribute("title", website.title);

			const closeBtn = document.createElement('button');
            closeBtn.classList.add('close-button');
			closeBtn.addEventListener("click", function(e) {
				e.stopPropagation();
				e.preventDefault();
			})
            setAttributes(closeBtn, {
                "onclick": "NewTabUtils.activityStreamLinks.deleteHistoryEntry('" + website.url + "'); setTimeout(() => { retrieveFrequentSites(); }, 20);",
                "title": "Don't show on this page"
            })
            thumbnailWrapper.appendChild(closeBtn);

			insertAfter(thumbnail, closeBtn);
			
			/* These URLs are to cover most possible combinations of the URL s
			   we have fallbacks for the thumbnail image. */
			thumbnail.style.backgroundImage = "url(" + PageThumbs.getThumbnailURL(website.url.split("://")[0] + "://www." + website.url.split("://")[1] + "/") + "), url(" + PageThumbs.getThumbnailURL(website.url)  + "), url(" + PageThumbs.getThumbnailURL(website.url + "/")  + "), url(" + PageThumbs.getThumbnailURL(website.url.split("://www")[1]) + "), url(" + PageThumbs.getThumbnailURL(website.url.split("://")[1]) + ")";

            const favicon = document.createElement("div");
            favicon.classList.add("favicon");
			if (!website.favicon) {
				favicon.style.backgroundImage = "url(chrome://userchrome/content/assets/img/toolbar/grayfolder.png)";
				favicon.style.backgroundSize = "auto";
			} else {
				favicon.style.backgroundImage = "url(" + website.favicon + ")";
			}
            thumbnailWrapper.appendChild(favicon);

			const websiteURL = website.url.toLowerCase();
			const defaultColor = "rgb(14,108,188)"; // Default color
			let activityColour = defaultColor;
			for (const key in websiteColors) {
				if (websiteURL.includes(key)) {
					activityColour = websiteColors[key];
					break;
				}
			}

			const colourStripe = document.createElement("div");
			colourStripe.classList.add("color-stripe");
			colourStripe.style.backgroundColor = activityColour;
			tile.appendChild(colourStripe);

            const title = document.createElement('p');
            title.classList.add('title');
            title.textContent = website.title;
            tile.appendChild(title);
        } else {
			tile.setAttribute("disabled", true);
		}

        return tile;
    } catch (error) {
        console.error(error);
    }
}

function populateRecentSitesGrid() {
    if (topFrecentSites) {
        const tileGrid = document.querySelector('.tile-grid');

        for (let i = 0; i < numTiles; i++) {
			const tile = createTile(topFrecentSites[i]);
			tileGrid.appendChild(tile);
		}
    }
}