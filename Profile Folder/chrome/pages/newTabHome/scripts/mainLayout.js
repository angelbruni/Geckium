function setPageWidth() {
	document.documentElement.style.setProperty("--page-width",document.documentElement.clientWidth + "px");
}
addEventListener("resize", setPageWidth);
addEventListener("DOMContentLoaded", setPageWidth);

const { SessionStore } = ChromeUtils.importESModule("resource:///modules/sessionstore/SessionStore.sys.mjs");

function setMostVisitedLayout(layout) {
	const mostVisited = document.getElementById("most-visited");

	const thumbCheckbox = document.getElementById("thumb-checkbox");
	const listCheckbox = document.getElementById("list-checkbox");

	let mostVisitedLayout;

	if (typeof layout !== "undefined" && typeof layout !== "string")
		gkPrefUtils.set("Geckium.newTabHome.mostVisitedLayout").int(layout);

	mostVisitedLayout = gkPrefUtils.tryGet("Geckium.newTabHome.mostVisitedLayout").int;

	if (!mostVisitedLayout)
		mostVisitedLayout = 1;

	switch (layout) {
		case 0:
			mostVisited.classList.add("collapsed");
			mostVisited.classList.remove("list");
			break;

		case 1:
			if (thumbCheckbox.checked) {
				mostVisited.classList.remove("collapsed");
				mostVisited.classList.remove("list");
				listCheckbox.checked = false;
			}
			break;

		case 2:
			if (listCheckbox.checked) {
				mostVisited.classList.remove("collapsed");
				mostVisited.classList.add("list");
				thumbCheckbox.checked = false;
			}
			break;

		case "default":
			if (mostVisitedLayout == 0) {
				mostVisited.classList.add("collapsed");
			} else if (mostVisitedLayout == 1) {
				thumbCheckbox.checked = true;
			} else if (mostVisitedLayout == 2) {
				listCheckbox.checked = true;
				mostVisited.classList.remove("collapsed");
				mostVisited.classList.add("list");
			}
	}
}

