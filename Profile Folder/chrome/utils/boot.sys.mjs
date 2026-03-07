import { AppConstants } from "resource://gre/modules/AppConstants.sys.mjs";
import { loaderModuleLink, Pref, FileSystem, windowUtils, showNotification, startupFinished, restartApplication, escapeXUL, toggleScript } from "chrome://userchromejs/content/utils.sys.mjs";

const FX_AUTOCONFIG_VERSION = "0.10.8";
console.warn( "Browser is executing custom scripts via autoconfig" );

const APP_VARIANT = (() => {
  let is_tb = AppConstants.BROWSER_CHROME_URL.startsWith("chrome://messenger");
  return {
    THUNDERBIRD: is_tb,
    FIREFOX: !is_tb
  }
})();
const BRAND_NAME = AppConstants.MOZ_APP_DISPLAYNAME_DO_NOT_USE;

const BROWSERCHROME = (() => {
  if(APP_VARIANT.FIREFOX){
    return AppConstants.BROWSER_CHROME_URL
  }
  return "chrome://messenger/content/messenger.xhtml"
})();

const PREF_ENABLED = 'userChromeJS.enabled';
const PREF_SCRIPTSDISABLED = 'userChromeJS.scriptsDisabled';

function getDisabledScripts(){
  return Services.prefs.getStringPref(PREF_SCRIPTSDISABLED,"").split(",")
}

const MODULE_LOADER = new (function(){
  let compiledScript = null;
  let promise = ChromeUtils.compileScript("chrome://userchromejs/content/module_loader.mjs");
  promise.then(s => { compiledScript = s });
  
  this.ready = () => {
    if(compiledScript){
      return Promise.resolve(compiledScript)
    }
    return promise
  }
  return this
})();

