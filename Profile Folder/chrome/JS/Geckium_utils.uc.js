// ==UserScript==
// @name        Geckium - Utils
// @description Utilities for making coding easier. Taken from BeautyFox.
// @author      AngelBruni
// @loadorder   1
// ==/UserScript==

const prefType = {
	appearance: "Geckium.appearance."
}

const prefMap = {
	appearance: prefType.appearance + "choice"
}

const docElm = document.documentElement;

function setAttributes(elm, attrs) {
	for (var key in attrs) {
		elm.setAttribute(key, attrs[key]);
	}
}

function insertBefore(newNode, existingNode) {
	existingNode.parentNode.insertBefore(newNode, existingNode);
}

function insertAfter(newNode, existingNode) {
	existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

function pref(prefName) {
    return {
        set: {
            bool: function (value) { Services.prefs.setBoolPref(prefName, value); },
            int: function (value) { Services.prefs.setIntPref(prefName, value); },
            string: function (string) { Services.prefs.setStringPref(prefName, string); }
        },
        tryGet: {
            bool: function () { try { return Services.prefs.getBoolPref(prefName); } catch (e) { console.log('Setting not found: '+ e) } },
            int: function () { try { return Services.prefs.getIntPref(prefName); } catch (e) { console.log('Setting not found: '+ e) } },
            string: function () { try { return Services.prefs.getStringPref(prefName); } catch (e) { console.log('Setting not found: '+ e) } }
        }
    }
};

function openWindow(windowName, features) {
	window.openDialog('chrome://userchrome/content/windows/'+ windowName +'/index.xhtml', '', features);
}

const appearanceChanged = new CustomEvent("appearanceChanged");