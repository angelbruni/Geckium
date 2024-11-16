// ==UserScript==
// @name        Geckium - People Menu
// @author		ImSwordQueen
// @loadorder   4
// ==/UserScript==

(function() {
    'use strict';

    // Retry function to ensure elements exist before trying to add event listeners
    function waitForElement(selector, callback, maxRetries = 20, delay = 500) {
        let retries = 0;

        const interval = setInterval(function() {
            const element = document.querySelector(selector);
            if (element || retries >= maxRetries) {
                clearInterval(interval);
                if (element) {
                    callback(element);
                } else {
                }
            }
            retries++;
        }, delay);
    }

    function modifyButtons() {
        // Firefox Monitor
        waitForElement('#PanelUI-fxa-menu #PanelUI-fxa-menu-monitor-button', function(monitorButton) {

                monitorButton.addEventListener('click', function(event) {
                    event.preventDefault();
                    openTrustedLinkIn("about:profiles", "tab")
                });
        });

        // Firefox R(D)elay
        waitForElement('#PanelUI-fxa-menu #PanelUI-fxa-menu-relay-button', function(relayButton) {

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
