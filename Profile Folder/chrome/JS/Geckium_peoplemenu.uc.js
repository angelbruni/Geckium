// ==UserScript==
// @name        Geckium - People Menu
// @author		ImSwordQueen
// @loadorder   4
// ==/UserScript==

(function() {
    'use strict';

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


    window.addEventListener('load', function() {
        modifyButtons();
    });

})();
