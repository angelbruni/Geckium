function updateProfilePictures() {
	const menu = document.getElementById("pfp-mode-select");

	const gridPfPs = document.getElementById("profile-pictures-grid");
	gridPfPs.innerHTML = "";

	const chromePfPs = 25;

	for (let i = 0; i <= chromePfPs; i++) {
		const PfPBtn = document.createElement("button");
		PfPBtn.classList.add("people-picture", "ripple-enabled");

		const PfPImage = document.createXULElement("image");
		PfPImage.setAttribute("src", "chrome://userchrome/content/assets/img/profile/" + i + ".png")
		PfPBtn.appendChild(PfPImage);

		gridPfPs.appendChild(PfPBtn);
	}

	menu.addEventListener("change", updateProfilePictures);
}
document.addEventListener("DOMContentLoaded", updateProfilePictures);