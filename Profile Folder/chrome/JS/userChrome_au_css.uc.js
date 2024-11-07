// ==UserScript==
// @name           userChrome_author_css
// @namespace      userChrome_Author_Sheet_CSS
// @version        0.0.6
// @description    Load userChrome.au.css file as author sheet from resources folder using chrome: uri. The file is loaded only into the document where this script runs which by default is browser.xhtml
// @onlyonce
// ==/UserScript==

(function () {
  // Store and preload the author style sheet
  const sss = Cc['@mozilla.org/content/style-sheet-service;1'].getService(Ci.nsIStyleSheetService);
  const sheet = sss.preloadSheet(makeURI("chrome://userChrome/content/userChrome.au.css"), sss.AUTHOR_SHEET);
  // Inject the preloaded style sheet to current window
  try{
    window.windowUtils.addSheet(sheet,Ci.nsIDOMWindowUtils.AUTHOR_SHEET);
  }catch(e){
    console.error(`Could not pre-load userChrome.au.css: ${e.name}`)
  }
  // Register a window created callback that injects the preloaded style sheet into that window global
  UC_API.Windows.onCreated(win => {
    try{
      win.windowUtils.addSheet(sheet,Ci.nsIDOMWindowUtils.AUTHOR_SHEET);
    }catch(e){
      console.error(`Could not pre-load userChrome.au.css: ${e.name}`)
    }
  });
})();