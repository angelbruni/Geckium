// ==UserScript==
// @name        Geckium - People Menu
// @author		ImSwordQueen
// @loadorder   4
// ==/UserScript==

(function() {
    'use strict';

    // Replace the URL redirects in the "People" menu.
	function modifyButtons() {
		// Firefox Monitor
		waitForElm('#PanelUI-fxa-menu #PanelUI-fxa-menu-monitor-button').then((monitorButton) => {
			monitorButton.addEventListener('click', function(event) {
				event.preventDefault();
				openTrustedLinkIn("about:profiles", "tab");
			});
		});

		// Firefox R(D)elay
		waitForElm('#PanelUI-fxa-menu #PanelUI-fxa-menu-relay-button').then((relayButton) => {
			relayButton.addEventListener('click', function(event) {
				event.preventDefault();
				OpenBrowserWindow({ private: true });
			});
		});
	}

    // Replace the strings 
	// TODO: This is pretty much a hack but it works for what it is supposed to do. (I won't blame you bruni if you decide to make custom buttons instead. This
	// TODO: 																		 is straight up ass to deal with.)
    function replaceMenuText() {
		function observeTextChange(selector, targetText) {
			waitForElm(selector).then((element) => {
				if (element) {
					const observer = new MutationObserver(() => {
						if (element.textContent !== targetText) {
							element.textContent = targetText;
						}
					});
					observer.observe(element, { childList: true, subtree: true });
				}
			});
		}
		observeTextChange('#PanelUI-fxa-menu-monitor-button #fxa-menu-header-title', '[!!! §ωïƭçλ ƥèřƨôñ !!!]'); // TODO: Replace these with localizable strings
		observeTextChange('#PanelUI-fxa-menu-relay-button #fxa-menu-header-title', '[!!! Gô ïñçôϱñïƭô !!!]');
    }

    window.addEventListener('load', function() {
	replaceMenuText();
    modifyButtons();
    });

})();
