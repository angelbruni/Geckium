class gkDecor {
	static getColor() {
		const hueInput = document.getElementById("gecko-hue");
		const saturationInput = document.getElementById("gecko-saturation");
		const lightnessInput = document.getElementById("gecko-lightness");

		return [hueInput.value, saturationInput.value, lightnessInput.value]
	}

	static setColor() {
		const gecko = document.getElementById("preview-geckium");
		const hueInput = document.getElementById("gecko-hue");
		const saturationInput = document.getElementById("gecko-saturation");
		const lightnessInput = document.getElementById("gecko-lightness");
		
		gecko.style.setProperty("--desired-gecko-color", `hsl(${hueInput.value}, ${saturationInput.value}%, ${lightnessInput.value}%)`);
		hueInput.style.setProperty("--desired-gecko-color", `hsl(${hueInput.value}, ${saturationInput.value}%, ${lightnessInput.value}%)`);
		saturationInput.style.setProperty("--desired-gecko-color", `hsl(${hueInput.value}, 100%, ${lightnessInput.value}%)`);
		lightnessInput.style.setProperty("--desired-gecko-color", `hsl(${hueInput.value}, ${saturationInput.value}%, 50%)`);
	}
}

document.addEventListener("DOMContentLoaded", gkDecor.setColor);
document.getElementById("gecko-hue").addEventListener("change", gkDecor.setColor);
document.getElementById("gecko-saturation").addEventListener("change", gkDecor.setColor);
document.getElementById("gecko-lightness").addEventListener("change", gkDecor.setColor);

document.getElementById("gecko-hue").addEventListener("mousemove", gkDecor.setColor);
document.getElementById("gecko-saturation").addEventListener("mousemove", gkDecor.setColor);
document.getElementById("gecko-lightness").addEventListener("mousemove", gkDecor.setColor);