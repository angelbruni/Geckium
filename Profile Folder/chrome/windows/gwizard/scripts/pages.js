const cancelElm = document.getElementById("btn-cancel");
const backElm = document.getElementById("btn-back");
const nextElm = document.getElementById("btn-next");
const finishElm = document.getElementById("btn-finish");

function goToPage(direction) {
	const currentPage = document.querySelector('.pages .page[selected="true"]');
	const currentPageIndex = parseInt(currentPage.dataset.page);

	console.log(currentPageIndex, direction, currentPageIndex + 1,)

	if (direction == "next")
		skipToPage('main', currentPageIndex + 1)
	else if (direction == "back")
		skipToPage('main', currentPageIndex - 1)
}

backElm.addEventListener("click", () => {
	goToPage("back");
})

nextElm.addEventListener("click", () => {
	goToPage("next");
})

finishElm.addEventListener("click", () => {
	pref("Geckium.firstRun.complete").set.bool(true);
	windowClose();
})

document.addEventListener("pageChanged", () => {
	const currentPage = document.querySelector('.pages .page[selected="true"]');
	const currentPageIndex = parseInt(currentPage.dataset.page);
	console.log(currentPageIndex);

	if (currentPageIndex == 0)
		backElm.style.display = "none";
	else
		backElm.style.display = null;

	if (currentPageIndex == 3)
		nextElm.style.display = "none";
	else
		nextElm.style.display = null;

	if (currentPageIndex == 3)
		finishElm.style.display = null;
	else
		finishElm.style.display = "none";
})