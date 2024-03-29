let pageSwitchers = document.querySelectorAll(".page-switcher");
const pageSwitcherStart = document.getElementById("page-switcher-start");
const pageSwitcherEnd = document.getElementById("page-switcher-end");

let pageContainer = document.getElementById("page-list");
const pages = document.querySelectorAll("#page-list > .page");
const totalPages = pages.length - 1; // - 1 to start from 0.

let tabItems = document.querySelectorAll(".tabs .item");
let currentTabIndex;
let desiredTab;

const defaultTab = pref("Geckium.newTabHome.defaultTab").tryGet.int();

pages.forEach((page, index) => {
	page.setAttribute("data-page", index);
	createIndicator(index);
});

function switchTab(direction, static, id) {
	const indicators = document.querySelectorAll("#tabs > .item");

    currentTabIndex = parseInt(pageContainer.querySelector(".page.active").getAttribute("data-page"));

    if (id !== undefined && (id === 0 || (id > 0 && id <= totalPages)))
        desiredTab = id;
    else if (!id)
        desiredTab = direction === "back" ? currentTabIndex - 1 : currentTabIndex + 1;

    if (desiredTab < 0 || desiredTab > totalPages)
        return; // Exit the function if the desired tab index is out of bounds.

	if (id !== 0)
		pageContainer.style.transform = "translateX(calc(var(--page-width) * -1 * " + desiredTab + "))";
	else
		pageContainer.style.transform = null;

	pages.forEach((page) => {
		page.classList.remove("active");
	});
	pageContainer.querySelector(".page[data-page='" + desiredTab + "']").classList.add("active");

	if (static) {
		pageContainer.style.transition = "none";

		indicators.forEach((indicator) => {
			indicator.transition = "none";
		});

		setTimeout(() => {
			pageContainer.style.transition = null;

			indicators.forEach((indicator) => {
				indicator.transition = null;
			});
		}, 500);
	}

	updateNavButtons();
	updateIndicators();
	pref("Geckium.newTabHome.defaultTab").set.int(desiredTab);
}

if (defaultTab !== "" || defaultTab !== "undefined")
	switchTab("", true, defaultTab)
else
	switchTab("", true, 1)

function updateNavButtons() {
    const currentTabIndex = parseInt(pageContainer.querySelector(".page.active").getAttribute("data-page"));
    const nextPageExists = !!pageContainer.querySelector(".page[data-page='" + (currentTabIndex + 1) + "']");
    
    pageSwitcherStart.disabled = currentTabIndex === 0;
    pageSwitcherEnd.disabled = !nextPageExists;
}
updateNavButtons()

function createIndicator(index) {
	const indicatorsContainer = document.getElementById("tabs");
	const indicator = document.createElement("button");

	indicator.classList.add("item");
	indicator.setAttribute("data-page", index)
	
	if (index == 0)
		indicator.innerText = "Most visited";
	else
		indicator.innerText = "Apps";

	indicatorsContainer.appendChild(indicator);

	indicator.setAttribute("onclick", "switchTab('', false, "+ index +")")
}

function updateIndicators() {
	const indicators = document.querySelectorAll("#tabs > .item");
	indicators.forEach((indicator) => {
		indicator.classList.remove("active");

		document.querySelector(".item[data-page='"+ desiredTab +"']").classList.add("active");
	});
}
updateIndicators();

pageSwitcherStart.addEventListener("click", () => {
	switchTab("back")
})
pageSwitcherEnd.addEventListener("click", () => {
	switchTab()
})