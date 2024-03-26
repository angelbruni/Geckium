function setPageWidth() {
	document.documentElement.style.setProperty("--page-width", document.documentElement.clientWidth + "px");	
}
addEventListener("resize", setPageWidth);
addEventListener("DOMContentLoaded", setPageWidth);