// ==UserScript==
// @name        Geckium - Appearance
// @author		AngelBruni
// @description	Settings the desired appearance chosen by the user accordingly.
// @loadorder   2
// ==/UserScript==

const appearanceMap = {
	0: "five",
	1: "eleven",
	2: "twentyone",
	3: "fortynine"
};

function applyApperance(choice) {
	// bruni: We get the first and last available keys so
	//		  we don't hardcode the values in the code.
	const mapKeys = Object.keys(appearanceMap).map(Number);
	const firstKey = Math.min(...mapKeys);
	const lastKey = Math.max(...mapKeys);

	const prefChoice = pref(prefMap.appearance).tryGet.int();

	// bruni: Let's remove all appearance attributes first.
	const pastAttrs = docElm.getAttributeNames();
    pastAttrs.forEach(attr => {
        if (attr.startsWith("geckium-"))
            docElm.removeAttribute(attr);
    });

	// bruni: Let's apply the correct appearance attributes.
	if (typeof choice == "undefined") {
		if (prefChoice > lastKey) {
			choice = lastKey;
		} else if (prefChoice < firstKey || prefChoice == null) {
			choice = firstKey;
		} else {
			choice = pref(prefMap.appearance).tryGet.int();
		}
	}

	for (let i = 0; i <= choice; i++) {
        if (appearanceMap[i]) {
            const attr = "geckium-" + appearanceMap[i];
            docElm.setAttribute(attr, "");
        }
    }

	// bruni: Let's also apply the attribute specific to the
	//		  user choice so we can make unique styles for it.
	docElm.setAttribute("geckium-choice", appearanceMap[choice]);
	
	dispatchEvent(appearanceChanged);

	console.log("Applied appearance " + choice + ".");
}
applyApperance();

// bruni: Automatically apply appearance when it detecs changes in the pref.
const appearanceObserver = {
	observe: function (subject, topic, data) {
		if (topic == "nsPref:changed")
			applyApperance();
	}
};
Services.prefs.addObserver(appearanceMap.appearance, appearanceObserver, false)