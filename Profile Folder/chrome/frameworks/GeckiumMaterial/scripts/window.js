function windowTitle() {
	document.getElementById("window-title").textContent = document.documentElement.getAttribute("title");
}
document.addEventListener("DOMContentLoaded", windowTitle);

let maximizeButtons = document.querySelectorAll(".maximize");
let restoreButtons = document.querySelectorAll(".restore");

window.addEventListener('load', function() {
	restoreButtons.forEach(restoreButton => {
		restoreButton.style.display = "none";
	})
});

maximizeButtons.forEach(maximizeButton => {
    maximizeButton.addEventListener("click", () => {
        maximizeButton.style.display = "none";
		restoreButtons.forEach(restoreButton => {
			restoreButton.style.display = "flex";
		})
    });
});
restoreButtons.forEach(restoreButton => {
    restoreButton.addEventListener("click", () => {
        restoreButton.style.display = "none";
		maximizeButtons.forEach(maximizeButton => {
			maximizeButton.style.display = "flex";
		})
    });
});