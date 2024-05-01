// ==UserScript==
// @name           	Geckium - About Preferences
// @author         	AngelBruni
// @description    	Adds About pane to about:preferences
// @include			about:preferences*
// ==/UserScript==

const aboutBundle = Services.strings.createBundle("chrome://geckium/locale/properties/about.properties");

const gAboutPane = {
	init() {
		// #region Categories Sidebar
		const categoriesElm = document.getElementById("categories");

		const aboutCategoryElm = document.createXULElement("richlistitem")
		aboutCategoryElm.id = "category-about";
		aboutCategoryElm.classList.add("category");
		aboutCategoryElm.setAttribute("value", "paneAbout");
		aboutCategoryElm.setAttribute("align", "center");
		aboutCategoryElm.setAttribute("tooltiptext", aboutBundle.GetStringFromName("help"));

		const aboutCategoryImageElm = document.createXULElement("image");
		aboutCategoryImageElm.classList.add("category-icon");
		aboutCategoryElm.appendChild(aboutCategoryImageElm);
		
		const aboutCategoryLabelElm = document.createXULElement("label");
		aboutCategoryLabelElm.classList.add("category-name");
		aboutCategoryLabelElm.setAttribute("flex", "1");
		aboutCategoryLabelElm.textContent = aboutBundle.GetStringFromName("help");
		aboutCategoryElm.appendChild(aboutCategoryLabelElm);

		categoriesElm.appendChild(aboutCategoryElm);
		// #endregion

		// #region Panes
		const mainPrefPane = document.getElementById("mainPrefPane");

		const aboutPaneCategoryHeaderElm = document.createElement("div");
		aboutPaneCategoryHeaderElm.id = "aboutCategory-header";
		aboutPaneCategoryHeaderElm.classList.add("subcategory")
		aboutPaneCategoryHeaderElm.setAttribute("data-category", "paneAbout");
		mainPrefPane.appendChild(aboutPaneCategoryHeaderElm);

		const aboutPaneCategoryHeaderTitleElm = document.createElement("h1");
		aboutPaneCategoryHeaderTitleElm.classList.add("title");
		aboutPaneCategoryHeaderTitleElm.textContent = aboutBundle.GetStringFromName("about");
		aboutPaneCategoryHeaderElm.appendChild(aboutPaneCategoryHeaderTitleElm);

		const aboutPaneCategoryElm = document.createElement("div");
		aboutPaneCategoryElm.id = "aboutCategory";
		aboutPaneCategoryElm.setAttribute("data-category", "paneAbout");
		mainPrefPane.appendChild(aboutPaneCategoryElm);

		const aboutPaneCategoryContentDOM = `
		<vbox>
			<hbox id="chrInfo">
				<html:div id="chrLogo" />
				<vbox>
					<html:h2>Google Chrome</html:h2>
					<html:p>${aboutBundle.GetStringFromName("aWebBrowserBuiltFor")}</html:p>
				</vbox>
			</hbox>
			<hbox id="chrButtons">
				<button class="accessory-button" label="${aboutBundle.GetStringFromName("getHelp")}" />
				<button class="accessory-button" label="${aboutBundle.GetStringFromName("reportAnIssue")}" />
			</hbox>
			<html:p id="chrVersion" />
			<hbox id="chrUpdate">
				<html:div />
				<html:p>${aboutBundle.GetStringFromName("updateFailed")}</html:p>
			</hbox>
			<vbox id="chrCredits">
				<html:p>Google Chrome</html:p>
				<html:p id="chrCopyright" />
				<html:p>${aboutBundle.GetStringFromName("madePossibleBy")}</html:p>
				<html:p>${aboutBundle.GetStringFromName("termsOfService")}</html:p>
			</vbox>
		</vbox>
		`
		aboutPaneCategoryElm.appendChild(MozXULElement.parseXULToFragment(aboutPaneCategoryContentDOM));
		// #endregion
	}
}

document.addEventListener("DOMContentLoaded", () => {
	register_module("paneAbout", gAboutPane);

	waitForElm("#aboutCategory").then(() => {
		updateInfo();

		gotoPref(null, "hash");
	});
});

function updateInfo() {
	document.getElementById("chrVersion").textContent = aboutBundle.GetStringFromName("version").replace("%s", gkVisualStyles.getVisualStyles("main").find(item => item.id === gkPrefUtils.tryGet("Geckium.appearance.choice").int).basedOnVersion);
	document.getElementById("chrCopyright").textContent = aboutBundle.GetStringFromName("copyright25").replace("%d", gkVisualStyles.getVisualStyles("main").find(item => item.id === gkPrefUtils.tryGet("Geckium.appearance.choice").int).year[0]);
}

/* bruni: Automatically apply appearance and theme
		  attributes when it detecs changes in the pref. */
const appearanceObs = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			updateInfo();
		}
	},
};
Services.prefs.addObserver("Geckium.appearance.choice", appearanceObs, false);
Services.prefs.addObserver("Geckium.main.overrideStyle", appearanceObs, false);
Services.prefs.addObserver("Geckium.main.style", appearanceObs, false);
Services.prefs.addObserver("Geckium.newTabHome.overrideStyle", appearanceObs, false);
Services.prefs.addObserver("Geckium.newTabHome.style", appearanceObs, false);