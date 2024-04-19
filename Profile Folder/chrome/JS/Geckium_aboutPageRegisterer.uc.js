// ==UserScript==
// @name           Geckium - About Page Registerer
// @author         AngelBruni
// @description    Registers custom about: pages with desired URLs.
// ==/UserScript==

const customAboutPages = {
	"places": 		"chrome://browser/content/places/places.xhtml",

	"gmzoo": 		"chrome://userchrome/content/frameworks/GeckiumMaterial/zoo/index.xhtml",

	"home": 		"chrome://userchrome/content/pages/newTabHome/index.xhtml",
	"newtab": 		"chrome://userchrome/content/pages/newTabHome/index.xhtml",

	"flags": 		"chrome://userchrome/content/pages/flags/index.xhtml",

	"gflags": 	"chrome://userchrome/content/windows/gflags/index.xhtml",
};

function customAboutPage(urlString) {
	this._uri = Services.io.newURI(urlString);
}

customAboutPage.prototype = {
	get uri() { return this._uri; },
	newChannel(_uri, loadInfo) {
		const ch = Services.io.newChannelFromURIWithLoadInfo(this.uri, loadInfo);
		ch.owner = Services.scriptSecurityManager.getSystemPrincipal();
		return ch;
	},
	getURIFlags(_uri) { return Ci.nsIAboutModule.ALLOW_SCRIPT | Ci.nsIAboutModule.IS_SECURE_CHROME_UI; },
	getChromeURI(_uri) { return this.uri; },
	QueryInterface: ChromeUtils.generateQI(["nsIAboutModule"]),
};

for (let aboutKey in customAboutPages) {
	let AboutModuleFactory = {
		createInstance(aIID) { return new customAboutPage(customAboutPages[aboutKey]).QueryInterface(aIID); },
		QueryInterface: ChromeUtils.generateQI(["nsIFactory"]),
	};

	Components.manager.QueryInterface(Ci.nsIComponentRegistrar).registerFactory(
		Components.ID(Services.uuid.generateUUID().toString()),
		`about:${aboutKey}`,
		`@mozilla.org/network/protocol/about;1?what=${aboutKey}`,
		AboutModuleFactory
	);
}