function createMainLayout() {
	let appearanceChoice;
	switch (gkPrefUtils.tryGet("Geckium.main.overrideStyle").bool) {
		case true:
			appearanceChoice = gkPrefUtils.tryGet("Geckium.main.style").int;
			break;
		default:
			appearanceChoice = gkPrefUtils.tryGet("Geckium.appearance.choice").int;
			break;
	}

	if (appearanceChoice <= 1)
		window.resizeTo(490 + (window.outerWidth - window.innerWidth), 266 + (window.outerHeight - window.innerHeight));
	else if (appearanceChoice <= 5)
		window.resizeTo(516 + (window.outerWidth - window.innerWidth), 266 + (window.outerHeight - window.innerHeight));
	else
		window.resizeTo(576 + (window.outerWidth - window.innerWidth), 307 + (window.outerHeight - window.innerHeight));

	let main = `
	<vbox id="main">
		<vbox id="banner">
			<hbox>
				<vbox>
					<html:h1>Google Chrome</html:h1>
					<html:p>${gkVisualStyles.getVisualStyles("main").find(item => item.id === appearanceChoice).basedOnVersion}</html:p>
				</vbox>
			</hbox>
		</vbox>
		<vbox>
			<html:p>${aboutBundle.GetStringFromName("copyright").replace("%d", gkVisualStyles.getVisualStyles("main").find(item => item.id === appearanceChoice).year[0])}</html:p>
			<html:p>${aboutBundle.GetStringFromName("madePossibleBy")}</html:p>
		</vbox>
		<vbox>
			<html:p>${aboutBundle.GetStringFromName("termsOfService")}</html:p>
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