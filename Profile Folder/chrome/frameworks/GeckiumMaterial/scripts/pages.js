function skipToPage(pageContainer, targetPage) {
	if (pageContainer !== undefined && targetPage !== undefined) {
		// Button
		const pageBtns = document.querySelectorAll("button[data-page-container='" + pageContainer + "'");

		pageBtns.forEach(selectedBtn => {
			selectedBtn.removeAttribute("selected");
		})

		const pageBtn = document.querySelector("button[data-page-container='" + pageContainer + "'][data-page='"+ targetPage +"']");
		pageBtn.setAttribute("selected", true);

		// Page
		const page = document.querySelector("[data-page-container='" + pageContainer + "'] vbox[data-page='" + targetPage +"']");
		const pageList = page.parentNode.querySelectorAll("vbox[data-page]");

		pageList.forEach(pages => {
			pages.removeAttribute("selected")
		});
		page.setAttribute("selected", true);

		const pageTitle = document.querySelector("#page-title[data-page-container='" + pageContainer + "']");
		if (pageTitle) {
			if (pageBtn.dataset.pageTitle)
				pageTitle.textContent = pageBtn.dataset.pageTitle;
			else
				pageTitle.textContent = pageBtn.getAttribute("label");
		}

		// Additional Logic for Tabs
		if (pageBtn.classList.contains("tab")) {
			// Indicator
			const indicator = pageBtn.parentNode.querySelector(".indicator");
			const pageBtnRect = pageBtn.getBoundingClientRect()

			indicator.style.left = pageBtnRect.x - pageBtn.parentNode.getBoundingClientRect().x + "px";
			indicator.style.width = pageBtnRect.width + "px";

			// Page
			const pagesContainer = page.parentNode;
			pagesContainer.style.transform = "translateX(calc(-100% * " + targetPage + "))";
		}
	}
}

document.addEventListener("DOMContentLoaded", () => {
	document.querySelectorAll("button[data-page-container]").forEach(item => {
		item.addEventListener("click", () => {
			skipToPage(item.dataset.pageContainer, item.dataset.page);
		})
	})
});