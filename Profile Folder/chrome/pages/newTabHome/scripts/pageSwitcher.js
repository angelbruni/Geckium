let pageSwitchers = document.querySelectorAll(".page-switcher");

let tabItems = document.querySelectorAll(".tabs .item");
let mostVisitedTab = document.getElementById("most-visited-tab");
let appsTab = document.getElementById("apps-tab");

let mostVisitedPage = document.getElementById("most-visited-page");
let appsPage = document.getElementById("apps-page");

pageSwitchers.forEach((pageSwitcher) => {
	pageSwitcher.addEventListener("click", function handleClick(event) {
		if (event.target.id == "page-switcher-end") {
			mostVisitedPage.style.transform =
				"translateX(calc(var(--page-width) * -1))";
			appsPage.style.transform =
				"translateX(calc(var(--page-width) * -1))";

			mostVisitedTab.classList.remove("active");
			appsTab.classList.add("active");
		} else if (event.target.id == "page-switcher-start") {
			mostVisitedPage.style.transform = "translateX(0)";
			appsPage.style.transform = "translateX(0)";

			mostVisitedTab.classList.add("active");
			appsTab.classList.remove("active");
		}
	});
});

tabItems.forEach((tabItem) => {
	tabItem.addEventListener("click", function handleClick(event) {
		if (event.target.id == "most-visited-tab") {
			mostVisitedPage.style.transform = "translateX(0)";
			appsPage.style.transform = "translateX(0)";

			mostVisitedTab.classList.add("active");
			appsTab.classList.remove("active");
		} else if (event.target.id == "apps-tab") {
			mostVisitedPage.style.transform =
				"translateX(calc(var(--page-width) * -1))";
			appsPage.style.transform =
				"translateX(calc(var(--page-width) * -1))";

			mostVisitedTab.classList.remove("active");
			appsTab.classList.add("active");
		}
	});
});

function SwitchTab(id, static = false) {
	if (id == 1) {
		mostVisitedPage.style.transform = "translateX(0)";
		appsPage.style.transform = "translateX(0)";

		mostVisitedTab.classList.add("active");
		appsTab.classList.remove("active");
	} else if (id == 2) {
		mostVisitedPage.style.transform =
			"translateX(calc(var(--page-width) * -1))";
		appsPage.style.transform = "translateX(calc(var(--page-width) * -1))";

		mostVisitedTab.classList.remove("active");
		appsTab.classList.add("active");
	}

	if (static) {
		mostVisitedPage.style.transition = "none";
		appsPage.style.transition = "none";

		mostVisitedTab.style.transition = "none";
		appsTab.style.transition = "none";

		setTimeout(() => {
			mostVisitedPage.style.transition = "";
			appsPage.style.transition = "";

			mostVisitedTab.style.transition = "";
			appsTab.style.transition = "";
		}, 1);
	}
}
