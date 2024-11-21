const { chrFlags } = ChromeUtils.importESModule("chrome://modules/content/GeckiumChromiumFlags.sys.mjs");

function populateFlags() {
	const flags = Object.values(chrFlags.getFlagsList());

	flags.forEach((flag, index) => {
		const isMultipleChoice = flag.hasOwnProperty("values");

		const flagName = Object.keys(chrFlags.getFlagsList())[index];

		var flagDuration = `Chrome ${gkEras.getEras("main")[flag.styleints[0]].name}`;
		var flagEnd = gkEras.getEras("main")[flag.styleints[flag.styleints.length - 1]].name;
		if (gkEras.getEras("main")[flag.styleints[0]].name != flagEnd)
			flagDuration = `${flagDuration} - ${flagEnd}`;

		let flagItem = `
		<hbox class="item" data-pref="Geckium.chrflag.${flagName}">
			<vbox>
				<label class="name"><div class="year">${flagDuration}</div>${flag.name}</label>
				<label class="description">${flag.description}</label>
			</vbox>
			<spacer />
		</hbox>
		`
		
		document.querySelector("#flags-container").appendChild(MozXULElement.parseXULToFragment(flagItem));

		let flagSetting;
		if (isMultipleChoice) {
			flagSetting = `
			<html:button class="menu" data-name="test-style" data-pref="Geckium.chrflag.${flagName.replace(/-/g, ".")}" id="test-style-select" style="width: 100%">
				<label class="placeholder" />
				<label class="selected" />
				<vbox class="list" />
			</html:button>
			`

			document.querySelector(`#flags-container .item[data-pref="Geckium.chrflag.${flagName}"]`).style.alignItems = "start";
		} else {
			flagSetting = `
			<div class="switch-parent">
				<html:input class="switch" data-pref="Geckium.chrflag.${flagName.replace(/-/g, ".")}" type="checkbox" id="auto_switch" name="test" />
				<html:label class="gutter" for="auto_switch" />
			</div>
			`
		}

		document.querySelector(`#flags-container .item[data-pref="Geckium.chrflag.${flagName}"]`).appendChild(MozXULElement.parseXULToFragment(flagSetting));

		let flagOption;
		if (isMultipleChoice) {
			Object.values(flag.values).forEach((value, index) => {
				flagOption = `
				<hbox class="item ripple-enabled" value="${index}">${value}</hbox>
				`

				document.querySelector(`#flags-container .item[data-pref="Geckium.chrflag.${flagName}"] .menu .list`).appendChild(MozXULElement.parseXULToFragment(flagOption));
			})
			
		}
	});
}
document.addEventListener("DOMContentLoaded", populateFlags);