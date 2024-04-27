// ==UserScript==
// @name        Geckium - Toolbarbutton Creator
// @author      AngelBruni
// @loadorder   3
// ==/UserScript==

function createToolbarbutton(id, delegatesanchor, label, tooltip, removable, overflows, area, onclick) {
	const alreadyExists = document.getElementById(id + "-button");

	if (alreadyExists) {
		console.log("toolbarbutton already exists.");
	} else {
		console.log("toolbarbutton does not exist.");

		CustomizableUI.createWidget({
			id: id + "-button",
			removable: removable,
			label: label,
			tooltiptext: tooltip,
			overflows: overflows,
			defaultArea: area,
	
			onCreated: function (toolbarButton) {
				if (!delegatesanchor)
					toolbarButton.removeAttribute("delegatesanchor");
	
				if (!tooltip)
					toolbarButton.setAttribute("tooltiptext", label);
	
				if (onclick)
					toolbarButton.setAttribute("onclick", onclick);
			},
		});
	}
}

function createMenu(
	id,
	delegatesanchor,
	label,
	tooltip,
	removable,
	overflows,
	area,
	position,
	object,
	adjustAccelTextWidth
) {
	const parentID = "menu_" + id + "Popup";

	const alreadyExists = document.getElementById(id + "-button");
	
	let toolbarButton;

	if (alreadyExists) {
		console.log("toolbarbutton already exists.");

		toolbarButton = alreadyExists;
	} else {
		console.log("toolbarbutton does not exist.");

		createToolbarbutton(id, delegatesanchor, label, tooltip, removable, overflows, area);

		toolbarButton = document.getElementById(id + "-button");
	}

	toolbarButton.setAttribute("type", "menu");

	const menuPopUp = document.createXULElement("menupopup");
	gkSetAttributes(menuPopUp, {
		id: parentID,
		position: position,
	});

	toolbarButton.appendChild(menuPopUp);

	createMenuItemFromObject(parentID, object, adjustAccelTextWidth);
}

function createMenuItem(parentID, type, id, icon, checkbox, click, command, label, accesskey, key, acceltext) {
	let menuItem;

	switch (type) {
		case "menu":
			menuItem = document.createXULElement("menu");
			menuItem.id = id + "-menu";
			break;
		case "menuitem":
			if (document.getElementById(parentID).tagName == "hbox") {
				menuItem = document.createXULElement("button");
				menuItem.classList.add("menuitem-button");
				menuItem.style.listStyleImage = "none";
			} else {
				menuItem = document.createXULElement("menuitem");
			}

			menuItem.id = "menu_" + id;
			break;
		case "menuseparator":
			if (document.getElementById(parentID).tagName == "hbox")
				menuItem = document.createXULElement("separator");
			else
				menuItem = document.createXULElement("menuseparator");
			break;
		case "menuitemitems":
			menuItem = document.createXULElement("hbox");
			menuItem.classList.add("menuitemitems");
			menuItem.id = "menu_" + id;
			menuItem.style.alignItems = "center";

			menuItemLabel = document.createXULElement("label");
			menuItemLabel.classList.add("menu-text");
			menuItemLabel.setAttribute("value", label);
			menuItem.appendChild(menuItemLabel);

			menuItemRightItems = document.createXULElement("hbox");
			menuItemRightItems.classList.add("menuitem-right-items", "menu-accel");
			menuItem.appendChild(menuItemRightItems);
			break;
		default:
			console.error("Element of type" + type + "is not supported.");
			return;
	}

	const parent = document.getElementById(parentID);

	if (type == "menuitem" || type == "menu" || type == "menuitemitems") {
		if (checkbox) {
			menuItem.setAttribute("type", "checkbox");
			icon = false;
		}

		if (icon) {
			switch (type) {
				case "menuitem":
					menuItem.classList.add("menuitem-iconic");
					break;
				case "menu":
					menuItem.classList.add("menu-iconic");
					break;
			}
		}

		if (label)
			menuItem.setAttribute("label", label);

		if (accesskey)
			menuItem.setAttribute("accesskey", accesskey);

		if (type == "menuitem") {
			if (!command && !click) menuItem.disabled = true;
		}

		if (click)
			menuItem.setAttribute("onclick", click);

		if (command) {
			if (typeof command === "string")
				menuItem.setAttribute("command", command);
			else
				menuItem.addEventListener("command", command);
		}

		if (key)
			menuItem.setAttribute("key", key);
		else if (acceltext)
			menuItem.setAttribute("acceltext", acceltext);
	}

	if (
		type == "menuitem" ||
		type == "menu" ||
		type == "menuseparator" ||
		type == "menuitemitems"
	) {
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
		} else if (parent.tagName == "hbox") {
			parent.querySelector(".menuitem-right-items").appendChild(menuItem);
		}
	}
}

