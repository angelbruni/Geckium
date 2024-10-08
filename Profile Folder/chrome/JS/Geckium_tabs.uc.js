// ==UserScript==
// @name			Geckium - Tabs
// @author			AngelBruni, blackle
// @include			main
// ==/UserScript==

_ucUtils.windowIsReady(window).then(() => {
	// Modify currently existing tabs
	document.querySelectorAll(`.tabbrowser-tab:not([gkmodified="true"])`).forEach(existingTab => {
		modifyTab(existingTab);
	});		

	// Get a reference to the TabContainer, which holds all the tabs in the browser
    let tabContainer = gBrowser.tabContainer;

    tabContainer.addEventListener('TabOpen', function(event) {
        // The newly created tab is accessible via event.target
        let tab = event.target;

		modifyTab(tab);
    });
});

function modifyTab(tab) {
	tab.setAttribute("gkmodified", true);	// bruni: Add this attribute so we know 
											// which tabs weren't modified on launch.

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
