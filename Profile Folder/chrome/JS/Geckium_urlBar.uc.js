// ==UserScript==
// @name        Geckium - URL bar
// @author		AngelBruni
// @loadorder   3
// ==/UserScript==

function styleURLBar() {
	const urlbarContainer = document.getElementById("urlbar-container");
	const starButtonBox = document.getElementById("star-button-box");
	const urlbar = document.getElementById("urlbar");
	const pageActionButton = document.getElementById("pageActionButton");
	const identityBox = document.getElementById("identity-box");
	const pageActionButtons = document.getElementById("page-action-buttons");
	const urlbarLabelBox = document.getElementById("urlbar-label-box");

	if (pref(prefMap.appearance).tryGet.int() == 0) {
		waitForElm("#page-action-buttons > #star-button-box").then(function() {
			if (!document.getElementById("go-button-box")) {
				const goButtonBox = document.createXULElement("hbox");
				goButtonBox.id = "go-button-box";
				const goButton = document.createXULElement("image");
				goButton.id = "go-button";
				urlbarContainer.appendChild(goButtonBox);
				goButtonBox.classList.add("toolbarbutton-1");
				goButtonBox.setAttribute("onclick", "gURLBar.handleCommand(event);");
				goButtonBox.appendChild(goButton);
			}

			urlbarContainer.setAttribute("starpos", "start");
			insertBefore(starButtonBox, urlbar);
			starButtonBox.classList.add("toolbarbutton-1");
			insertAfter(identityBox, pageActionButtons)
		});
	} else {
		urlbarContainer.setAttribute("starpos", "end");
		insertAfter(starButtonBox, pageActionButton);
		starButtonBox.classList.remove("toolbarbutton-1");
		insertBefore(identityBox, urlbarLabelBox);
	}
}
window.addEventListener("load", styleURLBar);
window.addEventListener("appearanceChanged", styleURLBar);

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

	const urlbarProtocol = document.createXULElement("label");
	if (!document.getElementById("urlbar-protocol")) {
		const urlbarScheme = document.getElementById("urlbar-scheme");
		urlbarProtocol.id = "urlbar-protocol";

		insertBefore(urlbarProtocol, urlbarScheme);
	}

	const protocol = window.gBrowser.selectedTab.linkedBrowser.currentURI.spec.split(":")[0];
	if (protocol !== "about" && protocol !== "http" ) {
		document.getElementById("urlbar-protocol").textContent = protocol;
	} else {
		document.getElementById("urlbar-protocol").textContent = "";
	}
}
window.addEventListener("load", updateProtocol);
window.addEventListener("TabAttrModified", updateProtocol);