function createMenuItemFromObject(parentID, object, adjustAccelTextWidth) {
	const parent = document.getElementById(parentID);

	function adjustAccelText(adjustAccelTextWidth) {
		if (adjustAccelTextWidth) {
			const menuAccelContainers = parent.querySelectorAll(
				"menuitem[acceltext] > .menu-accel-container"
			);

			if (
				!parent.querySelector(
					"menuitem[acceltext] > .menu-accel-container[style*='min-width']"
				)
			) {
				let maxWidth = 0;
				menuAccelContainers.forEach((container) => {
					const width = container.clientWidth;
					maxWidth = Math.max(maxWidth, width);
					container.style.minWidth = `${maxWidth}px`;
					container.style.justifyContent = "end";
				});
			}
		}
	}

	if (parent.tagName == "menupopup") {
		parent.addEventListener("popupshowing", adjustAccelText);
		if (object.properties) {
			gkSetAttributes(parent, {
				onpopupshowing: object.properties.onpopup,
				onpopuphidden: object.properties.onpopup,
			});
		}
	}

	for (let key in object) {
		if (key !== "properties") {
			if (
				Object.keys(object[key]).length === 0 &&
				object[key].constructor === Object
			) {
				// If the item is empty, create a menu separator.
				createMenuItem(parentID, "menuseparator");
			} else if (object[key].hasOwnProperty("subItems")) {
				// If it has "subItems", it's a submenu.
				createMenuItem(
					parentID,
					"menu",
					object[key].id,
					object[key].icon,
					object[key].checkbox,
					object[key].click,
					object[key].command,
					object[key].label,
					object[key].accesskey,
					object[key].key,
					object[key].acceltext
				);
				for (let subItem of object[key].subItems) {
					createMenuItemFromObject(
						object[key].id + "-menu",
						subItem,
						adjustAccelTextWidth
					);
				}
			} else if (object[key].hasOwnProperty("items")) {
				// If it has "items", it's a menuitem with buttons.
				createMenuItem(
					parentID,
					"menuitemitems",
					object[key].id,
					object[key].icon,
					object[key].checkbox,
					object[key].click,
					object[key].command,
					object[key].label,
					object[key].accesskey,
					object[key].key,
					object[key].acceltext
				);
				for (let item of object[key].items) {
					createMenuItemFromObject(
						"menu_" + object[key].id,
						item,
						false
					);
				}
			} else {
				// Default: create a regular menu item.
				createMenuItem(
					parentID,
					"menuitem",
					object[key].id,
					object[key].icon,
					object[key].checkbox,
					object[key].click,
					object[key].command,
					object[key].label,
					object[key].accesskey,
					object[key].key,
					object[key].acceltext
				);
			}
		}
	}
}

function geckiumCreateMenu(id, label, tooltip, object) {
	/* Does the same as createMenu() but sets predefined arguments
	   that will be used for every menu in Geckium. */

	createMenu(
		id,
		false,
		label,
		tooltip,
		false,
		false,
		CustomizableUI.AREA_NAVBAR,
		"bottomright topright",
		object,
		true
	);
}

