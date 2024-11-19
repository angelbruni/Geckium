// Set the number of clicks required
const clicksRequired = 7;
const clickTimerAmount = 2000;
    
let clickCount = 0;
let clickTimer;

function developerOptionsEnable() {
	if (!gkPrefUtils.tryGet("Geckium.devOptions.status").bool) {
		// Increment click count
		clickCount++;
		
		// If the click count reaches the required number, enable developer options
		if (clickCount === clicksRequired) {
			gkPrefUtils.set("Geckium.devOptions.status").bool(true);

			document.getElementById("ndi-do").style.display = null;
			
			// Reset click count
			clickCount = 0;
		}

		// Clear the previous timer
		clearTimeout(clickTimer);
		
		// Set a new timer to reset the click count after a delay
		clickTimer = setTimeout(() => {
			clickCount = 0;
		}, clickTimerAmount);
	}
}

// Add click event listener to #gk_version element
document.getElementById("gk_version").addEventListener("click", developerOptionsEnable)

document.addEventListener("DOMContentLoaded", () => {
	if (gkPrefUtils.tryGet("Geckium.devOptions.status").bool) {
		document.getElementById("ndi-do").style.display = null;
	}
})