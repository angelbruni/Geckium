function insertNTPVisualStyles() {
	// Get the container element where you want to insert the HTML
	var container = document.getElementById("ntp-visual-styles-grid");

	// Initialize the HTML string
	let chromeAppearanceCard = ``;

	for (var i = 0; i < 8; i++) {
		// Get the appearance details from the map
		var appearance = gkVisualStyles.getVisualStyles("page")[i];

		// Construct the HTML for the button using template literals
		chromeAppearanceCard += `
		<html:button data-appearance="${appearance.id}"
					class="link chrome-appearance ripple-enabled" 
					for="chrome-${appearance.int}" 
					style="background-image: url('chrome://userchrome/content/windows/gflags/imgs/ntp/chrome-${appearance.int}.png'); background-position: top center;">
			<html:label class="wrapper" chrome="${appearance.int}">
				<div class="year">${appearance.year[0]}</div>
				<div class="identifier">
					<div class="radio-parent">
						<html:input data-appearance="${appearance.id}" class="radio" type="radio" name="ntp-visual-style" id="chrome-${appearance.int}"></html:input>
						<div class="gutter" for="checked_check"></div>
						<html:label for="chrome-${appearance.int}" class="label">Chrome ${appearance.int}</html:label>
					</div>
				</div>
			</html:label>
		</html:button>
		`;
	}

	// Set the innerHTML of the container to the constructed HTML
	container.appendChild(MozXULElement.parseXULToFragment(chromeAppearanceCard))

	document.querySelector(`#ntp-visual-styles-grid input[data-appearance="${gkPrefUtils.tryGet("Geckium.newTabHome.style").int}"]`).checked = true;

	document.querySelectorAll(`#ntp-visual-styles-grid input[data-appearance]`).forEach(appearance => {
		appearance.addEventListener("click", function() {
			console.log(appearance.dataset.appearance)
			gkPrefUtils.set("Geckium.newTabHome.style").int(appearance.dataset.appearance);
		})
	})
}
document.addEventListener("DOMContentLoaded", insertNTPVisualStyles);