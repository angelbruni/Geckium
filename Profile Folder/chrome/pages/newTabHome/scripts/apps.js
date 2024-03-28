let apps = document.querySelectorAll(".app-cell");
let allowDragging; // bruni: only allow dragging after it's being dragged for a while.
const allowDraggingPxOffset = 4;

let initialMouseX;
let initialMouseY;

apps.forEach(app => {
	let isDragging = false;
	let offsetX;
	let offsetY;

	const appLink = app.querySelector("a");

	appLink.setAttribute("draggable", false);

	app.addEventListener("mousedown", (event) => {
		initialMouseX = event.clientX;
		initialMouseY = event.clientY;
		
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

			if (mouseX > initialMouseX + allowDraggingPxOffset || mouseX < initialMouseX - allowDraggingPxOffset || mouseY > initialMouseY + allowDraggingPxOffset || mouseY < initialMouseY - allowDraggingPxOffset)
				allowDragging = true;

			if (allowDragging) {
				app.style.transform = `translate(${posX}px, ${posY}px)`;
				appLink.style.pointerEvents = "none";
			}
		}
	});

	window.addEventListener("mouseup", () => {
		allowDragging = false;
		isDragging = false;
		app.style.transform = null;
		appLink.style.pointerEvents = null;
	});
});
