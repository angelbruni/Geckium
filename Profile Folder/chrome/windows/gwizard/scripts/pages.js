const cancelElm = document.getElementById("btn-cancel");
const backElm = document.getElementById("btn-back");
const nextElm = document.getElementById("btn-next");

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