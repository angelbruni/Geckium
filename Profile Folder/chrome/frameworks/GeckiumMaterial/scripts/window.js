function windowTitle() {
	document.getElementById("window-title").textContent = docElm.getAttribute("title");
}

document.addEventListener("DOMContentLoaded", windowTitle);