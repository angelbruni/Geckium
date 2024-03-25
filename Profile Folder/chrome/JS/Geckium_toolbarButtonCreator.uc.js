// ==UserScript==
// @name        Geckium - Toolbarbutton Creator
// @author      AngelBruni
// @loadorder   3
// ==/UserScript==

function createToolbarbutton(id, delegatesanchor, label, removable, overflows, area) {
	CustomizableUI.createWidget({
		id: id + "-button",
		removable: removable,
		label: label,
		tooltiptext: label,
		overflows: overflows,
		defaultArea: area,

		onCreated: function(toolbarButton) {
			if (!delegatesanchor)
				toolbarButton.removeAttribute("delegatesanchor")
		}
	});
}

function createMenu(id, delegatesanchor, label, removable, overflows, area, position, object) {
	const parentID = "menu_" + id + "Popup";

	const alreadyExists = document.getElementById(id + "-button");

	let toolbarButton;

	if (alreadyExists) {
		console.warn("toolbarbutton already exists.")

		toolbarButton = alreadyExists;
	} else {
		console.warn("toolbarbutton does not exist.")

		createToolbarbutton(id, delegatesanchor, label, removable, overflows, area);

		toolbarButton = document.getElementById(id + "-button")
	}
	
	toolbarButton.setAttribute("type", "menu");

	const menuPopUp = document.createXULElement("menupopup")
	setAttributes(menuPopUp, {
		"id": parentID,
		"position": position
	});
	
	toolbarButton.appendChild(menuPopUp);
	
	createMenuItemFromObject(parentID, object);
}

function createMenuItem(parentID, type, id, checkbox, click, command, label, accesskey, acceltext) {
	console.log(parentID, type, id, checkbox, click, command, label, accesskey, acceltext)

	let menuItem;

	switch (type) {
		case "menu":
			menuItem = document.createXULElement("menu");
			setAttributes(menuItem, {
				"id": id + "-menu",
			});
			break;
		case "menuitem":
			menuItem = document.createXULElement("menuitem");
			setAttributes(menuItem, {
				"id": "menu_" + id,
			});
			break;
		case "menuseparator":
			menuItem = document.createXULElement("menuseparator");
			break;
		default:
			return;
	}


	if (type == "menu" || type == "menuitem") {
		setAttributes(menuItem, {
			"label": label,
		});

		if (checkbox)
			menuItem.setAttribute("type", "checkbox");
			
		if (click)
			menuItem.setAttribute("onclick", click);

		if (command) {
			if (typeof command === 'string') 
				menuItem.setAttribute("command", command);
			else
				menuItem.addEventListener("command", command);
		}

		if (accesskey)
			menuItem.setAttribute("accesskey", accesskey);

		if (acceltext)
			menuItem.setAttribute("acceltext", acceltext);
	} 

	const parent = document.getElementById(parentID);
	if (parent.tagName == "menupopup") {
		parent.appendChild(menuItem);
	} else if (parent.tagName == "menu") {
		if (parent.querySelector("menupopup")) {
			parent.querySelector("menupopup").appendChild(menuItem);
		} else {
			const menuPopUp = document.createXULElement("menupopup");
			parent.appendChild(menuPopUp);
			menuPopUp.appendChild(menuItem);
		}
	}
}

function createMenuItemFromObject(parentID, object) {
	const parent = document.getElementById(parentID);

	function adjustAccelText() {
		const menuAccelContainers = parent.querySelectorAll("menuitem[acceltext] > .menu-accel-container");
		
		if (!parent.querySelector("menuitem[acceltext] > .menu-accel-container[style*='min-width']")) {
			let maxWidth = 0;
			menuAccelContainers.forEach(container => {
				const width = container.clientWidth;
				maxWidth = Math.max(maxWidth, width);
				container.style.minWidth = `${maxWidth}px`;
			});
		}
	}

	parent.addEventListener("popupshowing", adjustAccelText)
	if (object.properties) {
        setAttributes(parent, {
            "onpopupshowing": object.properties.onpopup,
            "onpopuphidden": object.properties.onpopup,
        });
    }

    for (let key in object) {
		if (key !== 'properties') {
			if (Object.keys(object[key]).length === 0 && object[key].constructor === Object) {
				// If the item is empty, create a menu separator.
				createMenuItem(parentID, "menuseparator");
			} else if (object[key].hasOwnProperty('items')) {
				// If it has "items", it's a submenu.
				createMenuItem(parentID, "menu", object[key].id, object[key].checkbox, object[key].click, object[key].command, object[key].label, object[key].accesskey, object[key].acceltext);
				for (let subItem of object[key].items) {
					createMenuItemFromObject(object[key].id + "-menu", subItem);
				}
			} else {
				// Default: create a regular menu item.
				createMenuItem(parentID, "menuitem", object[key].id, object[key].checkbox, object[key].click, object[key].command, object[key].label, object[key].accesskey, object[key].acceltext);
			}
		}
    }
}

