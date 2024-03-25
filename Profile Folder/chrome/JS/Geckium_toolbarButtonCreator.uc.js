// ==UserScript==
// @name        Geckium - Toolbarbutton Creator
// @author      AngelBruni
// @loadorder   1
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

function createMenuItem(parentID, type, id, click, label, accesskey, acceltext) {
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
		
		if (click)
			menuItem.setAttribute("onclick", click);

		if (accesskey)
			menuItem.setAttribute("accesskey", accesskey);

		if (acceltext)
			menuItem.setAttribute("acceltext", acceltext);
	} 

	const parent = document.getElementById(parentID);
	if (parent.tagName == "menupopup") {
		parent.appendChild(menuItem);
	} else if (parent.tagName == "menu" && parent.tagName == "toolbarbutton") {
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
    for (let key in object) {
        if (Object.keys(object[key]).length === 0 && object[key].constructor === Object) {
            // If the item is empty, create a menu separator.
            createMenuItem(parentID, "menuseparator");
        } else if (object[key].hasOwnProperty('items')) {
            // If it has "items", it's a submenu.
            createMenuItem(parentID, "menu", object[key].id, null, object[key].label, object[key].accesskey, object[key].acceltext);
            for (let subItem of object[key].items) {
                createMenuItemFromObject(object[key].id + "-menu", subItem);
            }
        } else {
            // Default: create a regular menu item.
            createMenuItem(parentID, "menuitem", object[key].id, object[key].click, object[key].label, object[key].accesskey, object[key].acceltext);
        }
    }
}

const menu_chrome = {
	1: {
		id: "newtab",
		label: "New tab",
		click: "BrowserOpenTab();",
		acceltext: "Ctrl+T",
	},
	2: {
		id: "newwindow",
		label: "New window",
		click: "OpenBrowserWindow();",
		acceltext: "Ctrl+N",
	},
	3: {
		id: "newincognitowindow",
		label: "New incognito window",
		click: "OpenBrowserWindow({private: true});",
		acceltext: "Ctrl+Shift+N",
	},
	4: {},
	5: {
		id: "alwaysshowbookmarksbar",
		label: "Always show bookmarks bar",
		acceltext: "Ctrl+B",
	},
	6: {
		id: "fullscreen",
		label: "Full screen",
		click: "BrowserFullScreen();",
		acceltext: "F11",
	},
	7: {},
	8: {
		id: "history",
		label: "History",
		acceltext: "Ctrl+H",
	},
	9: {
		id: "bookmarkmanager",
		label: "Bookmark manager",
		acceltext: "Ctrl+Shift+B",
	},
	10: {
		id: "downloads",
		label: "Downloads",
		acceltext: "Ctrl+J",
	},
	11: {
		id: "extensions",
		label: "Extensions",
	},
	12: {},
	13: {
		id: "setupsync",
		label: "Set up sync...",
	},
	14: {},
	15: {
		id: "options",
		label: "Options",
	},
	16: {
		id: "aboutgooglechrome",
		label: "About Google Chrome",
		click: "openWindow('aboutChromium', 'chrome,centerscreen,dependent,modal')",
	},
	17: {
		id: "help",
		label: "Help",
		acceltext: "F1",
	},
	18: {},
	19: {
		id: "exit",
		label: "Exit"
	},
}

const menu_page = {
	1: {
		id: "createapplicationshortcuts",
		label: "Create application shortcuts...",
	},
	2: {},
	3: {
		id: "cut",
		label: "Cut",
		acceltext: "Ctrl+X",
	},
	4: {
		id: "copy",
		label: "Copy",
		acceltext: "Ctrl+C",
	},
	5: {
		id: "paste",
		label: "Paste",
		acceltext: "Ctrl+V",
	},
	6: {},
	7: {
		id: "find",
		label: "Find...",
		acceltext: "Ctrl+F",
	},
	8: {
		id: "savepageas",
		label: "Save page as...",
		acceltext: "Ctrl+S",
	},
	9: {
		id: "print",
		label: "Print...",
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
					acceltext: "Ctrl++",
				},
				2: {
					id: "normal",
					label: "Normal",
					acceltext: "Ctrl+0",
				},
				3: {
					id: "smaller",
					label: "Smaller",
					acceltext: "Ctrl+-",
				},
			}
		]
	},
	12: {
		id: "encoding",
		label: "Encoding",
		items: [
			{
				1: {
					id: "idkyet",
					label: "idk",
				}
			}
		]
	},
	13: {},
	14: {
		id: "developer",
		label: "Developer",
		items: [
			{
				1: {
					id: "viewsource",
					label: "View source",
					acceltext: "Ctrl+U",
				},
				2: {
					id: "developertools",
					label: "Developer tools",
					acceltext: "Ctrl+Shift+I",
				},
				3: {
					id: "javascriptconsole",
					label: "JavaScript console",
					acceltext: "Ctrl+Shift+J",
				},
				4: {
					id: "taskmanager",
					label: "Task Manager",
					acceltext: "Shift+Esc",
				},
			}
		]
	},
	15: {},
	16: {
		id: "reportbugorbrokenwebsite",
		label: "Report bug or broken website..."
	},
}

window.addEventListener("load", function() {
	createMenu("page", false, "Control the current page", false, false, CustomizableUI.AREA_NAVBAR, "bottomright topright", menu_page);
	createMenu("chrome", false, "Customize and control Google Chrome", false, false, CustomizableUI.AREA_NAVBAR, "bottomright topright", menu_chrome);
})