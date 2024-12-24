const { gkPrefUtils } = ChromeUtils.importESModule("chrome://modules/content/GeckiumUtils.sys.mjs");

export class gkNTP {
	static get getAppsListPref() {
		return "Geckium.newTabHome.appsList";
	}

	static get getAppsList() {
		return JSON.parse(gkPrefUtils.tryGet(this.getAppsListPref).string);
	}

	static get getAppYears() {
		return ["2011", "2012", "2013", "2014", "2015", "2017"];
	}

	static setAppsList(appsList) {
		gkPrefUtils.set(this.getAppsListPref).string(JSON.stringify(appsList));
	}

	static restoreDefaultApps() {
		gkPrefUtils.set(this.getAppsListPref).string(JSON.stringify(
			[
				{
					"favicons": {
						"2011": "chrome://userchrome/content/pages/newTabHome/assets/chrome-11/imgs/IDR_PRODUCT_LOGO_16.png"
					},
					"icons": {
						"2011": "chrome://userchrome/content/assets/img/app_icons/2011/chrome_webstore/128.png",
						"2013": "chrome://userchrome/content/assets/img/app_icons/2013/chrome_webstore/128.png",
						"2015": "chrome://userchrome/content/assets/img/app_icons/2015/chrome_webstore/128.png"
					},
					"names": {
						"2011": "Web Store",
						"2013": "Store"
					},
					"url": "https://chromewebstore.google.com/",
					"type": "tab"
				},
				{
					"favicons": {
						"2011": "chrome://userchrome/content/assets/img/app_icons/2011/gmail/24.png"
					},
					"icons": {
						"2011": "chrome://userchrome/content/assets/img/app_icons/2011/gmail/128.png",
						"2012": "chrome://userchrome/content/assets/img/app_icons/2012/gmail/128.png"
					},
					"names": {
						"2011": "Gmail"
					},
					"url": "https://mail.google.com/",
					"type": "tab"
				},
				{
					"favicons": {
						"2011": "chrome://userchrome/content/assets/img/app_icons/2011/search/16.png"
					},
					"icons": {
						"2011": "chrome://userchrome/content/assets/img/app_icons/2011/search/128.png",
						"2012": "chrome://userchrome/content/assets/img/app_icons/2012/search/128.png"
					},
					"names": {
						"2011": "Google Search"
					},
					"url": "https://www.google.com/",
					"type": "tab"
				},
				{
					"favicons": {
						"2011": "chrome://userchrome/content/assets/img/app_icons/2011/youtube/16.svg"
					},
					"icons": {
						"2011": "chrome://userchrome/content/assets/img/app_icons/2011/youtube/128.png",
						"2012": "chrome://userchrome/content/assets/img/app_icons/2012/youtube/128.png"
					},
					"names": {
						"2011": "YouTube"
					},
					"url": "https://www.youtube.com/",
					"type": "tab"
				},
				{
					"favicons": {
						"2011": "chrome://userchrome/content/assets/img/app_icons/2013/docs/icon_16.png"
					},
					"icons": {
						"2011": "chrome://userchrome/content/assets/img/app_icons/2013/docs/icon_128.png"
					},
					"names": {
						"2011": "Google Docs"
					},
					"url": "https://docs.google.com/",
					"type": "tab"
				},
				{
					"favicons": {
						"2011": "chrome://userchrome/content/assets/img/app_icons/2013/drive/128.png"
					},
					"icons": {
						"2011": "chrome://userchrome/content/assets/img/app_icons/2013/drive/128.png"
					},
					"names": {
						"2011": "Google Drive"
					},
					"url": "https://drive.google.com/",
					"type": "tab"
				}
			]
		));
	}

	static addApp(newApp) {
		const appsList = gkNTP.getAppsList;
		const years = gkNTP.getAppYears;
		
		const appToAdd = {
			favicons: {},
			icons: {},
			names: {},
			url: newApp.url,
			type: newApp.type
		};

		years.forEach(year => {
			if (newApp.favicons && newApp.favicons[year])
				appToAdd.favicons[year] = newApp.favicons[year];

			if (newApp.icons && newApp.icons[year])
				appToAdd.icons[year] = newApp.icons[year];

			if (newApp.names && newApp.names[year])
				appToAdd.names[year] = newApp.names[year];
		});

		appsList.push(appToAdd);

		gkNTP.setAppsList(appsList);
	}
	
	static editApp(appIndex, editedInfo) {
		const appsList = gkNTP.getAppsList;
		const chosenApp = appsList[appIndex];
	
		editedInfo.favicons = editedInfo.favicons || {};
		editedInfo.icons = editedInfo.icons || {};
		editedInfo.names = editedInfo.names || {};
	
		const years = gkNTP.getAppYears;
	
		years.forEach(year => {
			if (editedInfo.favicons.hasOwnProperty(year))
				chosenApp.favicons[year] = editedInfo.favicons[year];

			if (editedInfo.icons.hasOwnProperty(year))
				chosenApp.icons[year] = editedInfo.icons[year];

			if (editedInfo.names.hasOwnProperty(year))
				chosenApp.names[year] = editedInfo.names[year];
		});
	
		chosenApp.url = editedInfo.url || chosenApp.url;
		chosenApp.type = editedInfo.type || chosenApp.type;
		
		gkNTP.setAppsList(appsList);
	}	
	
	static moveApp(fromIndex, toIndex) {
		const appsList = gkNTP.getAppsList;
	
		if (toIndex > appsList.length - 1 || toIndex < 0) {
			console.error("No app exists at", toIndex)
			return;
		}
	
		if (fromIndex !== toIndex) {
			const tempApp = appsList[toIndex];
			appsList[toIndex] = appsList[fromIndex];
			appsList[fromIndex] = tempApp;
	
			gkNTP.setAppsList(appsList);
		}
	}

	static deleteApp(identifier) {
		const appsList = gkNTP.getAppsList;
	
		let indexToDelete = -1;
	
		if (identifier >= 0 && identifier < appsList.length)
			indexToDelete = identifier;
	
		if (indexToDelete === -1) {
			console.error("App not found.");
			return;
		}
	
		appsList.splice(indexToDelete, 1);
	
		gkNTP.setAppsList(appsList);
	}
}