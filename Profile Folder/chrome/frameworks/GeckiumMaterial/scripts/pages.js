class gmPages {
	static pageChanged = new CustomEvent("pageChanged");

	static getCurrentPage(pageContainer) {
		try {
			return document.querySelector(`.pages-container[data-page-container="${pageContainer}"] .page[selected="true"]`).dataset.page
		} catch (e) {
			return null
		}
	}

	static skipToPage(pageContainer, targetPage) {
		if (pageContainer !== undefined && targetPage !== undefined) {
			const previousPage = this.getCurrentPage(pageContainer);

			// Button
			const pageBtns = document.querySelectorAll(`button[data-page-container="${pageContainer}"`);
	
			pageBtns.forEach(selectedBtn => {
				selectedBtn.removeAttribute("selected");
			})
	
			const pageBtn = document.querySelector(`button[data-page-container="${pageContainer}"][data-page="${targetPage}"]`);
			if (pageBtn)
				pageBtn.setAttribute("selected", true);
	
			// Page
			const page = document.querySelector(`.pages-container[data-page-container="${pageContainer}"] vbox[data-page="${targetPage}"]`);
			
			const pageList = page.parentNode.querySelectorAll("vbox[data-page]");
			if (pageList) {
				pageList.forEach(pages => {
					pages.removeAttribute("selected");

					if (pages.querySelector(".content-container"))
						pages.querySelector(".content-container").scrollTo({top: 0, behavior: 'smooth'}); // Smoothly reset scrolling.
				});
			}
			page.setAttribute("selected", true);

			// Only send `pageChanged` event if the page that we skipped to is not the same as the previous page.
			if (previousPage !== this.getCurrentPage(pageContainer))
				document.dispatchEvent(this.pageChanged);
	
			const pageTitle = document.querySelector(`#page-title[data-page-container="${pageContainer}"]`);
			if (pageTitle) {
				if (pageBtn) {
					if (pageBtn.dataset.pageTitle)
						pageTitle.textContent = pageBtn.dataset.pageTitle;
					else
						pageTitle.textContent = pageBtn.getAttribute("label");
				}
			}
	
			// Additional Logic for Tabs
			if (pageBtn) {
				if (pageBtn.classList.contains("tab")) {
					// Indicator
					const indicator = pageBtn.parentNode.querySelector(".indicator");
					const pageBtnRect = pageBtn.getBoundingClientRect()
		
					indicator.style.left = `${pageBtnRect.x} - ${pageBtn.parentNode.getBoundingClientRect().x}px`;
					indicator.style.width = `${pageBtnRect.width}px`;
		
					// Page
					const pagesContainer = page.parentNode;
					pagesContainer.style.transform = `translateX(calc(-100% * ${targetPage}))`;
				}
			}
		}
	}

	static setCurrentStep() {
		const currentPage = document.querySelector('.pages-container > .page[selected="true"]').dataset.page;
	
		if (document.querySelector(".stepper")) {
			document.querySelectorAll(`.step.active`).forEach(step => {
				step.classList.add("done");
			})
			
			document.querySelector(`.step[data-page="${currentPage}"]`).classList.add("active");
			document.querySelector(`.step[data-page="${currentPage}"]`).classList.remove("done");
			document.querySelectorAll(`.step[data-page="${currentPage}"] ~ .step`).forEach(steps => {
				steps.classList.remove("active", "done");
			})
		}
	}
}

document.addEventListener("DOMContentLoaded", () => {
	document.querySelectorAll("[data-page-container]").forEach(item => {
		item.addEventListener("click", () => {
			gmPages.skipToPage(item.dataset.pageContainer, item.dataset.page);
		})
	})
});

document.querySelectorAll(`.step`).forEach(step => {
	step.addEventListener("click", () => {
		gmPages.skipToPage("main", step.dataset.page);
	})
})

document.addEventListener("pageChanged", () => {
	gmPages.setCurrentStep();
})