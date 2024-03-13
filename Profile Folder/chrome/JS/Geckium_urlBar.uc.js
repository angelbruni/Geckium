// ==UserScript==
// @name        Geckium - URL bar
// @author		AngelBruni
// @loadorder   3
// ==/UserScript==

function moveFavouritesButton() {
	const urlbarContainer = document.getElementById("urlbar-container");
	const starButtonBox = document.getElementById("star-button-box");
	const remoteControlBox = document.getElementById("remote-control-box");
	const pageActionButton = document.getElementById("pageActionButton");

	if (pref(prefMap.appearance).tryGet.int() == 0) {
		urlbarContainer.setAttribute("starpos", "start");
		insertBefore(starButtonBox, remoteControlBox);
	} else {
		urlbarContainer.setAttribute("starpos", "end");
		insertAfter(starButtonBox, pageActionButton);
	}
}
window.addEventListener("appearanceChanged", moveFavouritesButton);