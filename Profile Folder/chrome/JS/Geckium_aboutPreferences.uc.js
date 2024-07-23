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

		const fullNameOS = gkBranding.getBrandingKey("fullName", true);
		const fullName = gkBranding.getBrandingKey("fullName");
		const isOS = gkBranding.getIsOS();

		const aboutPaneCategoryContentDOM = `
		<vbox>
			<hbox id="chrInfo">
				<html:div id="chrLogo" />
				<vbox>
					<html:h2>${fullNameOS}</html:h2>
					<html:p>${isOS ? aboutBundle.GetStringFromName("theFasterSimplerAndMoreSecure") : aboutBundle.GetStringFromName("aWebBrowserBuiltFor")}</html:p>
				</vbox>
			</hbox>
			<hbox id="chrButtons">
				<button class="accessory-button" label="${aboutBundle.GetStringFromName("getHelp").replace("%s", gkBranding.getBrandingKey("productName", true))}" />
				<button class="accessory-button" label="${aboutBundle.GetStringFromName("reportAnIssue")}" />
			</hbox>
			<html:p id="chrVersion" />
			<hbox id="chrUpdate">
				<html:div />
				<html:p>${aboutBundle.GetStringFromName("updateFailed")}</html:p>
			</hbox>
			<vbox id="chrCredits">
				<html:p>${fullName}</html:p>
				<html:p id="chrCopyright" />
				<html:p>${aboutBundle.GetStringFromName("madePossibleBy").replace("%s", fullName)}</html:p>
				<html:p>${aboutBundle.GetStringFromName("termsOfService").replace("%s", fullName)}</html:p>
			</vbox>
		</vbox>
		`
		aboutPaneCategoryElm.appendChild(MozXULElement.parseXULToFragment(aboutPaneCategoryContentDOM));

		document.addEventListener("click", () => {
			chrLogo.classList.remove("spin");
		})

		const chrLogo = document.getElementById("chrLogo");
		chrLogo.addEventListener("click", () => {
			setTimeout(() => {
				chrLogo.classList.add("spin");
			}, 0);
		})

		document.querySelector("#chrButtons > button:first-of-type").addEventListener("click", () => {
			location.href = 'https://support.google.com/chrome/?p=help&amp;ctx=settings';
		})
		document.querySelector("#chrButtons > button:last-of-type").addEventListener("click", () => {
			location.href = 'https://bugzilla.mozilla.org/home';
		})
		// #endregion
	}
}

function addProductName() {
	let sidebarHeader = document.getElementById("sidebarHeader");

	if (!sidebarHeader) {
		sidebarHeader = document.createElement("h1");
		sidebarHeader.id = "sidebarHeader";
	}
	sidebarHeader.textContent = gkBranding.getBrandingKey("productName", true);

	gkInsertElm.before(sidebarHeader, document.getElementById("categories"));
}

function updateInfo() {
	document.getElementById("chrVersion").textContent = aboutBundle.GetStringFromName("version").replace("%s", gkEras.getEras("main")[gkEras.getBrowserEra()].basedOnVersion);
	document.getElementById("chrCopyright").textContent = aboutBundle.GetStringFromName("copyright25").replace("%d", gkEras.getEras("main")[gkEras.getBrowserEra()].year);
}

document.addEventListener("DOMContentLoaded", () => {
	addProductName();

	const stickyContainer = document.querySelector(".sticky-container");
	const policesContainer = document.getElementById("policies-container");
	stickyContainer.appendChild(policesContainer);
	policesContainer.classList.remove("smaller-font-size");

	register_module("paneAbout", gAboutPane);

	waitForElm("#aboutCategory").then(() => {
		document.getElementById("aboutCategory-header").setAttribute("hidden", true);
		document.getElementById("aboutCategory").setAttribute("hidden", true);

		updateInfo();

		gotoPref(null, "hash");
	});
});

const appearanceObs = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			addProductName();
			updateInfo();
		}
	},
};
Services.prefs.addObserver("Geckium.appearance.choice", appearanceObs, false);
Services.prefs.addObserver("Geckium.main.overrideStyle", appearanceObs, false);
Services.prefs.addObserver("Geckium.main.style", appearanceObs, false);
Services.prefs.addObserver("Geckium.newTabHome.overrideStyle", appearanceObs, false);
Services.prefs.addObserver("Geckium.newTabHome.style", appearanceObs, false);
Services.prefs.addObserver("Geckium.branding.choice", appearanceObs, false);
Services.prefs.addObserver("Geckium.appearance.titlebarStyle", appearanceObs, false);