window.addEventListener("load", function() {
  const chromeRedirects = {
    "chrome://settings": "about:preferences",
    "chrome://extensions": "about:addons",
    "chrome://history": "about:history",
    "chrome://downloads": "about:downloads",
    "chrome://bookmarks": "about:bookmarks",
  };
  const chromeDirect = {
    "chrome://dino": "chrome://dino/content/dino.html",
  };
  const reverseRedirects = {};
  for (let [chrome, about] of Object.entries(chromeRedirects)) {
    reverseRedirects[about] = chrome;
  }
  let lastTypedChrome = null;
  function spoofURL(url) {
    if (lastTypedChrome) {
      gURLBar.value = lastTypedChrome;
      lastTypedChrome = null;
      return;
    }
    if (url.startsWith("about:") && !url.startsWith("about:newtab") && !url.startsWith("about:blank") && !url.startsWith("about:home")) {
      gURLBar.value = reverseRedirects[url] || url.replace("about:", "chrome://");
    }
  }
  setTimeout(() => spoofURL(gBrowser.selectedBrowser.currentURI.spec), 500);
  gBrowser.addTabsProgressListener({
    onLocationChange(browser, progress, request, location) {
      if (browser === gBrowser.selectedBrowser) {
        spoofURL(location.spec);
      }
    }
  });
  gBrowser.tabContainer.addEventListener("TabSelect", function() {
    setTimeout(() => spoofURL(gBrowser.selectedBrowser.currentURI.spec), 500);
  });
  gURLBar.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      let val = gURLBar.value.trim();
      if (val.startsWith("chrome://")) {
        e.preventDefault();
        e.stopPropagation();
        gURLBar.view.close();
        if (chromeDirect[val]) {
          lastTypedChrome = val;
          gBrowser.loadURI(Services.io.newURI(chromeDirect[val]), {
            triggeringPrincipal: Services.scriptSecurityManager.getSystemPrincipal()
          });
        } else {
          let real = chromeRedirects[val] || val.replace("chrome://", "about:");
          lastTypedChrome = val;
          gBrowser.loadURI(Services.io.newURI(real), {
            triggeringPrincipal: Services.scriptSecurityManager.getSystemPrincipal()
          });
        }
        gBrowser.selectedBrowser.focus();
      }
    }
  }, true);
});