const menu_chrome = {
	properties: {
		onpopup: "bookmarksBarStatus();",
	},
	1: {
		id: "newTab",
		label: "New tab",
		command: "cmd_newNavigatorTab",
		key: "key_newNavigatorTab",
	},
	2: {
		id: "newWindow",
		label: "New window",
		command: "cmd_newNavigator",
		key: "key_newNavigator",
	},
	3: {
		id: "newIncognitoWindow",
		label: "New incognito window",
		command: "Tools:PrivateBrowsing",
		acceltext: "Ctrl+Shift+N",
	},
	4: {
		id: "bookmarks",
		label: "Bookmarks",
		subItems: [
			{
				1: {
					id: "showBookmarks",
					label: "Show bookmarks bar",
					checkbox: true,
					command: onViewToolbarCommand,
					acceltext: "Ctrl+Shift+B",
				},
				2: {
					id: "bookmarkMgr",
					label: "Bookmark manager",
					command: "Browser:ShowAllBookmarks",
					key: "manBookmarkKb",
				},
				3: {
					id: "bookmarkImport",
					label: "Import bookmarks and settings...",
					command: "OrganizerCommand_browserImport",
				},
				4: {},
				5: {
					id: "bookmarkPage",
					label: "Bookmark this page",
					command: "Browser:AddBookmarkAs",
					key: "addBookmarkAsKb",
				},
			},
		],
	},
	5: {},
	6: {
		id: "edit",
		label: "Edit",
		items: [
			{
				1: {
					id: "cut11",
					label: "Cut",
					command: "cmd_cut",
				},
				2: {
					id: "copy11",
					label: "Copy",
					command: "cmd_copy",
				},
				3: {
					id: "paste11",
					label: "Paste",
					command: "cmd_paste",
				},
			},
		],
	},
	7: {},
	8: {
		id: "zoom11",
		label: "Zoom",
		items: [
			{
				1: {
					id: "smaller11",
					command: "cmd_fullZoomReduce",
					label: "-",
				},
				2: {
					id: "normal11",
				},
				3: {
					id: "larger11",
					command: "cmd_fullZoomEnlarge",
					label: "+",
				},
				4: {},
				5: {
					id: "fullScreen11",
					click: "BrowserFullScreen();",
				},
			},
		],
	},
	9: {},
	10: {
		id: "savePage11",
		label: "Save page as...",
		command: "Browser:SavePage",
		key: "key_savePage",
	},
	11: {
		id: "find11",
		label: "Find...",
		command: "cmd_find",
		key: "key_find",
	},
	12: {
		id: "print11",
		label: "Print...",
		command: "cmd_print",
		key: "printKb",
	},
	13: {
		id: "tools11",
		label: "Tools",
		subItems: [
			{
				/*1: {
					id: "createShortcut",
					label: "Create application shortcuts...",
				},
				2: {},*/
				3: {
					id: "extensions",
					label: "Extensions",
					command: "Tools:Addons",
				},
				4: {
					id: "taskmgr",
					label: "Task manager",
					command: "View:AboutProcesses",
					key: "key_aboutProcesses",
				},
				5: {
					id: "cleardata",
					label: "Clear browsing data...",
					command: "Tools:Sanitize",
					key: "key_sanitize",
				},
				6: {},
				7: {
					id: "reportIssue",
					label: "Report an issue...",
					command: "openTrustedLinkIn('https://bugzilla.mozilla.org/home', 'tab');",
				},
				8: {},
				9: {
					id: "viewSource",
					label: "View Source",
					command: "View:PageSource",
					key: "key_viewSource",
				},
				/*10: {
					id: "devTools",
					label: "Developer tools",
					key: "key_toggleToolbox",
				},*/
				/*11: {
					id: "javaScriptTools",
					label: "JavaScript console",
					command: "?",
					acceltext: "Ctrl+Shift+J",
				},*/
			},
		],
	},
	14: {
		id: "alwaysShowBookmarksBar5",
		checkbox: true,
		label: "Always show bookmarks bar",
		command: onViewToolbarCommand,
		acceltext: "Ctrl+B",
	},
	15: {
		id: "fullScreen5",
		label: "Full screen",
		click: "BrowserFullScreen();",
		key: "key_enterFullScreen",
	},
	16: {},
	17: {
		id: "history",
		label: "History",
		command: "Browser:ShowAllHistory",
		acceltext: "Ctrl+H",
	},
	18: {
		id: "bookmarkManager5",
		label: "Bookmark manager",
		command: "Browser:ShowAllBookmarks",
		acceltext: "Ctrl+Shift+B",
	},
	19: {
		id: "downloads",
		label: "Downloads",
		command: "Tools:Downloads",
		key: "key_openDownloads",
	},
	20: {
		id: "extensions5",
		label: "Extensions",
		command: "Tools:Addons",
	},
	21: {},
	22: {
		id: "setupSync",
		label: "Set up sync...",
		click: "gSync.openPrefsFromFxaMenu('sync_settings', this);",
	},
	23: {},
	24: {
		id: "options5",
		label: "Options",
		click: "openPreferences()",
	},
	25: {
		id: "settings11",
		label: "Settings",
		click: "openPreferences()",
	},
	26: {
		id: "aboutGoogleChrome",
		label: "About Google Chrome",
		click: "openWindow('aboutChromium', 'chrome,centerscreen,dependent,modal')",
	},
	27: {
		id: "help",
		label: "Help",
		click: "openHelpLink('firefox-help')",
		acceltext: "F1",
	},
	28: {},
	29: {
		id: "exit",
		label: "Exit",
		command: "cmd_quitApplication",
	},
};

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
		key: "key_cut",
	},
	4: {
		id: "copy",
		label: "Copy",
		command: "cmd_copy",
		key: "key_copy",
	},
	5: {
		id: "paste",
		label: "Paste",
		command: "cmd_paste",
		key: "key_paste",
	},
	6: {},
	7: {
		id: "find",
		label: "Find...",
		command: "cmd_find",
		key: "key_find",
	},
	8: {
		id: "savePageAs",
		label: "Save page as...",
		command: "Browser:SavePage",
		key: "key_savePage",
	},
	9: {
		id: "print",
		label: "Print...",
		command: "cmd_print",
		key: "printKb",
	},
	10: {},
	11: {
		id: "zoom",
		label: "Zoom",
		subItems: [
			{
				1: {
					id: "larger",
					label: "Larger",
					command: "cmd_fullZoomEnlarge",
					key: "key_fullZoomEnlarge",
				},
				2: {
					id: "normal",
					label: "Normal",
					command: "cmd_fullZoomReset",
					key: "key_fullZoomReset",
				},
				3: {
					id: "smaller",
					label: "Smaller",
					command: "cmd_fullZoomReduce",
					key: "key_fullZoomReduce",
				},
			},
		],
	},
	/*12: {
		id: "encoding",
		label: "Encoding",
		subItems: [
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
		subItems: [
			{
				1: {
					id: "viewSource",
					label: "View source",
					command: "View:PageSource",
					key: "key_viewSource",
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
					key: "key_aboutProcesses",
				},
			},
		],
	},
	15: {},
	16: {
		id: "reportBugOrBrokenWebsite",
		label: "Report bug or broken website...",
		click: "openTrustedLinkIn('https://bugzilla.mozilla.org/home', 'tab');",
	},
};

window.addEventListener("load", function () {
	createToolbarbutton("gflags", "", "Geckium Flags", "", true, false, CustomizableUI.AREA_NAVBAR, "openGFlags()");
	geckiumCreateMenu("page", "Page Menu", "Control the current page", menu_page);
	geckiumCreateMenu("chrome", "Chrome Menu", "Customize and control Google Chrome", menu_chrome);
});
