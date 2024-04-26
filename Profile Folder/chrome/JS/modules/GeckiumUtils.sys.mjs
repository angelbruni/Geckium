export class gkPrefUtils {
	static set(prefName) {
		return {
			bool(value) { 
				Services.prefs.setBoolPref(prefName, value);
			},
			int(value) { 
				Services.prefs.setIntPref(prefName, value);
			},
			string(value) { 
				Services.prefs.setStringPref(prefName, value);
			}
		}
	}

	static tryGet(prefName) {
		return {
			get bool() {
				try {
					return Services.prefs.getBoolPref(prefName);
				} catch (e) {
					//console.log('Setting not found: ', e)
					return false;
				}
			},
			get int() {
				try {
					return parseInt(Services.prefs.getIntPref(prefName));
				} catch (e) {
					//console.log('Setting not found: ', e)
					return 0;
				}
			},
			get string() {
				try {
					return Services.prefs.getStringPref(prefName);
				} catch (e) {
					//console.log('Setting not found: ', e)
					return "";
				}
			}
		}
	}

	static toggle(prefName) {
		if (gkPrefUtils.tryGet(prefName).bool == true)
			gkPrefUtils.set(prefName).bool(false);
		else
			gkPrefUtils.set(prefName).bool(true);
	}
}

export class gkInsertElm {
	static before(newNode, existingNode) {
		existingNode.parentNode.insertBefore(newNode, existingNode);
	}
	
	static after(newNode, existingNode) {
		existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
	}
}

export function gkSetAttributes(elm, attrs) {
	for (var key in attrs) {
		elm.setAttribute(key, attrs[key]);
	}
}