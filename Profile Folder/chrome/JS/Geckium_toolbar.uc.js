// ==UserScript==
// @name        Geckium - Toolbar Adjustments
// @author      AngelBruni
// @loadorder   4
// ==/UserScript==

UC_API.Runtime.startupFinished().then(() => {
	// Maybe temporary fix to the forced vertical spacer...?? Why did you do this Mozilla...
	let forcedSpacer = document.querySelector(`#vertical-spacer`);
	if (forcedSpacer) {
		forcedSpacer.setAttribute("removable", true);
		CustomizableUI.removeWidgetFromArea("vertical-spacer");
	}
});