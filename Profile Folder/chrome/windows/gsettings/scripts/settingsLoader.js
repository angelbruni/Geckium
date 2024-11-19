const { gkUpdater } = ChromeUtils.importESModule("chrome://modules/content/GeckiumUpdater.sys.mjs");

function loadSelectorSetting() {
	setTimeout(() => {
		document.querySelectorAll("button.menu[data-pref]").forEach(selector => {
			let current;
	
			const checkInt = selector.querySelector(".list .item");
			if (Number.isInteger(parseInt(checkInt.getAttribute("value"))))
				current = gkPrefUtils.tryGet(selector.dataset.pref).int;
			else
				current = gkPrefUtils.tryGet(selector.dataset.pref).string;
	
			selector.setValue(current);
			showConditionalSelChild(selector.dataset.pref, current);
	
			selector.querySelectorAll(".list .item").forEach(item => {
				item.addEventListener("click", () => {
					if (Number.isInteger(parseInt(item.getAttribute("value"))))
						gkPrefUtils.set(selector.dataset.pref).int(parseInt(item.getAttribute("value")));
					else
						gkPrefUtils.set(selector.dataset.pref).string(`${item.getAttribute("value")}`);
					
					showConditionalSelChild(selector.dataset.pref, item.getAttribute("value"));
				})
			})
		})
	}, 10);
}
function showConditionalSelChild(pref, value) {
	var child = document.querySelector(`input[data-parent-pref="${pref}"]`);
	if (child) {
		if (child.dataset.requiresValue == value)
			child.style.removeProperty("display");
		else
			child.style.setProperty("display", "none");
	}
}
document.addEventListener("DOMContentLoaded", loadSelectorSetting);

function loadTextFieldSetting() {
	setTimeout(() => {
		document.querySelectorAll('input[type="text"][data-pref]').forEach(input => {
			input.value = gkPrefUtils.tryGet(input.dataset.pref).string;
	
			input.addEventListener("input", () => {
				gkPrefUtils.set(input.dataset.pref).string(input.value);
			})
		})
	}, 10);
}
document.addEventListener("DOMContentLoaded", loadTextFieldSetting);

function loadColorSetting() {
	setTimeout(() => {
		document.querySelectorAll('input[type="color"][data-pref]').forEach(input => {
			input.value = gkPrefUtils.tryGet(input.dataset.pref).string;
	
			input.addEventListener("change", () => {
				gkPrefUtils.set(input.dataset.pref).string(input.value);
			})
		})
	}, 10);
}
document.addEventListener("DOMContentLoaded", loadColorSetting);

function loadSwitchSetting() {
	setTimeout(() => {
		document.querySelectorAll('input.switch[data-pref]').forEach(input => {
			input.checked = gkPrefUtils.tryGet(input.dataset.pref).bool;
	
			input.addEventListener("input", () => {
				gkPrefUtils.set(input.dataset.pref).bool(input.checked);
			})
		})
	}, 10);
}
document.addEventListener("DOMContentLoaded", loadSwitchSetting);

function loadVersion() {
	document.querySelectorAll(".version-identifier").forEach(async identifier => {
		identifier.textContent = await gkUpdater.getVersion();
	})
}
document.addEventListener("DOMContentLoaded", loadVersion);

function loadConditionalSettings(setting) {
	let gkswitch;
	// FIXME: Once the switches spy on settings changes, change this to look for settings changes via custom observers or something
	if (setting)
		conditionalitems = document.querySelectorAll(`[data-switchreq="${setting}"]`);
	else
		conditionalitems = document.querySelectorAll('[data-switchreq]');

	conditionalitems.forEach(item => {
		gkswitch = document.querySelector(`input.switch[data-pref="${item.dataset.switchreq}"]`)
		if (gkswitch.checked == true)
			item.removeAttribute("disabled");
		else
			item.setAttribute("disabled", true);

		if (!setting) {
			// Add toggle event to re-trigger the check for only this switch's setting
			gkswitch.addEventListener("input", () => {
				loadConditionalSettings(item.dataset.switchreq);
			})
		}
	})
}
document.addEventListener("DOMContentLoaded", () => loadConditionalSettings());