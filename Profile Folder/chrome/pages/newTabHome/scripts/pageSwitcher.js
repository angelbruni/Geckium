function setUpPages() {
	let appearanceChoice;

	switch (gkPrefUtils.tryGet("Geckium.newTabHome.overrideStyle").bool) {
		case true:
			appearanceChoice = gkPrefUtils.tryGet("Geckium.newTabHome.style").int;
			break;
		default:
			appearanceChoice = gkPrefUtils.tryGet("Geckium.appearance.choice").int;
			break;
	}

	if (appearanceChoice == 6 || appearanceChoice == 7) {
		const pageSwitcherStart = document.getElementById("page-switcher-start");
		const pageSwitcherEnd = document.getElementById("page-switcher-end");

		let pageContainer = document.getElementById("page-list");
		const pages = pageContainer.querySelectorAll(".tile-page");

		console.log(pages)

		let tabItems = document.querySelectorAll("#dot-list > .dot");

		const defaultTab = gkPrefUtils.tryGet("Geckium.newTabHome.defaultTab").int;

		/*pages.forEach((page, index) => {
			page.setAttribute("data-page", index);
			createDots(index);
		});*/

		if (defaultTab !== "" || defaultTab !== "undefined")
			switchTab("", true, defaultTab)
		else
			switchTab("", true, 1)

		/*function createDots(index) {
			const dotList = document.getElementById("dot-list");
			const dot = document.createElement("button");

			dot.classList.add("item");
			dot.setAttribute("data-page", index)
			
			if (index == 0)
				dot.innerText = "Most visited";
			else
				dot.innerText = "Apps";

			dotList.appendChild(dot);

			dot.setAttribute("onclick", "switchTab('', false, "+ index +")")
		}*/

		pageSwitcherStart.addEventListener("click", () => {
			switchTab("back")
		})
		pageSwitcherEnd.addEventListener("click", () => {
			switchTab()
		})
	}
}

function updateNavButtons() {
	const currentTabIndex = parseInt(document.querySelector("#page-list > .selected").getAttribute("data-page"));
	const nextPageExists = !!document.querySelector("#page-list > [data-page='" + (currentTabIndex + 1) + "']");

	const pageSwitcherStart = document.getElementById("page-switcher-start");
	const pageSwitcherEnd = document.getElementById("page-switcher-end");
	
	pageSwitcherStart.disabled = currentTabIndex === 0;
	pageSwitcherEnd.disabled = !nextPageExists;

	console.log(currentTabIndex, !nextPageExists)
}

function switchTab(direction, static, id) {
	const pages = document.querySelectorAll("#page-list > .tile-page");
	const totalPages = pages.length - 1; // - 1 to start from 0.

	const dots = document.querySelectorAll("#dot-list > .dot");

	let desiredTab;
	let currentTabIndex;
	let pageContainer = document.getElementById("page-list");
	currentTabIndex = parseInt(pageContainer.querySelector("#page-list > .selected").getAttribute("data-page"));

	if (id)
		desiredTab = id;
	else if (!id)
		desiredTab = direction === "back" ? currentTabIndex - 1 : currentTabIndex + 1;

	//if (desiredTab < 0 || desiredTab > totalPages)
		//return; // Exit the function if the desired tab index is out of bounds.*/

		//desiredTab = id;

	console.log(currentTabIndex, id)

	if (id !== 0)
		pageContainer.style.transform = "translateX(calc(var(--page-width) * -1 * " + desiredTab + "))";
	else
		pageContainer.style.transform = null;

	pages.forEach((page) => {
		page.classList.remove("selected");
	});

	console.log(pageContainer.querySelector("[data-page='" + desiredTab + "']"));

	if (id !== 0)
		pageContainer.querySelector("[data-page='" + desiredTab + "']").classList.add("selected");
	else
		pageContainer.querySelector("[data-page='" + 0 + "']").classList.add("selected");

	if (static) {
		pageContainer.style.transition = "none";

		dots.forEach((indicator) => {
			indicator.transition = "none";
		});

		setTimeout(() => {
			pageContainer.style.transition = null;

			dots.forEach((indicator) => {
				indicator.transition = null;
			});
		}, 500);
	}

	updateNavButtons();
	updateDots();
	
	if (id !== 0)
		gkPrefUtils.set("Geckium.newTabHome.defaultTab").int(desiredTab);
	else
		gkPrefUtils.set("Geckium.newTabHome.defaultTab").int(0);
}

function updateDots() {
	const dots = document.querySelectorAll("#dot-list > .dot");
	
	dots.forEach((dot) => {
		dot.classList.remove("selected");
	});

	document.querySelector(".dot[data-page='"+ parseInt(document.querySelector("#page-list > .selected").getAttribute("data-page")) +"']").classList.add("selected");
}