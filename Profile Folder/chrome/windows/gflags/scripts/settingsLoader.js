function loadSelectorSetting() {
	document.querySelectorAll("button.menu[data-pref]").forEach(selector => {
		let current;

		const checkInt = selector.querySelector(".list .item");
		if (Number.isInteger(parseInt(checkInt.getAttribute("value"))))
			current = pref(`Geckium.${selector.dataset.pref}`).tryGet.int();
		else
			current = pref(`Geckium.${selector.dataset.pref}`).tryGet.string();

		selector.setValue(current);

		selector.querySelectorAll(".list .item").forEach(item => {
			item.addEventListener("click", () => {
				if (Number.isInteger(parseInt(item.getAttribute("value"))))
					pref(`Geckium.${selector.dataset.pref}`).set.int(parseInt(item.getAttribute("value")));
				else
					pref(`Geckium.${selector.dataset.pref}`).set.string(`${item.getAttribute("value")}`);
			})
		})
	})
}
document.addEventListener("DOMContentLoaded", loadSelectorSetting);

function loadTextFieldSetting() {
	document.querySelectorAll('input[type="text"][data-pref]').forEach(input => {
		input.value = pref(`Geckium.${input.dataset.pref}`).tryGet.string()

		input.addEventListener("input", () => {
			pref(`Geckium.${input.dataset.pref}`).set.string(input.value);
		})
	})
}
document.addEventListener("DOMContentLoaded", loadTextFieldSetting);

function loadSwitchSetting() {
	document.querySelectorAll('input.switch[data-pref]').forEach(input => {
		input.checked = pref(`${input.dataset.pref}`).tryGet.bool();

		input.addEventListener("input", () => {
			pref(`${input.dataset.pref}`).set.bool(input.checked);
		})
	})
}
document.addEventListener("DOMContentLoaded", loadSwitchSetting);