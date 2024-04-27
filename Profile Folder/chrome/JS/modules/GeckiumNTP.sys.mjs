const { gkPrefUtils } = ChromeUtils.importESModule("chrome://modules/content/GeckiumUtils.sys.mjs");

export class gkNTP {
	static get getAppsList() {
		return JSON.parse(gkPrefUtils.tryGet("Geckium.newTabHome.appsList").string);
	}
}