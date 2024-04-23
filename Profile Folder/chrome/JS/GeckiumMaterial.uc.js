// ==UserScript==
// @name        GeckiumMaterial - Temporary Functions
// @author      AngelBruni
// @loadorder   2
// @include     *
// ==/UserScript==

function openZoo() {
	const url = "about:gmzoo";

	if (pref("Geckium.gmWindow.newTab").tryGet.bool()) {
		openTrustedLinkIn(url, "tab")
	} else {
		for (let win of Services.wm.getEnumerator("geckiummaterial:zoo")) {
			if (win.closed)
				continue;
			else
				win.focus();
			return;
		}
		
		const gmWindow = window.openDialog(url, "", "centerscreen");
		gmWindow.onload = () => {
			gmWindow.document.documentElement.setAttribute("containertype", "window");
		}	
	}
}

function openGWizard() {
	const url = "about:gwizard";

	if (pref("Geckium.gmWindow.newTab").tryGet.bool()) {
		openTrustedLinkIn(url, "tab")
	} else {
		for (let win of Services.wm.getEnumerator("geckiummaterial:gflags")) {
			if (win.closed)
				continue;
			else
				win.focus();
			return;
		}
		
		const gmWindow = window.openDialog(url, "", "centerscreen");
		gmWindow.onload = () => {
			gmWindow.document.documentElement.setAttribute("containertype", "window");
		}
	}
}

function openGFlags() {
	const url = "about:gflags";

	if (pref("Geckium.gmWindow.newTab").tryGet.bool()) {
		openTrustedLinkIn(url, "tab")
	} else {
		for (let win of Services.wm.getEnumerator("geckiummaterial:gflags")) {
			if (win.closed)
				continue;
			else
				win.focus();
			return;
		}
		
		const gmWindow = window.openDialog(url, "", "centerscreen");
		gmWindow.onload = () => {
			gmWindow.document.documentElement.setAttribute("containertype", "window");
		}
	}
}