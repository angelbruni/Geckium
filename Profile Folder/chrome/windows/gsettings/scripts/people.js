function updateProfilePictureSettingsState() {
	const container = document.getElementById("profile-pic-content");

	container.setAttribute("profile-pic-button", gkPrefUtils.tryGet("Geckium.profilepic.button").bool)
}
const profilePictureStateObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			updateProfilePictureSettingsState()
		}
	}
};
Services.prefs.addObserver("Geckium.profilepic.button", profilePictureStateObserver, false)
document.addEventListener("DOMContentLoaded", updateProfilePictureSettingsState);

function updateProfilePictures() {
	const menu = document.getElementById("pfp-mode-select");

	const gridPfPs = document.getElementById("profile-pictures-grid");
	gridPfPs.innerHTML = "";

	const chromePfPs = 25;

	for (let i = 0; i <= chromePfPs; i++) {
		const pfPRadio = document.createElement("input");
		pfPRadio.type = "radio";
		pfPRadio.name = "pfp-chromium"
		pfPRadio.classList.add("people-picture", "ripple-enabled");
		pfPRadio.dataset.index = i;

		pfPRadio.addEventListener("click", () => {
			gkPrefUtils.set("Geckium.profilepic.chromiumIndex").int(i);
		})

		const pfPImage = document.createXULElement("image");
		pfPImage.setAttribute("src", "chrome://userchrome/content/assets/img/profile/" + i + ".png")
		pfPRadio.appendChild(pfPImage);

		gridPfPs.appendChild(pfPRadio);
	}

	document.querySelector(`input.people-picture[data-index="${gkPrefUtils.tryGet("Geckium.profilepic.chromiumIndex").int}"]`).checked = true;

	menu.addEventListener("change", updateProfilePictures);
}
document.addEventListener("DOMContentLoaded", updateProfilePictures);

function updateProfilePictureChoiceOption() {
	const container = document.getElementById("card-avatar");

	container.setAttribute("profile-pic-mode", gkPrefUtils.tryGet("Geckium.profilepic.mode").int);
}
const profilePictureObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed") {
			updateProfilePictureChoiceOption()
		}
	}
};
Services.prefs.addObserver("Geckium.profilepic.mode", profilePictureObserver, false)
document.addEventListener("DOMContentLoaded", updateProfilePictureChoiceOption);