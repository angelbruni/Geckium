// ==UserScript==
// @name			Geckium - Tabs
// @author			AngelBruni, blackle
// @include			main
// ==/UserScript==

UC_API.Runtime.startupFinished().then(async () => {
	// Modify currently existing tabs
	document.querySelectorAll(`.tabbrowser-tab:not([gkmodified="true"])`).forEach(existingTab => {
		modifyTab(existingTab);
	});		

	/* bruni:	The entire code should be ran after startup has finished, meaning that
				gBrowser is available, however, in Floorp, when creating a new window
				the code complains about gBrowser being unavailable meaning that we have
				to wait for it to be available. */
	// TODO: Investigate a better fix?? :thonk:
	while (!gBrowser) {
		await new Promise(resolve => setTimeout(resolve, 100));
	}

	// Get a reference to the TabContainer, which holds all the tabs in the browser
    let tabContainer = gBrowser.tabContainer;

    tabContainer.addEventListener('TabOpen', function(e) {
        // The newly created tab is accessible via event.target
        let tab = e.target;

		modifyTab(tab);
    });
});

function modifyTab(tab) {
	tab.setAttribute("gkmodified", true);	// bruni: Add this attribute so we know 
											// which tabs weren't modified on launch.
								
	let tabCloseButtonElm = tab.querySelector(".tab-close-button");

	// Tab Small Attribute
	new ResizeObserver(() => {
		if (!tab.hasAttribute("pinned")) {
			// Hide contents
			let appearanceChoice = gkEras.getBrowserEra();
			let minWidth;

			if (appearanceChoice <= 11)
				minWidth = 31;
			else if (appearanceChoice <= 47)
				minWidth = 27;
			else if (appearanceChoice <= 58)
				minWidth = 31;

			let tabContent = tab.querySelector(".tab-content");
			if (tabContent.getBoundingClientRect().width <= minWidth)
				tab.setAttribute("minwidthreached", true);
			else
				tab.removeAttribute("minwidthreached");

			let tabIconStackElm = tab.querySelector(".tab-icon-stack");
			if (tab.hasAttribute("visuallyselected")) {
				// Hide icon if close button touches it
				if (Math.round(tabIconStackElm.getBoundingClientRect().left + tabIconStackElm.getBoundingClientRect().width + 4) >= Math.round(tabCloseButtonElm.getBoundingClientRect().left)) {
					tabIconStackElm.style.visibility = "hidden";
					tabIconStackElm.style.position = "absolute";
				} else {
					tabIconStackElm.style.visibility = null;
					tabIconStackElm.style.position = null;
				}
			} else {
				// Hide icon if overflowing
				if (Math.round(tab.getBoundingClientRect().left + tab.getBoundingClientRect().width) <= Math.round(tabIconStackElm.getBoundingClientRect().left + tabIconStackElm.getBoundingClientRect().width)) {
					tabIconStackElm.style.visibility = "hidden";
					tabIconStackElm.style.position = "absolute";
				} else {
					tabIconStackElm.style.visibility = null;
					tabIconStackElm.style.position = null;
				}
					
			}
		}
	}).observe(tab);

	// Tab Stack
	let tabStackElm = tab.querySelector(".tab-stack");

	// Tab Hitbox
	let tabHitboxElm = document.createElement("div");
	tabHitboxElm.classList.add("tab-hitbox");
	tabStackElm.prepend(tabHitboxElm);

	// Tab Glare
	let tabBackgroundElm = tab.querySelector(".tab-background");
	const tabBackgroundContainerElm = document.createXULElement("hbox");
	tabBackgroundContainerElm.classList.add("tab-background-container");
	tabBackgroundElm.prepend(tabBackgroundContainerElm);

	let tabGlareTemplate = `
	<hbox class="tab-glare-container">
		<hbox class="tab-glare"/>
	</hbox>
	`

	gkInsertElm.after(MozXULElement.parseXULToFragment(tabGlareTemplate), tabBackgroundElm);

	const glare = tab.querySelector(".tab-glare");

	tab.addEventListener("mousemove", (event) => {
		const rect = glare.parentNode.getBoundingClientRect();	// bruni: Get the parent container's position.
		const mouseX = event.clientX - rect.left; 				// 		  Adjust mouse position relative to parent.
		glare.style.left = `${mouseX}px`;
	});

	// Tab Mute
	let tabMuteButtonElm = document.createElement("div");
	tabMuteButtonElm.classList.add("tab-mute-button");
	tabMuteButtonElm.appendChild(document.createXULElement("image"));
	gkInsertElm.before(tabMuteButtonElm, tabCloseButtonElm);
	tabMuteButtonElm.addEventListener("click", () => {
		tab.toggleMuteAudio()
	});

	// Tab Sharing
	let tabSharingElm = document.createElement("div");
	tabSharingElm.classList.add("tab-sharing-icon-overlay");
	tabSharingElm.appendChild(document.createXULElement("image"));
	gkInsertElm.before(tabSharingElm, tabMuteButtonElm);
}

(function() {
	const onUnderflow = window.customElements.get('arrowscrollbox').prototype.on_underflow;
	window.customElements.get('arrowscrollbox').prototype.on_underflow = function(e) {
		if (this.id === "tabbrowser-arrowscrollbox") {
			e.preventDefault();
			return;
		}
		onUnderflow.call(this, e);
	};

	const onOverflow = window.customElements.get('arrowscrollbox').prototype.on_overflow;
	window.customElements.get('arrowscrollbox').prototype.on_overflow = function(e) {
		if (this.id === "tabbrowser-arrowscrollbox") {
			e.preventDefault();
			return;
		}
		onOverflow.call(this, e);
	};

	window.customElements.get('tabbrowser-tabs').prototype._initializeArrowScrollbox = function() {
		return;
	};
})();
