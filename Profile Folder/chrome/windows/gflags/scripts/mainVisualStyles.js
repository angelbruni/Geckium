function insertGlobalVisualStyles() {
	// Get the container element where you want to insert the HTML
	var container = document.getElementById("main-appearance-container");

	// Initialize the HTML string
	let chromeAppearanceCard = ``;

	for (var i = 0; i < 8; i++) {
		// Get the appearance details from the map
		var appearance = gkVisualStyles.getVisualStyles("chrome")[i];

		// Construct the HTML for the button using template literals
		chromeAppearanceCard += `
		<html:button data-appearance="${appearance.id}"
					class="link chrome-appearance ripple-enabled" 
					for="chrome-${appearance.int}" 
					style="background-image: url('chrome://userchrome/content/windows/gflags/imgs/main/chrome-${appearance.int}.png');">
			<html:label class="wrapper" chrome="${appearance.int}">
				<div class="year">${appearance.year[0]}</div>
				<div class="identifier">
					<div class="radio-parent">
						<html:input data-appearance="${appearance.id}" class="radio" type="radio" name="main-visual-style" id="chrome-${appearance.int}"></html:input>
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

	document.querySelectorAll(`#main-appearance-container input[data-appearance]`).forEach(appearance => {
		appearance.addEventListener("click", function() {
			gkPrefUtils.set("Geckium.main.style").int(appearance.dataset.appearance);
		})
	})

	document.querySelector(`#main-appearance-container input[data-appearance="${gkPrefUtils.tryGet("Geckium.main.style").int}"]`).checked = true;
}
document.addEventListener("DOMContentLoaded", insertGlobalVisualStyles);