const menu_chrome = {
	properties: {
		onpopup: "bookmarksBarStatus();",
	},
	1: {
		id: "newTab",
		label: "New tab",
		command: "cmd_newNavigatorTab",
		acceltext: "Ctrl+T",
	},
	2: {
		id: "newWindow",
		label: "New window",
		command: "cmd_newNavigator",
		acceltext: "Ctrl+N",
	},
	3: {
		id: "newIncognitoWindow",
		label: "New incognito window",
		command: "Tools:PrivateBrowsing",
		acceltext: "Ctrl+Shift+N",
	},
	4: {},
	5: {
		id: "alwaysShowBookmarksBar",
		checkbox: true,
		label: "Always show bookmarks bar",
		command: onViewToolbarCommand,
		acceltext: "Ctrl+B",
	},
	6: {
		id: "fullScreen",
		label: "Full screen",
		click: "BrowserFullScreen();",
		acceltext: "F11",
	},
	7: {},
	8: {
		id: "history",
		label: "History",
		command: "Browser:ShowAllHistory",
		acceltext: "Ctrl+H",
	},
	9: {
		id: "bookmarkManager",
		label: "Bookmark manager",
		command: "Browser:ShowAllBookmarks",
		acceltext: "Ctrl+Shift+B",
	},
	10: {
		id: "downloads",
		label: "Downloads",
		command: "Tools:Downloads",
		acceltext: "Ctrl+J",
	},
	11: {
		id: "extensions",
		label: "Extensions",
		command: "Tools:Addons"
	},
	12: {},
	13: {
		id: "setupSync",
		label: "Set up sync...",
		click: "gSync.openPrefsFromFxaMenu('sync_settings', this);",
	},
	14: {},
	15: {
		id: "options",
		label: "Options",
		click: "openPreferences()",
	},
	16: {
		id: "aboutGoogleChrome",
		label: "About Google Chrome",
		click: "openWindow('aboutChromium', 'chrome,centerscreen,dependent,modal')",
	},
	17: {
		id: "help",
		label: "Help",
		click: "openHelpLink('firefox-help')",
		acceltext: "F1",
	},
	18: {},
	19: {
		id: "exit",
		label: "Exit",
		command: "cmd_quitApplication",
	},
}

const menu_page = {
	/*1: {
		id: "createApplicationShortcuts",
		label: "Create application shortcuts...",
	},
	2: {},*/
	3: {
		id: "cut",
		label: "Cut",
		command: "cmd_cut",
		acceltext: "Ctrl+X",
	},
	4: {
		id: "copy",
		label: "Copy",
		command: "cmd_copy",
		acceltext: "Ctrl+C",
	},
	5: {
		id: "paste",
		label: "Paste",
		command: "cmd_paste",
		acceltext: "Ctrl+V",
	},
	6: {},
	7: {
		id: "find",
		label: "Find...",
		command: "cmd_find",
		acceltext: "Ctrl+F",
	},
	8: {
		id: "savePageAs",
		label: "Save page as...",
		command: "Browser:SavePage",
		acceltext: "Ctrl+S",
	},
	9: {
		id: "print",
		label: "Print...",
		command: "cmd_print",
		acceltext: "Ctrl+P",
	},
	10: {},
	11: {
		id: "zoom",
		label: "Zoom",
		items: [
			{
				1: {
					id: "larger",
					label: "Larger",
					command: "cmd_fullZoomEnlarge",
					acceltext: "Ctrl++",
				},
				2: {
					id: "normal",
					label: "Normal",
					command: "cmd_fullZoomReset",
					acceltext: "Ctrl+0",
				},
				3: {
					id: "smaller",
					label: "Smaller",
					command: "cmd_fullZoomReduce",
					acceltext: "Ctrl+-",
				},
			}
		]
	},
	/*12: {
		id: "encoding",
		label: "Encoding",
		items: [
			{
				1: {
					id: "idkYet",
					label: "idk",
				}
			}
		]
	},*/
	13: {},
	14: {
		id: "developer",
		label: "Developer",
		items: [
			{
				1: {
					id: "viewSource",
					label: "View source",
					click: "BrowserViewSource(gContextMenu.browser);",
					acceltext: "Ctrl+U",
				},
				/*2: {
					id: "developerTools",
					label: "Developer tools",
					acceltext: "Ctrl+Shift+I",
				},
				3: {
					id: "javaScriptConsole",
					label: "JavaScript console",
					acceltext: "Ctrl+Shift+J",
				},*/
				4: {
					id: "taskManager",
					label: "Task Manager",
					command: "View:AboutProcesses",
					acceltext: "Shift+Esc",
				},
			}
		]
	},
	15: {},
	16: {
		id: "reportBugOrBrokenWebsite",
		label: "Report bug or broken website...",
		click: "openTrustedLinkIn('https://bugzilla.mozilla.org/home', 'tab');",

	},
}

window.addEventListener("load", function() {
	createMenu("page", false, "Control the current page", false, false, CustomizableUI.AREA_NAVBAR, "bottomright topright", menu_page);
	createMenu("chrome", false, "Customize and control Google Chrome", false, false, CustomizableUI.AREA_NAVBAR, "bottomright topright", menu_chrome);
})