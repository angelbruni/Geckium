/* I shouldn't do the sound effect like this, but the GeckiumMaterial code is bad, so this will do for now */
const SFXTick = new Audio("file:///home/brunof/.mozilla/firefox/capy8v0g.default-release/chrome/frameworks/GeckiumMaterial/sounds/effects/ogg/Effect_Tick.ogg");
setTimeout(() => {
	document.querySelectorAll('button, label.button, .input, .checkbox-parent, .switch-parent, .radio-parent, .step').forEach(btn => {
		btn.addEventListener("mousedown", () => {
			const snd = SFXTick.cloneNode();
			snd.play();
			snd.addEventListener("ended", () => {
				snd.remove();
			});
		})
	})
}, 100);