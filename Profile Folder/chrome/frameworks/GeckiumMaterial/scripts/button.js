function rippleEffect() {
    document.querySelectorAll(".button.ripple").forEach(button => {
        button.addEventListener("mousedown", (e) => {
            const ripple = document.createElement("div");
            ripple.classList.add("ripple");

            const rect = button.getBoundingClientRect();
            const posX = e.clientX;
            const posY = e.clientY;

            ripple.style.left = (posX - rect.x) + "px";
            ripple.style.top = (posY - rect.y) + "px";
            ripple.style.opacity = 1;

            button.appendChild(ripple);

            let maxSize;
            const rectWidth = rect.width;
            const rectHeight = rect.height;

            if (rectWidth < rectHeight)
                maxSize = rectHeight * 2.1;
            else if (rectHeight < rectWidth)
                maxSize = rectWidth * 2.1;

            const animationStart = performance.now();

            function animate(currentTime) {
                const elapsedTime = currentTime - animationStart;
                const progress = Math.min(elapsedTime / maxSize / 1.5 , 1);

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