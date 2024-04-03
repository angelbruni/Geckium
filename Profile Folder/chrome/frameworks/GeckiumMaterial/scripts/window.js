function topBarText() {
	document.querySelector("#window-top-bar > h3").textContent = docElm.getAttribute("title");
}

document.addEventListener("DOMContentLoaded", topBarText);