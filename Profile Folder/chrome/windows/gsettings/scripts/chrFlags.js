const { chrFlags } = ChromeUtils.importESModule("chrome://modules/content/GeckiumChromiumFlags.sys.mjs");

function populateFlags() {
	const flags = Object.values(chrFlags.getFlagsList());

	flags.forEach((flag, index) => {
		const isMultipleChoice = flag.hasOwnProperty("values");

		console.log(flag, isMultipleChoice);

		const flagName = Object.keys(chrFlags.getFlagsList())[index];

		let flagItem = `
		<hbox class="item" data-pref="${flagName}">
			<vbox>
				<label class="name"><div class="year">Chrome ${Object.values(gkVisualStyles.getVisualStyles()).find(item => item.id === flag.styleints[0]).int}</div>${flag.name}</label>
				<label class="description">${flag.description}</label>
			</vbox>
			<spacer />
		</hbox>
		`
		
		document.querySelector("#flags-container").appendChild(MozXULElement.parseXULToFragment(flagItem));

		let flagSetting;
		if (isMultipleChoice) {
			flagSetting = `
			<html:button class="menu" data-name="test-style" data-pref="chrflag.${flagName.replace(/-/g, ".")}" id="test-style-select" style="width: 100%">
				<label class="placeholder" />
				<label class="selected" />
				<vbox class="list">
					
				</vbox>
			</html:button>
			`

			document.querySelector(`#flags-container .item[data-pref="${flagName}"]`).style.flexDirection = "column";
			document.querySelector(`#flags-container .item[data-pref="${flagName}"]`).style.alignItems = "start";
			document.querySelector(`#flags-container .item[data-pref="${flagName}"]`).style.paddingBlockEnd = "15px";
		} else {
			flagSetting = `
			<div class="switch-parent">
				<html:input class="switch" data-pref="Geckium.chrflag.${flagName.replace(/-/g, ".")}" type="checkbox" id="auto_switch" name="test" />
				<html:label class="gutter" for="auto_switch" />
			</div>
			`
		}

		document.querySelector(`#flags-container .item[data-pref="${flagName}"]`).appendChild(MozXULElement.parseXULToFragment(flagSetting));

		let flagOption;
		if (isMultipleChoice) {
			Object.values(flag.values).forEach((value, index) => {
				console.log(index, value);

				flagOption = `
				<hbox class="item ripple-enabled" value="${index}">${value}</hbox>
				`

				document.querySelector(`#flags-container .item[data-pref="${flagName}"] .menu .list`).appendChild(MozXULElement.parseXULToFragment(flagOption));
			})
			
		}
	});
}
document.addEventListener("DOMContentLoaded", populateFlags);