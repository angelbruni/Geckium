// ==UserScript==
// @name        GeckiumMaterial - Temporary Functions
// @author      AngelBruni
// @loadorder   2
// @include     *
// ==/UserScript==

function openZoo() {
	const gmZoo = window.openDialog("about:gmzoo", "", "centerscreen");

	gmZoo.onload = () => {
		gmZoo.document.documentElement.setAttribute("containertype", "window");
	}
}

function openGFlags() {
	const gFlags = window.openDialog("about:gflags", "", "centerscreen");

	gFlags.onload = () => {
		gFlags.document.documentElement.setAttribute("containertype", "window");
	}
}