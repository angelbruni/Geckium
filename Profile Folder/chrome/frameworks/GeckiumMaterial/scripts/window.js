function windowTitle() {
	document.getElementById("window-title").textContent = document.documentElement.getAttribute("title");
}
document.addEventListener("DOMContentLoaded", windowTitle);

function windowClose() {
	document.getElementById("window").classList.add("closing");

	setTimeout(() => {
		window.close();
	}, 300);
}

let closeButton = document.querySelector(".caption-button.close");
let maximizeButton = document.querySelector(".caption-button.maximize");
let restoreButton = document.querySelector(".caption-button.restore");
let minimizeButton = document.querySelector(".caption-button.minimize");

window.addEventListener('load', function() {
	if (restoreButton)
		restoreButton.style.display = "none";
});

if (closeButton) {
	closeButton.addEventListener("click", () => {
		windowClose();
	});
}

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
		window.minimize();
	});
}