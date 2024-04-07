function windowTitle() {
	document.getElementById("window-title").textContent = document.documentElement.getAttribute("title");
}
document.addEventListener("DOMContentLoaded", windowTitle);



window.addEventListener('load', function() {
	restoreButtons.forEach(restoreButton => {

	})
});
maximizeButtons.forEach(maximizeButton => {
    maximizeButton.addEventListener("click", () => {
        
		restoreButtons.forEach(restoreButton => {
			
		})
    });
});
restoreButtons.forEach(restoreButton => {
    restoreButton.addEventListener("click", () => {
        
		maximizeButtons.forEach(maximizeButton => {
			
		})
    });
});