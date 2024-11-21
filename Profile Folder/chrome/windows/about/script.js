function createMainLayout() {
	const fullName = gkBranding.getBrandingKey("fullName");

	document.documentElement.setAttribute("title", aboutBundle.GetStringFromName("windowTitle").replace("%s", fullName));

	let appearanceChoice = gkEras.getBrowserEra();

	if (appearanceChoice <= 3)
		window.resizeTo(490 + (window.outerWidth - window.innerWidth), 266 + (window.outerHeight - window.innerHeight));
	else if (appearanceChoice <= 17)
		window.resizeTo(516 + (window.outerWidth - window.innerWidth), 266 + (window.outerHeight - window.innerHeight));
	else
		window.resizeTo(576 + (window.outerWidth - window.innerWidth), 307 + (window.outerHeight - window.innerHeight));

	let main = `
	<vbox id="main">
		<vbox id="banner">
			<hbox>
				<vbox style="color: black;">
					<html:h1>${fullName}</html:h1>
					<html:p>${gkEras.getEras("main")[appearanceChoice].basedOnVersion}</html:p>
				</vbox>
			</hbox>
		</vbox>
		<vbox>
			<html:p>${aboutBundle.GetStringFromName("copyright").replace("%s", gkBranding.getBrandingKey("vendorName")).replace("%d", gkEras.getEras("main")[appearanceChoice].year)}</html:p>
			<html:p>${aboutBundle.GetStringFromName("madePossibleBy").replace("%s", fullName)}</html:p>
		</vbox>
		<vbox>
			<html:p>${aboutBundle.GetStringFromName("termsOfService").replace("%s", fullName)}</html:p>
		</vbox>
		<vbox id="updateCheckFailed">
			<html:p>${aboutBundle.GetStringFromName("updateCheckFailed")}</html:p>
		</vbox>
		<footer>
			<image src="chrome://windows/content/about/assets/chrome-1/imgs/IDR_UPDATE_FAIL.png" />
			<html:p>${aboutBundle.GetStringFromName("serverNotAvailable")}</html:p>
			<spacer />
			<html:button onclick="window.close();">${dialogBundle.GetStringFromName("ok")}</html:button>
		</footer>
	</vbox>
	`;

	// Create contents
	const container = document.getElementById("main-container");
	container.innerHTML = ``;
	container.appendChild(MozXULElement.parseXULToFragment(main));
}