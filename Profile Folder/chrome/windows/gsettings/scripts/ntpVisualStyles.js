function insertNTPVisualStyles() {
	// Get the container element where you want to insert the HTML
	var container = document.getElementById("ntp-visual-styles-grid");

	// Initialize the HTML string
	let chromeAppearanceCard = ``;

	let eras = gkEras.getEras("page");
	for (const i of Object.keys(eras)) {
		// Construct the HTML for the button using template literals
		chromeAppearanceCard += `
		<html:button data-appearance="${i}"
				class="link chrome-appearance ripple-enabled" 
				for="chrome-${i}" 
				style="background-image: url('chrome://userchrome/content/windows/gsettings/imgs/ntp/chrome-${i}.png'); background-position: top center;">
			<html:label class="wrapper" chrome="${i}">
				<div class="year">${eras[i].year}</div>
				<div class="identifier">
					<div class="radio-parent">
						<html:input data-appearance="${i}" class="radio" type="radio" name="ntp-visual-style" id="chrome-${i}"></html:input>
						<div class="gutter" for="checked_check"></div>
						<html:label for="chrome-${i}" class="label">Chrome ${eras[i].name}</html:label>
					</div>
				</div>
			</html:label>
		</html:button>
		`;
	}

	// Set the innerHTML of the container to the constructed HTML
	container.appendChild(MozXULElement.parseXULToFragment(chromeAppearanceCard))
	
	document.querySelectorAll(`#ntp-visual-styles-grid input[data-appearance]`).forEach(appearance => {
		appearance.addEventListener("click", function() {
			gkPrefUtils.set("Geckium.newTabHome.style").int(appearance.dataset.appearance);
		})
	})
	
	document.querySelector(`#ntp-visual-styles-grid input[data-appearance="${gkEras.getEra("Geckium.newTabHome.style")}"]`).checked = true;
}
document.addEventListener("DOMContentLoaded", insertNTPVisualStyles);