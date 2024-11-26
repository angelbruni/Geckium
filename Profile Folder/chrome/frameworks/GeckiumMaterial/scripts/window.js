class gkWindow {
	static windowContentContainerElm = document.getElementById("window-content-container");
	static windowContentElm = document.getElementById("window-content");
	
	static setTitle() {
		const titleElm = document.getElementById("window-title");

		if (titleElm)
			titleElm.textContent = document.documentElement.getAttribute("title");
	}

	static close() {
		document.getElementById("window").classList.add("closing");

		setTimeout(() => {
			window.close();
		}, 300);
	}
}

document.addEventListener("DOMContentLoaded", gkWindow.setTitle);

let closeButton = document.querySelector(".caption-button.close");
let maximizeButton = document.querySelector(".caption-button.maximize");
let restoreButton = document.querySelector(".caption-button.restore");
let minimizeButton = document.querySelector(".caption-button.minimize");

if (restoreButton)
	restoreButton.style.display = "none";

if (closeButton)
	closeButton.addEventListener("click", gkWindow.close);

if (maximizeButton) {
	maximizeButton.addEventListener("click", () => {
		maximizeButton.style.display = "none";
	
		restoreButton.style.display = "flex";
	});
}
if (restoreButton) {
	restoreButton.addEventListener("click", () => {
		restoreButton.style.display = "none";
	
		maximizeButton.style.display = "flex";
	});
}

if (minimizeButton) {
	minimizeButton.addEventListener("click", () => {
		window.minimize()
	});
}