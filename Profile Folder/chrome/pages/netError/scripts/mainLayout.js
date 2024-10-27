function createMainLayout() {
	let appearanceChoice = gkEras.getNTPEra();

	let main = ``;

	let suggestions = [];

	if (appearanceChoice == 1) {
		main = `
		<html:h1></html:h1>
		<html:div id="errorSummary">
			<html:p></html:p>
		</html:div>
		<vbox>
			<html:h2 id="suggestionsHeading"></html:h2>
			<ul />
		</vbox>
		<html:a href="javascript:void(0)" style="text-decoration: none" onclick="toggleVBox("zipInfo")" />
		<vbox>
			<html:p id="detailsHeading" />
			<html:div id="details" />
		</vbox>
		`
	}
}

createMainLayout();