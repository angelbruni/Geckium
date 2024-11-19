function insertGlobalVisualStyles() {
	// Get the container element where you want to insert the HTML
	var container = document.getElementById("global-appearance-container");

	// Initialize the HTML string
	let chromeAppearanceCard = ``;

	// Change previews based on platform
	let platformsuffix = (function() {
		switch (AppConstants.platform) {
            case "macosx":
                return "mac";
            case "linux":
                return "linux";
            default: //Fallback to Windows
            if (isWindows10()) {
                return "win10"
            }
            return "win";
        }
	})();

	let eras = gkEras.getEras();
	for (const i of Object.keys(eras)) {
		// Construct the HTML for the button using template literals
		chromeAppearanceCard += `
		<html:button data-appearance="${i}"
				class="link chrome-appearance ripple-enabled" 
				for="chrome-${i}" 
				style="background-image: url('chrome://userchrome/content/windows/gsettings/imgs/main/chrome-${i}-${platformsuffix}.png');">
			<html:label class="wrapper" chrome="${i}">
				<div class="year">${eras[i].year}</div>
				<div class="identifier">
					<div class="radio-parent">
						<html:input data-appearance="${i}" class="radio" type="radio" name="global-visual-style" id="chrome-${i}"></html:input>
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

	document.querySelectorAll(`#global-appearance-container input[data-appearance]`).forEach(appearance => {
		appearance.addEventListener("click", function() {
			gkPrefUtils.set("Geckium.appearance.choice").int(appearance.dataset.appearance);
			if (gkPrefUtils.tryGet("Geckium.main.overrideStyle").bool == true || gkPrefUtils.tryGet("Geckium.newTabHome.overrideStyle").bool == true)
				document.querySelector(`[data-modal="overrides_modal"]`).classList.add('active');
		})
	})

	document.querySelector(`#global-appearance-container input[data-appearance="${gkEras.getEra("Geckium.appearance.choice")}"]`).checked = true;
}
document.addEventListener("DOMContentLoaded", insertGlobalVisualStyles);

function disableOverrides() {
	// document.querySelector('input[data-pref="Geckium.main.overrideStyle"]').checked = false;
	loadConditionalSettings("Geckium.main.overrideStyle");
	gkPrefUtils.set("Geckium.main.overrideStyle").bool(false);
	document.querySelector('input[data-pref="Geckium.newTabHome.overrideStyle"]').checked = false;
	loadConditionalSettings("Geckium.newTabHome.overrideStyle");
	gkPrefUtils.set("Geckium.newTabHome.overrideStyle").bool(false);
}