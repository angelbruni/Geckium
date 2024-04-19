function loadSelectorSetting() {
	document.querySelectorAll("button.menu[data-pref]").forEach(selector => {
		selector.setValue(pref(`Geckium.${selector.dataset.pref}`).tryGet.string());

		selector.querySelectorAll(".list .item").forEach(item => {
			
			item.addEventListener("click", () => {
				pref(`Geckium.${selector.dataset.pref}`).set.string(`${item.getAttribute("value")}`)
			})
		})
	})
}
document.addEventListener("DOMContentLoaded", loadSelectorSetting);