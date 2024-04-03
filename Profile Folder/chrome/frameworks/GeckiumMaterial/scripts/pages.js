function setupPages() {
	if (!document.querySelector(".page[selected]")) {
		document.querySelector(".page").setAttribute("selected", true);
		document.querySelector("#navigation-drawer .item").setAttribute("selected", true);
	}

	document.querySelectorAll("#navigation-drawer .item").forEach(item => {
		item.addEventListener("click", () => {
			const previouslySelectedItem = document.querySelector('#navigation-drawer .item[selected="true"]');

			previouslySelectedItem.removeAttribute("selected");
			item.setAttribute("selected", true);

			const previouslySelectedPage = document.querySelector('.pages-container .page[selected="true"]');
			previouslySelectedPage.removeAttribute("selected")
			document.querySelector(".pages-container .page[data-page='" + item.dataset.page +"'").setAttribute("selected", true);
		})
	})
}
document.addEventListener("DOMContentLoaded", setupPages);