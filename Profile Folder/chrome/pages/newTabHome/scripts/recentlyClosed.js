const { SessionStore } = ChromeUtils.importESModule("resource:///modules/sessionstore/SessionStore.sys.mjs");

const menu = document.createXULElement("vbox");
menu.classList.add("footer-menu");


function getClosedTabs() {
	
	menu.querySelectorAll("a").forEach(entry => {
		entry.remove();
	})
	
	const closedTabsList = SessionStore.getClosedTabDataForWindow(Services.wm.getMostRecentWindow('navigator:browser'));

	if (closedTabsList.length !== 0) {
		const visitedURLs = new Set();

		closedTabsList.forEach(tab => {
			const state = tab.state;

			const url = state.entries[0].url;

			// If the visitedURLs Set has more than 10 items, remove the oldest URL
            if (visitedURLs.size >= 10) {
                return; // Return early if we already have 10 visited URLs
            }

			if (visitedURLs.has(url)) {
				return;
			}

			visitedURLs.add(url);

			const title = state.entries[0].title;
			const image = state.image;

			const menuItem = document.createElement("a");
			menuItem.setAttribute("href", url);
			menuItem.style.listStyleImage = "url(" + image; + ")"
			menuItem.classList.add("footer-menu-item");

			const menuItemImage = document.createXULElement("image");
			menuItem.appendChild(menuItemImage);

			const menuItemLabel = document.createXULElement("label");
			menuItemLabel.textContent = title;
			menuItem.appendChild(menuItemLabel);

			menu.appendChild(menuItem);
		});
	}
}

function createClosedTabsMenuBtn() {
	const closedTabsList = SessionStore.getClosedTabDataForWindow(Services.wm.getMostRecentWindow('navigator:browser'));

	if (closedTabsList.length !== 0) {
		const btn = document.createElement("button");
		btn.id = "footer-menu-container";
		btn.classList.add("item");
		btn.setAttribute("type", "menu");
		btn.innerText = "Recently closed";
		btn.addEventListener("click", getClosedTabs)
		insertAfter(btn, document.getElementById("tabs"))
		
		btn.addEventListener("click", function(event) {
			btn.setAttribute("open", ""); // Add the "open" attribute to the button
		
			// Stop the event from propagating further to prevent triggering the document click listener
			event.stopPropagation();
		});
		
		// Add event listener to the document to listen for clicks outside of the button
		document.addEventListener("click", function(event) {
			// Check if the clicked element is the button or one of its children
			const isClickedInsideButton = btn.contains(event.target);
		
			// If the click is not inside the button or its children, remove the "open" attribute
			if (!isClickedInsideButton) {
				btn.removeAttribute("open");
			}
		});
		
		// Add event listeners to children of the button to prevent propagation to the document click listener
		btn.querySelectorAll("*").forEach(child => {
			child.addEventListener("click", function(event) {
				// Stop the event from propagating to the document click listener
				event.stopPropagation();
			});
		});

		document.getElementById("footer-menu-container").appendChild(menu);
	}
}
createClosedTabsMenuBtn();