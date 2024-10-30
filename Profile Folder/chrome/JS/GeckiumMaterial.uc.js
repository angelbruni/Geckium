// ==UserScript==
// @name        GeckiumMaterial - Temporary Functions
// @author      AngelBruni
// @loadorder   2
// @include     *
// ==/UserScript==

function openZoo() {
	const url = "about:gmzoo";

	if (gkPrefUtils.tryGet("Geckium.gmWindow.newTab").bool) {
		openTrustedLinkIn(url, "tab")
	} else {
		for (let win of Services.wm.getEnumerator("geckiummaterial:zoo")) {
			if (win.closed)
				continue;
			else
				win.focus();
			return;
		}
		
		const gmWindow = window.openDialog(url, "", "centerscreen,resizable=no");
	}
}

function openGSplash() {
	const url = "about:gsplash";

	for (let win of Services.wm.getEnumerator("geckiummaterial:gsplash")) {
		if (win.closed)
			continue;
		else
			win.focus();
		return;
	}
	
	const gmWindow = window.openDialog(url, "", "centerscreen,resizable=no");
	gmWindow.onload = () => {
		gmWindow.document.documentElement.setAttribute("containertype", "window");
		if (gkPrefUtils.tryGet("Geckium.firstRun.wasSilverfox").bool == true) {
			gmWindow.document.documentElement.setAttribute("silverfox", "true");
		}
	}
}

function openGWizard() {
	const url = "about:gwizard";

	for (let win of Services.wm.getEnumerator("geckiummaterial:gwizard")) {
		if (win.closed)
			continue;
		else
			win.focus();
		return;
	}
	
	const gmWindow = window.open(url, "", "chrome,centerscreen,resizable=no");
	gmWindow.onload = () => {
		gmWindow.document.documentElement.setAttribute("containertype", "window");
	}
}

function openGSettings(mode) {
	const url = "about:gsettings";

	if (gkPrefUtils.tryGet("Geckium.gmWindow.newTab").bool && mode !== "wizard") {
		openTrustedLinkIn(url, "tab")
	} else {
		for (let win of Services.wm.getEnumerator("geckiummaterial:gsettings")) {
			if (win.closed)
				continue;
			else
				win.focus();
			return;
		}
		
		const gmWindow = window.open(url, "", "chrome,centerscreen,resizable=yes");
		gmWindow.onload = () => {
			if (mode)
				gmWindow.document.documentElement.setAttribute("contentmode", mode);
		}
	}
}

function openAbout() {
	const gmBundle = Services.strings.createBundle("chrome://geckium/locale/properties/gm.properties");

	switch (gkPrefUtils.tryGet("Geckium.about.mode").int) {
		case 1:
			openAboutDialog();
			break;
		case 2:
			if (gkEras.getBrowserEra() <= 21)
				window.openDialog("about:aboutdialog", "", "centerscreen");
			else
				openTrustedLinkIn("about:preferences#about", "tab");
			break;
	
		default:
			const dialogChoice = Services.prompt.confirm(
				window,
				gmBundle.GetStringFromName("firstTimeAboutTitle"),
				gmBundle.GetStringFromName("firstTimeAboutText")
					.replace("{{brandingName}}", gkBranding.getBrandingKey("fullName", false))
					.replaceAll("{{browserName}}", AppConstants.MOZ_APP_NAME.charAt(0).toUpperCase() + AppConstants.MOZ_APP_NAME.slice(1))
			);
			if (dialogChoice)
				gkPrefUtils.set("Geckium.about.mode").int(2)
			else
				gkPrefUtils.set("Geckium.about.mode").int(1)
			openAbout();
			break;
	}
}