class ScriptData {
  #preLoadedStyle;
  #chromeURI;
  #isRunning = false;
  #injectionFailed = false;
  constructor(leafName, headerText, noExec, isStyle){
    const hasLongDescription = (/^\/\/\ @long-description/im).test(headerText);
    this.filename = leafName;
    this.name = headerText.match(/\/\/ @name\s+(.+)\s*$/im)?.[1];
    this.charset = headerText.match(/\/\/ @charset\s+(.+)\s*$/im)?.[1];
    this.description = hasLongDescription
      ? headerText.match(/\/\/ @description\s+.*?\/\*\s*(.+?)\s*\*\//is)?.[1]
      : headerText.match(/\/\/ @description\s+(.+)\s*$/im)?.[1];
    this.version = headerText.match(/\/\/ @version\s+(.+)\s*$/im)?.[1];
    this.author = headerText.match(/\/\/ @author\s+(.+)\s*$/im)?.[1];
    this.icon = headerText.match(/\/\/ @icon\s+(.+)\s*$/im)?.[1];
    this.homepageURL = headerText.match(/\/\/ @homepageURL\s+(.+)\s*$/im)?.[1];
    this.downloadURL = headerText.match(/\/\/ @downloadURL\s+(.+)\s*$/im)?.[1];
    this.updateURL = headerText.match(/\/\/ @updateURL\s+(.+)\s*$/im)?.[1];
    this.optionsURL = headerText.match(/\/\/ @optionsURL\s+(.+)\s*$/im)?.[1];
    this.id = headerText.match(/\/\/ @id\s+(.+)\s*$/im)?.[1]
           || `${leafName.split('.uc.js')[0]}@${this.author||'userChromeJS'}`;
    this.isESM = this.filename.endsWith(".mjs");
    this.onlyonce = /\/\/ @onlyonce\b/.test(headerText);
    this.inbackground = this.filename.endsWith(".sys.mjs") || /\/\/ @backgroundmodule\b/.test(headerText);
    this.ignoreCache = /\/\/ @ignorecache\b/.test(headerText);
    this.manifest = headerText.match(/\/\/ @manifest\s+(.+)\s*$/im)?.[1];
    this.type = isStyle ? "style" : "script";
    this.styleSheetMode = isStyle 
      ? headerText.match(/\/\/ @stylemode\s+(.+)\s*$/im)?.[1] === "agent_sheet"
        ? "agent" : "author"
      : null;
    this.useFileURI = /\/\/ @usefileuri\b/.test(headerText);
    this.noExec = isStyle || noExec;
    
    if(this.inbackground || this.styleSheetMode === "agent" || (!isStyle && noExec)){
      this.regex = null;
      this.loadOrder = -1;
    }else{
      // Construct regular expression to use to match target document
      let match, rex = {
        include: [],
        exclude: []
      };
      let findNextRe = /^\/\/ @(include|exclude)\s+(.+)\s*$/gm;
      while (match = findNextRe.exec(headerText)) {
        rex[match[1]].push(
          match[2].replace(/^main$/i, BROWSERCHROME).replace(/\*/g, '.*?')
        );
      }
      if (!rex.include.length) {
        rex.include.push(BROWSERCHROME);
      }
      let exclude = rex.exclude.length ? `(?!${rex.exclude.join('$|')}$)` : '';
      this.regex = new RegExp(`^${exclude}(${rex.include.join('|') || '.*'})$`,'i');
      let loadOrder = headerText.match(/\/\/ @loadOrder\s+(\d+)\s*$/im)?.[1];
      this.loadOrder = Number.parseInt(loadOrder) || 10;
    }
    
    Object.freeze(this);
  }
  get isEnabled() {
    return getDisabledScripts().indexOf(this.filename) === -1;
  }
  get injectionFailed(){
    return this.#injectionFailed
  }
  get isRunning(){
    return this.#isRunning
  }
  setRunning(){
    this.#isRunning = true
  }
  markScriptInjectionFailure(){
    this.#injectionFailed = true
  }
  get chromeURI(){
    if(!this.#chromeURI){
      this.#chromeURI = this.type === "style"
        ? Services.io.newURI(`chrome://userstyles/skin/${this.filename}`)
        : Services.io.newURI(`chrome://userscripts/content/${this.filename}`)
    }
    return this.#chromeURI
  }
  get referenceURI(){
    return this.useFileURI && this.type === "style"
      ? FileSystem.convertChromeURIToFileURI(this.chromeURI)
      : this.chromeURI
  }
  get preLoadedStyle(){
    return this.#preLoadedStyle
  }
  static preLoadAuthorStyle(aStyle){
    if(aStyle.#injectionFailed){
      console.warn(`ignoring style preload for ${aStyle.filename} because it has already failed`);
      return false
    }
    let sss = Cc['@mozilla.org/content/style-sheet-service;1'].getService(Ci.nsIStyleSheetService);
    try{
      // Try to preload the file and store it
      aStyle.#preLoadedStyle = sss.preloadSheet(aStyle.referenceURI, sss.AUTHOR_SHEET);
    }catch(e){
      console.error(`Could not pre-load ${aStyle.filename}: ${e.name}`)
      return false
    }
    aStyle.#isRunning = true;
    return true
  }
  static tryLoadStyleIntoWindow(aStyle,win){
    if(aStyle.styleSheetMode !== "author" || !aStyle.regex?.test(win.location.href)){
      return
    }
    if(!aStyle.#preLoadedStyle){
      let success = ScriptData.preLoadAuthorStyle(aStyle);
      if(!success){
        return
      }
    }
    win.windowUtils.addSheet(aStyle.#preLoadedStyle,Ci.nsIDOMWindowUtils.AUTHOR_SHEET);
    return
  }
  static markScriptRunning(aScript){
    aScript.#isRunning = true;
  }
  static injectClassicScriptIntoGlobal(aScript,aGlobal){
    try{
      Services.scriptloader.loadSubScriptWithOptions(
        aScript.chromeURI.spec,
        {
          target: aGlobal,
          ignoreCache: aScript.ignoreCache
        }
      )
      aScript.#isRunning = true;
      return Promise.resolve(1)
    }catch(ex){
      aScript.#injectionFailed = true;
      return Promise.reject(ex)
    }
  }
  static registerScriptManifest(aScript){
    if(aScript.#isRunning){
      return
    }
    let cmanifest = FileSystem.getEntry(FileSystem.convertChromeURIToFileURI(`chrome://userscripts/content/${aScript.manifest}.manifest`));
    if(cmanifest.isFile()){
      Components.manager
      .QueryInterface(Ci.nsIComponentRegistrar).autoRegister(cmanifest.entry());
    }else{
      console.warn(`Script '${aScript.filename}' tried to register a manifest but requested file '${aScript.manifest}' doesn't exist`);
    }
  }
  static extractScriptHeader(aFSResult){
    return aFSResult.content()
      .match(/^\/\/ ==UserScript==\s*[\n\r]+(?:.*[\n\r]+)*?\/\/ ==\/UserScript==\s*/m)?.[0] || ""
  }
  static extractStyleHeader(aFSResult){
    return aFSResult.content()
      .match(/^\/\* ==UserScript==\s*[\n\r]+(?:.*[\n\r]+)*?\/\/ ==\/UserScript==\s*\*\//m)?.[0] || ""
  }
  static fromScriptFile(aFile){
    if(aFile.fileSize < 24){
      // Smaller files can't possibly have a valid header
      // This also means that we successfully generate a ScriptData for *folders* named "xx.uc.js"...
      return new ScriptData(aFile.leafName,"",aFile.fileSize === 0,false)
    }
    const result = FileSystem.readNSIFileSyncUncheckedWithOptions(aFile,{ metaOnly: true });
    const headerText = this.extractScriptHeader(result);
    // If there are less than 2 bytes after the header then we mark the script as non-executable. This means that if the file only has a header then we don't try to inject it to any windows, since it wouldn't do anything.
    return new ScriptData(aFile.leafName, headerText, headerText.length > aFile.fileSize - 2,false);
  }
  static fromStyleFile(aFile){
    if(aFile.fileSize < 24){
      // Smaller files can't possibly have a valid header
      return new ScriptData(aFile.leafName,"",true,true)
    }
    const result = FileSystem.readNSIFileSyncUncheckedWithOptions(aFile,{ metaOnly: true });
    return new ScriptData(aFile.leafName, this.extractStyleHeader(result), true,true);
  }
}

Pref.setIfUnset(PREF_ENABLED,true);
Pref.setIfUnset(PREF_SCRIPTSDISABLED,"");

// This is called if _previous_ startup was broken
function showgBrowserNotification(){
  Services.prefs.setBoolPref('userChromeJS.gBrowser_hack.enabled',true);
  showNotification(
  {
    label : "fx-autoconfig: Something was broken in last startup",
    type : "fx-autoconfig-gbrowser-notification",
    priority: "critical",
    buttons: [{
      label: "Why am I seeing this?",
      callback: (notification) => {
        notification.ownerGlobal.openWebLinkIn(
          "https://github.com/MrOtherGuy/fx-autoconfig#startup-error",
          "tab"
        );
        return false
      }
    }]
  }
  )
}

// This is called if startup somehow takes over 5 seconds
function maybeShowBrokenNotification(window){
  if(window.isFullyOccluded && "gBrowser" in window){
    console.log("Window was fully occluded, no need to panic")
    return
  }
  let aNotificationBox = window.gNotificationBox;
  aNotificationBox.appendNotification(
    "fx-autoconfig-broken-notification",
    {
      label: "fx-autoconfig: Startup might be broken",
      image: "chrome://browser/skin/notification-icons/popup.svg",
      priority: "critical"
    }
  );
}



function updateMenuStatus(event){
  const menu = event.target;
  if(!menu.id === "menuUserScriptsPopup"){
    return
  }
  let disabledScripts = getDisabledScripts();
  for(let item of menu.children){
    if(item.getAttribute("type") != "checkbox"){
      continue
    }
    if (disabledScripts.includes(item.dataset.filename)){
      item.removeAttribute("checked");
    }else{
      item.setAttribute("checked","true");
    }
  }
}

class UserChrome_js{
  constructor(){
    this.scripts = [];
    this.styles = [];
    this.SESSION_RESTORED = false;
    this.IS_ENABLED = Services.prefs.getBoolPref(PREF_ENABLED,false);
    this.isInitialWindow = true;
    this.initialized = false;
    this.init();
  }
  registerScript(aScript,isDisabled){
    if(aScript.type === "script"){
      this.scripts.push(aScript);
    }else{
      this.styles.push(aScript);
    }
    if(!isDisabled && aScript.manifest){
      try{
        ScriptData.registerScriptManifest(aScript);
      }catch(ex){
        console.error(new Error(`@ ${aScript.filename}`,{cause:ex}));
      }
    }
    return isDisabled
  }
  init(){
    if(this.initialized){
      return
    }
    loaderModuleLink.setup(this,FX_AUTOCONFIG_VERSION,AppConstants.MOZ_APP_DISPLAYNAME_DO_NOT_USE,APP_VARIANT,ScriptData);
    
    if(!this.IS_ENABLED){
      Services.obs.addObserver(this, 'domwindowopened', false);
      this.initialized = true;
      return
    }
    // gBrowserHack setup
    this.GBROWSERHACK_ENABLED = 
      (Services.prefs.getBoolPref("userChromeJS.gBrowser_hack.required",false) ? 2 : 0)
    + (Services.prefs.getBoolPref("userChromeJS.gBrowser_hack.enabled",false) ? 1 : 0);
    this.PERSISTENT_DOMCONTENT_CALLBACK = Services.prefs.getBoolPref("userChromeJS.persistent_domcontent_callback",false);
    const disabledScripts = getDisabledScripts();
    // load script data
    const scriptDir = FileSystem.getScriptDir();
    if(scriptDir.isDirectory()){
      for(let entry of scriptDir){
        if (/^[A-Za-z0-9]+.*(\.uc\.js|\.uc\.mjs|\.sys\.mjs)$/i.test(entry.leafName)) {
          let script = ScriptData.fromScriptFile(entry);
          if(this.registerScript(script,disabledScripts.includes(script.filename))){
            continue // script is disabled
          }
          if(script.inbackground){
            try{
              if(script.isESM){
                ChromeUtils.importESModule( script.chromeURI.spec );
                ScriptData.markScriptRunning(script);
              }else{
                console.warn(`Refusing to import legacy jsm style backgroundmodule script: ${script.filename} - convert to ES6 modules instead`);
              }
            }catch(ex){
              console.error(new Error(`@ ${script.filename}:${ex.lineNumber}`,{cause:ex}));
            }
          }
        }
      }
    }
    const styleDir = FileSystem.getStyleDir();
    if(styleDir.isDirectory()){
      for(let entry of styleDir){
        if (/^[A-Za-z0-9]+.*\.uc\.css$/i.test(entry.leafName)) {
          let style = ScriptData.fromStyleFile(entry);
          this.registerScript(style,!disabledScripts.includes(style.filename));
        }
      }
      this.addAgentStyles(this.styles.filter(style => style.styleSheetMode === "agent" && !disabledScripts.includes(style.filename)));
    }
    this.scripts.sort((a,b) => a.loadOrder - b.loadOrder);
    this.styles.sort((a,b) => a.loadOrder - b.loadOrder);
    Services.obs.addObserver(this, 'domwindowopened', false);
    this.initialized = true;

  }
  addAgentStyles(agentStyles){
    if(agentStyles.length > 0){
      let sss = Cc['@mozilla.org/content/style-sheet-service;1'].getService(Ci.nsIStyleSheetService);
      for(let style of agentStyles){
        try{
          sss.loadAndRegisterSheet(style.referenceURI, sss.AGENT_SHEET);
          ScriptData.markScriptRunning(style);
        }catch(e){
          console.error(`Could not load ${style.filename}: ${e.name}`);
        }
      }
    }
  }
  onDOMContent(document){
    const window = document.defaultView;
    if(!(/^chrome:(?!\/\/global\/content\/(commonDialog|alerts\/alert)\.xhtml)|about:(?!blank)/i).test(window.location.href)){
      // Don't inject scripts to modal prompt windows or notifications
      if(this.IS_ENABLED && this.styles.length > 0){
        const disabledScripts = getDisabledScripts();
        for(let style of this.styles){
          if(!disabledScripts.includes(style.filename)){
            ScriptData.tryLoadStyleIntoWindow(style,window)
          }
        }
      }
      return
    }
    ChromeUtils.defineLazyGetter(window,"UC_API",() =>
      ChromeUtils.importESModule("chrome://userchromejs/content/uc_api.sys.mjs")
    )
    if(this.IS_ENABLED){
      document.allowUnsafeHTML = false; // https://bugzilla.mozilla.org/show_bug.cgi?id=1432966
      
      // This is a hack to make gBrowser available for scripts.
      // Without it, scripts would need to check if gBrowser exists and deal
      // with it somehow. See bug 1443849
      const _gb = APP_VARIANT.FIREFOX && "_gBrowser" in window;
      if(this.GBROWSERHACK_ENABLED && _gb){
        window.gBrowser = window._gBrowser;
      }else if(_gb && this.isInitialWindow){
        this.isInitialWindow = false;
        let timeout = window.setTimeout(() => {
          maybeShowBrokenNotification(window);
        },5000);
        windowUtils.waitWindowLoading(window)
        .then(() => {
          // startup is fine, clear timeout
          window.clearTimeout(timeout);
        })
      }
      // Inject scripts to window
      const disabledScripts = getDisabledScripts();
      // Note, sys.mjs scripts have .regex = null
      const scriptsForWindow = this.scripts.filter(s => s.regex?.test(window.location.href));
      
      // .uc.mjs scripts are loaded via module loader
      if(scriptsForWindow.some(s => s.isESM && !disabledScripts.includes(s.filename))){
        MODULE_LOADER.ready().then(m => m.executeInGlobal(window));
      }
      
      for(let script of scriptsForWindow){
        if(script.isESM || disabledScripts.includes(script.filename) || script.injectionFailed || script.noExec || (script.onlyonce && script.isRunning)) {
          continue
        }
        ScriptData.injectClassicScriptIntoGlobal(script,window)
      }
      for(let style of this.styles){
        if(!disabledScripts.includes(style.filename)){
          ScriptData.tryLoadStyleIntoWindow(style,window)
        }
      }
    }
    if(window.isChromeWindow){
      const menu = document.querySelector(
      APP_VARIANT.FIREFOX ? "#menu_openDownloads" : "menuitem#addressBook");
      if(menu){
        menu.parentNode.addEventListener("popupshown",
          (ev) => this.generateScriptMenuItemsIfNeeded(ev.target.ownerDocument),
          {once: true}
        );
      }
    }
  }

  // Add simple script menu to menubar tools popup
  generateScriptMenuItemsIfNeeded(aDoc){
    {
      let menu = aDoc.getElementById("userScriptsMenu");
      if(menu){
        return menu
      }
    }
    const popup = aDoc.querySelector(
      APP_VARIANT.FIREFOX ? "#menu_openDownloads" : "menuitem#addressBook")?.parentNode;

    if(aDoc.location.href !== BROWSERCHROME || !popup){
      return null
    }
    const window = aDoc.ownerGlobal;
    
    window.MozXULElement.insertFTLIfNeeded("toolkit/about/aboutSupport.ftl");
    let menuFragment = window.MozXULElement.parseXULToFragment(`
      <menu id="userScriptsMenu" label="userScripts">
        <menupopup id="menuUserScriptsPopup">
          <menuseparator></menuseparator>
          <menuitem id="userScriptsMenu-OpenFolder" label="Open folder"></menuitem>
          <menuitem id="userScriptsMenu-Restart" label="Restart" tooltiptext="Toggling scripts requires restart"></menuitem>
          <menuitem id="userScriptsMenu-ClearCache" label="Restart and clear startup cache" tooltiptext="Toggling scripts requires restart"></menuitem>
        </menupopup>
      </menu>
    `);
    const itemsFragment = window.MozXULElement.parseXULToFragment("");
    for(let script of this.scripts){
      UserChrome_js.appendScriptMenuitemToFragment(window,itemsFragment,script);
    }
    if(this.styles.length){
      itemsFragment.append(aDoc.createXULElement("menuseparator"));
      for(let style of this.styles){
        UserChrome_js.appendScriptMenuitemToFragment(window,itemsFragment,style);
      }
    }
    if(!this.IS_ENABLED){
      itemsFragment.append(window.MozXULElement.parseXULToFragment('<menuitem label="&lt;fx-autoconfig is disabled&gt;" disabled="true"></menuitem>'));
    }
    let menupopup = menuFragment.getElementById("menuUserScriptsPopup");
    menupopup.prepend(itemsFragment);
    popup.prepend(menuFragment);
    menupopup.addEventListener("popupshown",updateMenuStatus);
    menupopup.addEventListener("command",ev => {
      switch(ev.target.id){
        case "userScriptsMenu-OpenFolder":
          FileSystem.getScriptDir().showInFileManager();
          break;
        case "userScriptsMenu-Restart":
          restartApplication(false);
          break;
        case "userScriptsMenu-ClearCache":
          restartApplication(true);
          break;
        default:
          if(ev.target.dataset.filename){
            toggleScript(ev.target.dataset.filename);
          }
      }
    });
    aDoc.l10n.formatValues(["restart-button-label","clear-startup-cache-label","show-dir-label"])
    .then(values => {
      let baseTitle = `${values[0]} ${BRAND_NAME}`;
      aDoc.getElementById("userScriptsMenu-Restart").setAttribute("label", baseTitle);
      aDoc.getElementById("userScriptsMenu-ClearCache").setAttribute("label", values[1].replace("…","") + " & " + baseTitle);
      aDoc.getElementById("userScriptsMenu-OpenFolder").setAttribute("label",values[2])
    });
    return popup.querySelector("#userScriptsMenu");
  }
  static appendScriptMenuitemToFragment(aWindow,aFragment,aScript){
    aFragment.append(
      aWindow.MozXULElement.parseXULToFragment(`
        <menuitem type="checkbox"
                  label="${escapeXUL(aScript.name || aScript.filename)}"
                  data-filename="${escapeXUL(aScript.filename)}"
                  checked="true">
        </menuitem>
    `)
    );
    return
  }
  observe(aSubject, aTopic, aData) {
    aSubject.addEventListener('DOMContentLoaded', this, {once: !this.PERSISTENT_DOMCONTENT_CALLBACK, capture: true});
  }
  
  handleEvent(aEvent){
    switch (aEvent.type){
      case "DOMContentLoaded":
        this.onDOMContent(aEvent.originalTarget);
        break;
      default:
        console.warn(new Error("unexpected event received",{cause:aEvent}));
    }
  }
  
}

const _ucjs = !Services.appinfo.inSafeMode && new UserChrome_js();
_ucjs && startupFinished().then(() => {
  _ucjs.SESSION_RESTORED = true;
  _ucjs.GBROWSERHACK_ENABLED === 2 && showgBrowserNotification();
  if(Pref.setIfUnset("userChromeJS.firstRunShown",true)){
    showNotification({
      type: "fx-autoconfig-installed",
      label: `fx-autoconfig: ${BRAND_NAME} is being modified with custom autoconfig scripting`
    });
  }
});
