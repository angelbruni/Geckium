const cancelElm = document.getElementById("btn-cancel");
const backElm = document.getElementById("btn-back");
const nextElm = document.getElementById("btn-next");
const finishElm = document.getElementById("btn-finish");

function goToPage(direction) {
	const currentPage = document.querySelector('.pages .page[selected="true"]');
	const currentPageIndex = parseInt(currentPage.dataset.page);

	if (direction == "next")
		gmPages.skipToPage('main', currentPageIndex + 1)
	else if (direction == "back")
		gmPages.skipToPage('main', currentPageIndex - 1)
}

backElm.addEventListener("click", () => {
	goToPage("back");
})

nextElm.addEventListener("click", () => {
	goToPage("next");
})

finishElm.addEventListener("click", () => {
	gkPrefUtils.set("Geckium.firstRun.complete").bool(true);
	if (gkPrefUtils.prefExists("Geckium.firstRun.wasSilverfox"))
		gkPrefUtils.delete("Geckium.firstRun.wasSilverfox");

	gkWindow.close();
})

document.addEventListener("pageChanged", () => {
	const currentPage = document.querySelector('.pages .page[selected="true"]');
	const currentPageIndex = parseInt(currentPage.dataset.page);

	if (currentPageIndex == 0)
		backElm.style.display = "none";
	else
		backElm.style.display = null;

	if (currentPageIndex == 2)
		nextElm.style.display = "none";
	else
		nextElm.style.display = null;

	if (currentPageIndex == 2)
		finishElm.style.display = null;
	else
		finishElm.style.display = "none";
})