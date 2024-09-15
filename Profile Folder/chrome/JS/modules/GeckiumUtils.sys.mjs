export class gkColorUtils {
	static HSLtoFloat(colorInHSL) {
		const floatH = colorInHSL[0] / 360;
		const floatS = colorInHSL[1] / 100;
		const floatL = colorInHSL[2] / 100;

		return [floatH, floatS, floatL];
	}

	static floatToHSL(floatFromHSL) {
		const colorH = floatFromHSL[0] * 360;
		const colorS = floatFromHSL[1] * 100;
		const colorL = floatFromHSL[2] * 100;

		return [colorH, colorS, colorL];
	}
}

export class gkPrefUtils {
	static set(pref) {
		return {
			bool(value) { 
				Services.prefs.setBoolPref(pref, value);
			},
			int(value) { 
				Services.prefs.setIntPref(pref, value);
			},
			string(value) { 
				Services.prefs.setStringPref(pref, value);
			}
		}
	}

	static tryGet(pref) {
		return {
			get bool() {
				try {
					return Services.prefs.getBoolPref(pref);
				} catch (e) {
					//console.log('Setting not found: ', e)
					return false;
				}
			},
			get int() {
				try {
					return parseInt(Services.prefs.getIntPref(pref));
				} catch (e) {
					//console.log('Setting not found: ', e)
					return 0;
				}
			},
			get string() {
				try {
					return Services.prefs.getStringPref(pref);
				} catch (e) {
					//console.log('Setting not found: ', e)
					return "";
				}
			}
		}
	}

	static toggle(pref) {
		if (this.tryGet(pref).bool == true)
			this.set(pref).bool(false);
		else
			this.set(pref).bool(true);
	}

	static delete(pref) {
		try {
			Services.prefs.clearUserPref(pref);
			return true;
		} catch (e) {
			return false;
		}
	}

	static prefExists(pref) {
		try {
			return Services.prefs.getPrefType(pref) != 0;
		} catch (e) {
			return false;
		}
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