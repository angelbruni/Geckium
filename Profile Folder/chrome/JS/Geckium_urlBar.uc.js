// ==UserScript==
// @name        Geckium - URL bar
// @author		AngelBruni
// @loadorder   3
// ==/UserScript==

function changeGoButton() {
	const urlbarContainer = document.getElementById("urlbar-container");
	let urlbarInputContainer = document.getElementById("urlbar-input-container");

	/* Fix for Firefox ~120+ */
	if (!urlbarInputContainer)
		urlbarInputContainer = document.querySelector(".urlbar-input-container");

	let appearanceChoice = gkEras.getBrowserEra();

	if (!document.getElementById("go-button-box")) {
		const goButtonBox = document.createXULElement("hbox");
		goButtonBox.id = "go-button-box";
		const goButton = document.createXULElement("image");
		goButton.id = "go-button";
		
		goButtonBox.classList.add("toolbarbutton-1");
		goButtonBox.setAttribute("onclick", "gURLBar.handleCommand(event);");
		goButtonBox.appendChild(goButton);

		if (appearanceChoice <= 5)
			urlbarContainer.appendChild(goButtonBox);
		else if (appearanceChoice == 47)
			urlbarInputContainer.appendChild(goButtonBox);
	} else {
		const goButtonBox = document.getElementById("go-button-box");

		if (appearanceChoice <= 5)
			urlbarContainer.appendChild(goButtonBox);
		else if (appearanceChoice == 47)
			urlbarInputContainer.appendChild(goButtonBox);
	}
}

function styleURLBar() {
	const urlbarContainer = document.getElementById("urlbar-container");
	const starButtonBox = document.getElementById("star-button-box");
	const urlbar = document.getElementById("urlbar");
	const pageActionButton = document.getElementById("pageActionButton");
	const identityBox = document.getElementById("identity-box");
	const pageActionButtons = document.getElementById("page-action-buttons");
	const urlbarLabelBox = document.getElementById("urlbar-label-box");

	let appearanceChoice = gkEras.getBrowserEra();

	setTimeout(() => {
		if (appearanceChoice <= 5) {
			UC_API.Runtime.startupFinished().then(() => {
				urlbarContainer.setAttribute("starpos", "start");
				gkInsertElm.before(starButtonBox, urlbar);
				starButtonBox.classList.add("toolbarbutton-1");
				gkInsertElm.after(identityBox, pageActionButtons)
			});
		} else {
			urlbarContainer.setAttribute("starpos", "end");
			gkInsertElm.after(starButtonBox, pageActionButton);
			starButtonBox.classList.remove("toolbarbutton-1");
			gkInsertElm.before(identityBox, urlbarLabelBox);
		}
	}, 10);

	if (appearanceChoice <= 5 || appearanceChoice == 47)
		waitForElm("#page-action-buttons").then(changeGoButton)
}
window.addEventListener("load", styleURLBar);
window.addEventListener("DOMContentLoaded", styleURLBar);
window.addEventListener("appearanceChanged", styleURLBar);

function changeNotificationPopupBoxPos() {
	const notificationPopupBox = document.getElementById("notification-popup-box");

	gkInsertElm.before(notificationPopupBox, document.getElementById("page-action-buttons"));
}
window.addEventListener("load", changeNotificationPopupBoxPos);

function updateProtocol() {
	const identityIconBox = document.getElementById("identity-icon-box");
	if (!document.getElementById("custom-identity-label")) {
		const customIdentityLabel = document.createXULElement('label');
		customIdentityLabel.id = "custom-identity-label";
		identityIconBox.appendChild(customIdentityLabel);
	}

	const navBar = document.getElementById("nav-bar");
	const identityBox = document.getElementById("identity-box");
	const customIdentityLabel = document.getElementById("custom-identity-label");
	customIdentityLabel.textContent = "";
	const attr = "securestate"
	setTimeout(() => {
		const securitystate = gBrowser.selectedTab.linkedBrowser.securityUI.state;
		switch (securitystate) {
			case 0:
				navBar.setAttribute(attr, "chrome");
				break;
			case 2:
				navBar.setAttribute(attr, "secure");
				break;
			case 4:
				if (identityBox.classList.contains("notSecureText"))
					navBar.setAttribute(attr, "warning")
				else
					navBar.setAttribute(attr, "chrome")
				break;
			case 1048578:
				navBar.setAttribute(attr, "ev");
				customIdentityLabel.textContent = gIdentityHandler.getIdentityData().cert.organization + " ["+ gIdentityHandler.getIdentityData().country +"]";
				break;
			case 67108866:
				navBar.setAttribute(attr, "insecure");
				break;
		}
	}, 0);

	const urlbarProtocol = document.createXULElement("label");
	if (!document.getElementById("urlbar-protocol")) {
		const urlbarScheme = document.getElementById("urlbar-scheme");
		urlbarProtocol.id = "urlbar-protocol";

		gkInsertElm.before(urlbarProtocol, urlbarScheme);
	}

	setTimeout(() => {
		const protocol = window.gBrowser.selectedTab.linkedBrowser.currentURI.spec.split(":")[0];
		if (protocol !== "about" && protocol !== "http" ) {
			document.getElementById("urlbar-protocol").textContent = protocol;
		} else {
			document.getElementById("urlbar-protocol").textContent = "";
		}
	}, 0);
}
window.addEventListener("load", updateProtocol);
window.addEventListener("TabAttrModified", updateProtocol);