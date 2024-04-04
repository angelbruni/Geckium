function setupPages() {
	document.querySelectorAll("button[data-page-container]").forEach(item => {
		const pageTitle = document.querySelector('#page-title[data-page-container="' + item.dataset.pageContainer + '"]');

		if (item.hasAttribute("selected") && item.parentNode.querySelector(".indicator")) {
			item.parentNode.querySelector(".indicator").style.left = item.getBoundingClientRect().x - item.parentNode.getBoundingClientRect().x + "px";
			item.parentNode.querySelector(".indicator").style.width = item.getBoundingClientRect().width + "px";
		}
		
		if (pageTitle)
			pageTitle.textContent = document.querySelector('button[selected="true"][data-page-container="' + item.dataset.pageContainer + '"]').getAttribute("label");
			
		item.addEventListener("click", () => {
			const previouslySelectedItem = document.querySelector('button[selected="true"][data-page-container="' + item.dataset.pageContainer + '"]');
			const previouslySelectedPage = document.querySelector('[data-page-container="' + item.dataset.pageContainer + '"] > [selected="true"][data-page]');

			if (previouslySelectedItem && previouslySelectedPage) {
				previouslySelectedItem.removeAttribute("selected");
				previouslySelectedPage.removeAttribute("selected");
			}
			
			item.setAttribute("selected", true);

			const pageTitle = document.querySelector('#page-title[data-page-container="' + item.dataset.pageContainer + '"]');
			
			if (pageTitle)
				pageTitle.textContent = document.querySelector('button[selected="true"][data-page-container="' + item.dataset.pageContainer + '"]').getAttribute("label");

			document.querySelector('[data-page-container="' + item.dataset.pageContainer + '"] > [data-page="' + item.dataset.page +'"').setAttribute("selected", true);

			if (item.parentNode.classList.contains("tabs")) {
				const indicator = item.parentNode.querySelector(".indicator");

				const itemParent = item.parentNode;
				const itemParentX = itemParent.getBoundingClientRect().x;

				const itemX = item.getBoundingClientRect().x;
				const itemWidth = item.getBoundingClientRect().width;

				document.querySelector('.content[data-page-container="' + item.dataset.pageContainer + '"]').style.transform = "translateX(calc(-100% * " + item.dataset.page + "))";
				indicator.style.left = itemX - itemParentX + "px";
				indicator.style.width = itemWidth + "px";
			}
		})
	})
}
document.addEventListener("DOMContentLoaded", setupPages);