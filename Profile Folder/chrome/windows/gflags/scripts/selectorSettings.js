function loadSelectorSetting() {
	document.querySelectorAll("button.menu[data-pref]").forEach(selector => {
		selector.setValue(pref(`Geckium.${selector.dataset.pref}`).tryGet.string());

		selector.querySelectorAll(".list .item").forEach(item => {
			
			item.addEventListener("click", () => {
				console.log("trying to set")
				pref(`Geckium.${selector.dataset.pref}`).set.string(`${item.getAttribute("value")}`)
			})
		})

		console.log(selector, selector.dataset.pref)
	})
}
document.addEventListener("DOMContentLoaded", loadSelectorSetting);