function createMainLayout() {
	let appearanceChoice;

	switch (gkPrefUtils.tryGet("Geckium.newTabHome.overrideStyle").bool) {
		case true:
			appearanceChoice = gkPrefUtils.tryGet("Geckium.newTabHome.style").int;
			break;
		default:
			appearanceChoice = gkPrefUtils.tryGet("Geckium.appearance.choice").int;
			break;
	}

	document.querySelectorAll("#recently-closed > .items > .item").forEach((entry) => {
		entry.remove();
	});

	let header = ``;
	let main = ``;
	let footer = ``;

	let menuBtnsContainer;

	if (appearanceChoice <= 2) {
		if (appearanceChoice <= 0) {
			// Chrome 0 - 5
			menuBtnsContainer = "#view-toolbar";
	
			main = `
			<vbox id="main">
				<hbox id="view-toolbar">
					<html:input type="checkbox" id="thumb-checkbox" title="Thumbnail View"></html:input>
					<html:input type="checkbox" id="list-checkbox" title="List View"></html:input>
					<html:button id="option-button" type="menu" class="window-menu-button" title="Change page layout">
						<vbox id="option-menu" class="window-menu">
							<checkbox id="THUMB" label="Most visited"></checkbox>
							<checkbox id="RECENT" label="Recently closed"></checkbox>
						</vbox>
					</html:button>
				</hbox>
				<div id="most-visited"></div>
				<hbox id="recently-closed">
					<label value="Recently closed"></label>
					<hbox class="items"></hbox>
					<button class="item" onclick="Services.wm.getMostRecentBrowserWindow().PlacesCommandHook.showPlacesOrganizer('History')" id="nav" label="View full history"></button>
				</hbox>
				<vbox id="attribution">
					<label>Theme created by</label>
					<html:div id="attribution-img"></html:div>
				</vbox>
			</vbox>
			`;
	
			footer = `
			<vbox id="footer">
				<html:a id="extensions-link" href="https://chrome.google.com/extensions?hl=en-US">
					<html:img id="promo-image" src="chrome://userchrome/content/pages/newTabHome/assets/chrome-4/newtab_themes_promo.png"></html:img>
				</html:a>
			</vbox>
			`;
		} else if (appearanceChoice <= 2) {
			// Chrome 0 - 5
			menuBtnsContainer = "#view-toolbar";
	
			main = `
			<vbox id="main">
				<hbox id="view-toolbar">
					<html:input type="checkbox" id="thumb-checkbox" title="Thumbnail View"></html:input>
					<html:input type="checkbox" id="list-checkbox" title="List View"></html:input>
					<html:button id="option-button" type="menu" class="window-menu-button" title="Change page layout">
						<vbox id="option-menu" class="window-menu">
							<checkbox id="THUMB" label="Most visited"></checkbox>
							<checkbox id="RECENT" label="Recently closed"></checkbox>
							<checkbox id="TIPS" label="Tips"></checkbox>
						</vbox>
					</html:button>
				</hbox>
				<div id="most-visited"></div>
				<hbox id="recently-closed">
					<label value="Recently closed"></label>
					<hbox class="items"></hbox>
					<button class="item" onclick="Services.wm.getMostRecentBrowserWindow().PlacesCommandHook.showPlacesOrganizer('History')" id="nav" label="View full history"></button>
				</hbox>
				<vbox id="attribution">
					<label>Theme created by</label>
					<html:div id="attribution-img"></html:div>
				</vbox>
			</vbox>
			`;
	
			footer = `
			<vbox id="footer">
				<html:a id="extensions-link" href="https://chrome.google.com/extensions?hl=en-US">
					<html:img id="promo-image" src="chrome://userchrome/content/pages/newTabHome/assets/chrome-5/newtab_extensions_promo.png"></html:img>
				</html:a>
			</vbox>
			`;
		}

		waitForElm(menuBtnsContainer).then(() => {
			const thumbCheckbox = document.getElementById("thumb-checkbox");
			const listCheckbox = document.getElementById("list-checkbox");

			thumbCheckbox.addEventListener("change", () => {
				if (thumbCheckbox.checked == true)
					setMostVisitedLayout(1);
				else if (!thumbCheckbox.checked && !listCheckbox.checked)
					setMostVisitedLayout(0); // Update layout to 0 when both checkboxes are unchecked
			});

			listCheckbox.addEventListener("change", () => {
				if (listCheckbox.checked == true)
					setMostVisitedLayout(2);
				else if (!thumbCheckbox.checked && !listCheckbox.checked)
					setMostVisitedLayout(0); // Update layout to 0 when both checkboxes are unchecked
			});
		});
	} else if (appearanceChoice == 3) {
		// Chrome 11

		main = `
		<vbox id="main">
			<vbox class="sections">
				<vbox id="apps">
					<hbox class="section collapsed">
						<image class="disclosure"></image>
						<label>Apps</label>
						<spacer></spacer>
						<button class="section-close-button"></button>
					</hbox>
					<html:div id="apps-content">
						<html:a class="item" style="list-style-image: url('chrome://userchrome/content/pages/newTabHome/assets/chrome-11/imgs/IDR_PRODUCT_LOGO_16.png')" href="https://chrome.google.com/webstore">
							<image></image>
							<label>Web Store</label>
						</html:a>
					</html:div>
				</vbox>
				<vbox id="most-viewed">
					<hbox class="section">
						<image class="disclosure"></image>
						<label>Most visited</label>
						<spacer></spacer>
						<button class="section-close-button"></button>
					</hbox>
					<html:div id="most-viewed-content"></html:div>
				</vbox>
				<vbox id="recently-closed">
					<hbox class="section collapsed">
						<image class="disclosure"></image>
						<label>Recently closed</label>
						<spacer></spacer>
						<button class="section-close-button"></button>
					</hbox>
					<html:div id="recently-closed-content"></html:div>
				</vbox>
			</vbox>
		</vbox>
		`;

		footer = `
		<vbox id="attribution">
			<label>Theme created by</label>
			<html:div id="attribution-img"></html:div>
		</vbox>
		<vbox id="footer">
			<div id="logo-img">
				<html:img src="chrome://userchrome/content/pages/newTabHome/assets/chrome-11/imgs/IDR_LOGO_ICON.png"></html:img>
				<div id="logo_wordmark"></div>
			</div>
		</vbox>
		`;
	} else if (appearanceChoice == 4 || appearanceChoice == 5) {
		// Chrome 21 - 45

		menuBtnsContainer = "#footer-menu-container";

		header = `
		<button id="login-container">
			<html:div id="login-status-header-container" class="login-status-row">
				<html:div id="login-status-header">Not signed in to Chrome</html:div>
			</html:div>
			<html:div id="login-status-sub-header">(You're missing out—<span class="link-span">sign in</span>)</html:div>
		</button>
		`;

		main = `
		<hbox id="card-slider-frame">
			<button id="page-switcher-start" class="page-switcher" label="‹" disabled="true"></button>
			<hbox id="page-list">
				<vbox class="tile-page selected" id="most-visited-page" data-page="0">
					<vbox class="tile-page-content">
						<html:div class="tile-grid">

						</html:div>
					</vbox>
				</vbox>
				<vbox class="tile-page" id="apps-page" data-page="1">
					<vbox class="tile-page-content">
						<html:div class="tile-grid"></html:div>
					</vbox>
				</vbox>
			</hbox>
			<button id="page-switcher-end" class="page-switcher" label="›"></button>
		</hbox>
		`;

		footer = `
		<vbox id="attribution">
			<label>Theme created by</label>
			<html:div id="attribution-img"></html:div>
		</vbox>
		<vbox id="footer">
			<html:div id="footer-border"></html:div>
			<hbox id="footer-content">
				<div id="logo-img">
					<html:img src="chrome://userchrome/content/pages/newTabHome/assets/chrome-11/imgs/IDR_LOGO_ICON.png"></html:img>
					<div id="logo_wordmark"></div>
				</div>
				<hbox id="dot-list">
					<button onclick="switchTab('', false, 0)" class="dot selected" label="Most visited" data-page="0">
						<html:div class="selection-bar"></html:div>
					</button>
					<button onclick="switchTab('', false, 1)" class="dot" label="Apps" data-page="1">
						<html:div class="selection-bar"></html:div>
					</button>
				</hbox>
				<hbox id="footer-menu-container">
					<html:button id="other-sessions-menu-button" class="footer-menu-button" type="menu">
						<label>Other devices</label>
					</html:button>
					<html:button id="recently-closed-menu-button" class="footer-menu-button" type="menu">
						<label>Recently closed</label>
						<vbox class="footer-menu">
							
						</vbox>
					</html:button>
					<html:div id="vertical-separator"></html:div>
				</hbox>
				
				<html:a id="chrome-web-store-link" href="https://chrome.google.com/webstore">
					<label>Web Store</label>
				</html:a>
			</hbox>
		</vbox>
		`;
	} else {
		// Chrome 47 - 50

		if (gkPrefUtils.tryGet("Geckium.crflag.enable.icon.ntp").bool) {
			header = `
			<vbox id="google-search">
				<html:img id="hplogo" width="272px" height="92px" alt="Google" src="chrome://userchrome/content/pages/newTabHome/assets/chrome-47/imgs/googlelogo_color_272x92dp.png" title="Google"></html:img>
				<html:form>
					<html:input id="google-input" placeholder="Search Google or type URL"></html:input>
				</html:form>
			</vbox>
			`;
		} else {
			header = `
			<hbox id="google-bar">
				<html:a href="https://mail.google.com/mail">Gmail</html:a>
				<html:a href="https://www.google.com/imghp">Images</html:a>
				<html:a id="google-apps-link" href="https://www.google.pt/intl/pt-PT/about/products?tab=rh"></html:a>
			</hbox>
			<vbox id="google-search">
				<html:img id="hplogo" width="272px" height="92px" alt="Google" src="chrome://userchrome/content/pages/newTabHome/assets/chrome-47/imgs/googlelogo_color_272x92dp.png" title="Google"></html:img>
				<html:form>
					<html:input id="google-input" placeholder="Search Google or type URL"></html:input>
				</html:form>
			</vbox>
			`;
		}

		main = `
		<html:div id="mv-tiles"></html:div>
		<vbox id="attribution">
			<label>Theme created by</label>
			<html:div id="attribution-img"></html:div>
		</vbox>
		`;

		waitForElm("#google-search").then(() => {
			const form = document.querySelector("#google-search > form");
			form.addEventListener("submit", (event) => {
				event.preventDefault();
				location.href = "https://www.google.com/search?q=" + form.querySelector("input").value;
			});
		});
	}

	// Create contents
	const container = document.querySelector("#main-container");

	Array.from(container.childNodes).forEach((elm) => {
		elm.remove();
	});

	container.appendChild(MozXULElement.parseXULToFragment(header));
	container.appendChild(MozXULElement.parseXULToFragment(main));
	container.appendChild(MozXULElement.parseXULToFragment(footer));

	waitForElm("#most-visited").then(() => {
		setMostVisitedLayout("default");
	});

	if (appearanceChoice <= 2 || appearanceChoice == 4 || appearanceChoice == 5) {
		waitForElm(menuBtnsContainer).then(() => {
			document.querySelectorAll('[type="menu"]').forEach((menuBtn) => {
				menuBtn.addEventListener("click", function (event) {
					if (!menuBtn.hasAttribute("open"))
						menuBtn.setAttribute("open", true);
					else
						menuBtn.removeAttribute("open"); // Add the "open" attribute to the button

					// Stop the event from propagating further to prevent triggering the document click listener
					event.stopPropagation();
				});

				// Add event listener to the document to listen for clicks outside of the button
				document.addEventListener("click", function (event) {
					// Check if the clicked element is the button or one of its children
					const isClickedInsideButton = menuBtn.contains(event.target);

					// If the click is not inside the button or its children, remove the "open" attribute
					if (!isClickedInsideButton)
						menuBtn.removeAttribute("open");
				});

				// Add event listeners to children of the button to prevent propagation to the document click listener
				/*menuBtn.querySelectorAll("*").forEach(child => {
					child.addEventListener("click", function(event) {
						// Stop the event from propagating to the document click listener
						event.stopPropagation();
					});
				});*/
			});
		});
	}
}
