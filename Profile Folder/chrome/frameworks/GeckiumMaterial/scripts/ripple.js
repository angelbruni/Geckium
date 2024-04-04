function rippleEffect() {
    document.querySelectorAll(".ripple-enabled").forEach(rippledElm => {
        rippledElm.addEventListener("mousedown", (e) => {
            const ripple = document.createElement("div");
            ripple.classList.add("ripple");

			const rect = rippledElm.getBoundingClientRect();
			let maxSize;
            const rectWidth = rect.width;
            const rectHeight = rect.height;

			let posX;
			let posY;
            
			/*if (rippledElm.classList.contains("floating-action-button")) {
				posX = rectWidth / 2;
				posY = rectHeight / 2;
			} else {*/
				posX = e.clientX - rect.x;
				posY = e.clientY - rect.y;
			//}

            ripple.style.left = posX + "px";
            ripple.style.top = posY + "px";
            ripple.style.opacity = 1;

            rippledElm.appendChild(ripple);

            if (rectWidth < rectHeight)
                maxSize = rectHeight * 2.1;
            else
                maxSize = rectWidth * 2.1;

            const animationStart = performance.now();
			const duration = 500;

            function animate(currentTime) {
                const elapsedTime = currentTime - animationStart;
                const progress = Math.min(elapsedTime / duration, 1);

                const newSize = progress * maxSize;
                ripple.style.width = newSize + "px";
                ripple.style.height = newSize + "px";
                ripple.style.opacity = 1 - progress;

                if (progress < 1)
                    requestAnimationFrame(animate);
                else
                    ripple.remove();
            }

            requestAnimationFrame(animate);
        });
    });
}
document.addEventListener("DOMContentLoaded", rippleEffect);