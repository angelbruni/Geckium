
let allowDragging; // bruni: only allow dragging after it's being dragged for a while.
const allowDraggingPxOffset = 4;

let initialMouseX;
let initialMouseY;

apps.forEach((app) => {
	
	
	

	app.addEventListener("mousedown", (event) => {
		initialMouseX = event.clientX;
		initialMouseY = event.clientY;
		
		
		
		
	});

	window.addEventListener("mousemove", (event) => {
		if (isDragging) {
			
			

			
			

			if (mouseX > initialMouseX + allowDraggingPxOffset || mouseX < initialMouseX - allowDraggingPxOffset || mouseY > initialMouseY + allowDraggingPxOffset || mouseY < initialMouseY - allowDraggingPxOffset)
				allowDragging = true;

			if (allowDragging)
				app.style.transform = `translate(${posX}px, ${posY}px)`;
		}
	});

	window.addEventListener("mouseup", () => {
		allowDragging = false;
		
		
	});
});
