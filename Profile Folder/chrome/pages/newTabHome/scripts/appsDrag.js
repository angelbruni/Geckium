let apps = document.querySelectorAll(".app-cell");

apps.forEach((app) => {
	let isDragging = false;
	let offsetX;
	let offsetY;

	app.addEventListener("mousedown", (event) => {
		isDragging = true;
		offsetX = event.clientX;
		offsetY = event.clientY;
	});

	window.addEventListener("mousemove", (event) => {
		if (isDragging) {
			let mouseX = event.clientX;
			let mouseY = event.clientY;

			let posX = mouseX - offsetX;
			let posY = mouseY - offsetY;

			app.style.transform = `translate(${posX}px, ${posY}px)`;
		}
	});

	window.addEventListener("mouseup", () => {
		isDragging = false;
		app.style.transform = "";
	});
});
