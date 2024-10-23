// ==UserScript==
// @name        Geckium - Toolbarbutton Creator
// @author      AngelBruni
// @loadorder   3
// ==/UserScript==

class gkToolbarButtons {
	static create(params) {
		try {
			CustomizableUI.createWidget({
				id: params.id + "-button",
				removable: params.removable,
				label: params.label,
				tooltiptext: params.tooltip,
				overflows: params.overflows,
				defaultArea: params.area,
		
				onCreated: function (toolbarButton) {
					if (!params.delegatesanchor)
						toolbarButton.removeAttribute("delegatesanchor");
		
					if (!params.tooltip)
						toolbarButton.setAttribute("tooltiptext", params.label);
		
					if (params.onclick)
						toolbarButton.setAttribute("onclick", params.onclick);

					if (params.oncommand)
						toolbarButton.setAttribute("oncommand", params.oncommand);
				},
			})
		} catch (e) {
			if (params.id)
				console.error(e, params.id + "-button already exists.")
		};
	}
}

class gkToolbarMenuButtons {
	static create(params) {
		const alreadyExists = document.getElementById(params.id + "-button");
		let toolbarButton;
		if (alreadyExists) {
			console.log(params.id + "-button already exists. Using it.");

			toolbarButton = alreadyExists;
		} else {
			console.log(params.id + "-button does not exist. Creating a new one.");

			gkToolbarButtons.create({
				id: params.id,
				delegatesanchor: params.delegatesanchor,
				label: params.label,
				tooltip: params.tooltip,
				removable: params.removable,
				overflows: params.overflows,
				area: params.area
			});

			toolbarButton = document.getElementById(params.id + "-button");
		}

		toolbarButton.setAttribute("type", "menu");

		const parentID = "menu_" + params.id + "Popup";
		const menuPopUp = document.createXULElement("menupopup");
		gkSetAttributes(menuPopUp, {
			id: parentID,
			position: params.position
		});

		menuPopUp.addEventListener("popupshowing", () => {
			const gkMenuBundle = Services.strings.createBundle("chrome://geckium/locale/properties/menu.properties");
			menuPopUp.querySelectorAll("[data-l10n-id]").forEach(item => {
				if ((item.tagName == "menuitem" && item.getAttribute("type") !== "checkbox") || item.tagName == "menu" || item.classList.contains("menuitemitems")) {
					item.label = gkMenuBundle.GetStringFromName(item.dataset.l10nId);
					item.querySelector(".menu-text").value = gkMenuBundle.GetStringFromName(item.dataset.l10nId);
				}

				if (item.tagName == "menuitem" && item.getAttribute("type") == "checkbox") {
					item.label = gkMenuBundle.GetStringFromName(item.dataset.l10nId);
					item.querySelector(".menu-iconic-text").value = gkMenuBundle.GetStringFromName(item.dataset.l10nId);
					item.querySelector(".menu-iconic-highlightable-text").value = gkMenuBundle.GetStringFromName(item.dataset.l10nId);
				}
				
				if (item.tagName == "button") {
					item.label = gkMenuBundle.GetStringFromName(item.dataset.l10nId);
					item.querySelector(".button-text").value = gkMenuBundle.GetStringFromName(item.dataset.l10nId);
				}
			});
		});

		toolbarButton.appendChild(menuPopUp);

		gkToolbarMenuButtons.createItemsFromObject(parentID, params.object, params.adjustAccelTextWidth);
	}

	static createItem(params) {
		let menuItem;

		switch (params.type) {
			case "menu":
				menuItem = document.createXULElement("menu");
				menuItem.id = params.id + "-menu";
				break;
			case "menuitem":
				if (document.getElementById(params.parentID).tagName == "hbox") {
					menuItem = document.createXULElement("button");
					menuItem.classList.add("menuitem-button");
					menuItem.style.listStyleImage = "none";
				} else {
					menuItem = document.createXULElement("menuitem");
				}

				menuItem.id = "menu_" + params.id;
				break;
			case "menuseparator":
				if (document.getElementById(params.parentID).tagName == "hbox")
					menuItem = document.createXULElement("separator");
				else
					menuItem = document.createXULElement("menuseparator");
				break;
			case "menuitemitems":
				menuItem = document.createXULElement("hbox");
				menuItem.classList.add("menuitemitems");
				menuItem.id = "menu_" + params.id;
				menuItem.style.alignItems = "center";

				const menuItemLabel = document.createXULElement("label");
				menuItemLabel.classList.add("menu-text");
				menuItemLabel.setAttribute("value", params.label);
				menuItem.appendChild(menuItemLabel);

				const menuItemRightItems = document.createXULElement("hbox");
				menuItemRightItems.classList.add("menuitem-right-items", "menu-accel");
				menuItem.appendChild(menuItemRightItems);
				break;
			default:
				console.error("Element of type", params.type, "is not supported.");
				return;
		}

		const parent = document.getElementById(params.parentID);

		if (params.type == "menuitem" || params.type == "menu" || params.type == "menuitemitems") {	
			if (params.checkbox) {
				menuItem.setAttribute("type", "checkbox");
				params.icon = false;
			}

			if (params.icon) {
				switch (params.type) {
					case "menuitem":
						menuItem.classList.add("menuitem-iconic");
						break;
					case "menu":
						menuItem.classList.add("menu-iconic");
						break;
				}
			}

			if (params.label)
				menuItem.setAttribute("label", params.label);

			if (params.l10nid)
				menuItem.setAttribute("data-l10n-id", params.l10nid);

			if (params.accesskey)
				menuItem.setAttribute("accesskey", params.accesskey);

			if (params.type == "menuitem") {
				if (!params.oncommand && !params.click && !params.command)
					menuItem.disabled = true;
			}

			if (params.click)
				menuItem.setAttribute("onclick", params.click);

			if (params.command) {
				if (typeof params.command === "string")
					menuItem.setAttribute("command", params.command);
				else
					menuItem.addEventListener("command", params.command);
			}

			if (params.oncommand) {
				if (typeof params.oncommand === "string")
					menuItem.setAttribute("oncommand", params.oncommand);
				else
					menuItem.addEventListener("oncommand", params.oncommand);
			}

			if (params.key)
				menuItem.setAttribute("key", params.key);
			else if (params.acceltext)
				menuItem.setAttribute("acceltext", params.acceltext);
		}

		if (
			params.type == "menuitem" ||
			params.type == "menu" ||
			params.type == "menuseparator" ||
			params.type == "menuitemitems"
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

	static createItemsFromObject(parentID, object, adjustAccelTextWidth) {
		const parent = document.getElementById(parentID);
		const parentOfParent = parent.parentNode;
	
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

		if (object.properties) {
			if (object.properties.onmouseover)
				parentOfParent.setAttribute("onmouseover", object.properties.onmouseover)
			
			if (object.properties.onpopup) {
				if (parent.tagName == "menupopup") {
					parent.addEventListener("popupshowing", adjustAccelText);
					
					gkSetAttributes(parent, {
						onpopupshowing: object.properties.onpopup,
						onpopuphidden: object.properties.onpopup,
					});
				}
			}
		}
	
		for (let key in object) {
			if (key !== "properties") {
				if (
					Object.keys(object[key]).length === 0 &&
					object[key].constructor === Object
				) {
					// If the item is empty, create a menu separator.
					gkToolbarMenuButtons.createItem({
						parentID: parentID,
						type: "menuseparator",
					});
				} else if (object[key].hasOwnProperty("subItems")) {
					// If it has "subItems", it's a submenu.
					gkToolbarMenuButtons.createItem({
						parentID: parentID,
						type: "menu",
						id: object[key].id,
						icon: object[key].icon,
						checkbox: object[key].checkbox,
						onclick: object[key].click,
						command: object[key].command,
						label: object[key].label,
						l10nid: object[key].l10nid,
						accesskey: object[key].accesskey,
						key: object[key].key,
						acceltext: object[key].acceltext	
					});
	
					for (let subItem of object[key].subItems) {
						gkToolbarMenuButtons.createItemsFromObject(
							object[key].id + "-menu",
							subItem,
							adjustAccelTextWidth
						);
					}
				} else if (object[key].hasOwnProperty("items")) {
					// If it has "items", it's a menuitem with buttons.
					gkToolbarMenuButtons.createItem({
						parentID: parentID,
						type: "menuitemitems",
						id: object[key].id,
						icon: object[key].icon,
						checkbox: object[key].checkbox,
						click: object[key].click,
						command: object[key].command,
						label: object[key].label,
						l10nid: object[key].l10nid,
						accesskey: object[key].accesskey,
						key: object[key].key,
						acceltext: object[key].acceltext
					});
					for (let item of object[key].items) {
						gkToolbarMenuButtons.createItemsFromObject(
							"menu_" + object[key].id,
							item,
							false
						);
					}
				} else {
					// Default: create a regular menu item.
					gkToolbarMenuButtons.createItem({
						parentID: parentID,
						type: "menuitem",
						id: object[key].id,
						icon: object[key].icon,
						checkbox: object[key].checkbox,
						click: object[key].click,
						command: object[key].command,
						label: object[key].label,
						l10nid: object[key].l10nid,
						accesskey: object[key].accesskey,
						key: object[key].key,
						acceltext: object[key].acceltext
					});
				}
			}
		}
	}
}

window.addEventListener("load", function () {
	gkToolbarMenuButtons.createItem({
		parentID: "toolbar-context-menu",
		type: "menuitem",
		id: "toolbar-context-gsettings",
		oncommand: "openGSettings()",
		label: "Geckium Settings",
	});
	gkToolbarButtons.create({
		id: "gsettings",
		label: "Geckium Settings",
		removable: true,
		overflows: false,
		area: CustomizableUI.AREA_NAVBAR,
		oncommand: "openGSettings()",
	});
	gkToolbarMenuButtons.create({
		id: "page",
		label: "Page Menu",
		removable: false,
		overflows: false,
		tooltip: "Control the current page",
		position: "bottomright topright",
		area: CustomizableUI.AREA_NAVBAR,
		object: {
			/*1: {
				id: "createApplicationShortcuts",
				l1nid: "createApplicationShortcuts",
			},
			2: {},*/
			3: {
				id: "cut",
				l10nid: "cut",
				command: "cmd_cut",
				key: "key_cut",
			},
			4: {
				id: "copy",
				l10nid: "copy",
				command: "cmd_copy",
				key: "key_copy",
			},
			5: {
				id: "paste",
				l10nid: "paste",
				command: "cmd_paste",
				key: "key_paste",
			},
			6: {},
			7: {
				id: "find",
				l10nid: "find",
				command: "cmd_find",
				key: "key_find",
			},
			8: {
				id: "savePageAs",
				l10nid: "savePageAs",
				command: "Browser:SavePage",
				key: "key_savePage",
			},
			9: {
				id: "print",
				l10nid: "print",
				command: "cmd_print",
				key: "printKb",
			},
			10: {},
			11: {
				id: "zoom",
				l10nid: "zoom",
				subItems: [
					{
						1: {
							id: "larger",
							l10nid: "larger",
							command: "cmd_fullZoomEnlarge",
							key: "key_fullZoomEnlarge",
						},
						2: {
							id: "normal",
							l10nid: "normal",
							command: "cmd_fullZoomReset",
							key: "key_fullZoomReset",
						},
						3: {
							id: "smaller",
							l10nid: "smaller",
							command: "cmd_fullZoomReduce",
							key: "key_fullZoomReduce",
						},
					},
				],
			},
			/*12: {
				id: "encoding",
				l10nid: "encoding",
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
				l10nid: "developer",
				subItems: [
					{
						1: {
							id: "viewSource",
							l10nid: "viewSource",
							command: "View:PageSource",
							key: "key_viewSource",
						},
						/*2: {
							id: "developerTools",
							l10nid: "developerTools",
							acceltext: "Ctrl+Shift+I",
						},
						3: {
							id: "javaScriptConsole",
							l10nid: "javaScriptConsole",
							acceltext: "Ctrl+Shift+J",
						},*/
						4: {
							id: "taskManager",
							l10nid: "taskManager",
							command: "View:AboutProcesses",
							key: "key_aboutProcesses",
						},
					},
				],
			},
			15: {},
			16: {
				id: "reportBugOrBrokenWebsite",
				l10nid: "reportBugOrBrokenWebsite",
				click: "openTrustedLinkIn('https://bugzilla.mozilla.org/home', 'tab');",
			},
		},
		adjustAccelTextWidth: true,
	});
	gkToolbarMenuButtons.create({
		id: "chrome",
		label: "Chrome Menu",
		removable: false,
		overflows: false,
		position: "bottomright topright",
		area: CustomizableUI.AREA_NAVBAR,
		object: {
			properties: {
				onmouseover: "updateMenuTooltipLocale();",
				onpopup: "bookmarksBarStatus(); updateAboutLocale();",
			},
			1: {
				id: "newVersion",
				l10nid: "newVersion",
				click: "openTrustedLinkIn('https://github.com/angelbruni/Geckium/releases/latest', 'tab');",
			},
			2: {
				id: "newTab",
				l10nid: "newTab",
				command: "cmd_newNavigatorTab",
				key: "key_newNavigatorTab",
			},
			3: {
				id: "newWindow",
				l10nid: "newWindow",
				command: "cmd_newNavigator",
				key: "key_newNavigator",
			},
			4: {
				id: "newIncognitoWindow",
				l10nid: "newIncognitoWindow",
				command: "Tools:PrivateBrowsing",
				acceltext: "Ctrl+Shift+N",
			},
			5: {
				id: "bookmarks",
				l10nid: "bookmarks",
				subItems: [
					{
						1: {
							id: "showBookmarks",
							l10nid: "showBookmarksBar",
							checkbox: true,
							command: onViewToolbarCommand,
							acceltext: "Ctrl+Shift+B",
						},
						2: {
							id: "bookmarkMgr",
							l10nid: "bookmarkManager",
							command: "Browser:ShowAllBookmarks",
							key: "manBookmarkKb",
						},
						3: {
							id: "bookmarkImport",
							l10nid: "importBookmarksAndSettings",
							command: "OrganizerCommand_browserImport",
						},
						4: {},
						5: {
							id: "bookmarkPage",
							l10nid: "bookmarkThisPage",
							command: "Browser:AddBookmarkAs",
							key: "addBookmarkAsKb",
						},
					},
				],
			},
			6: {},
			7: {
				id: "edit",
				l10nid: "edit",
				items: [
					{
						1: {
							id: "cut6",
							l10nid: "cut",
							command: "cmd_cut",
						},
						2: {
							id: "copy6",
							l10nid: "copy",
							command: "cmd_copy",
						},
						3: {
							id: "paste6",
							l10nid: "paste",
							command: "cmd_paste",
						},
					},
				],
			},
			8: {},
			9: {
				id: "zoom6",
				l10nid: "zoom",
				items: [
					{
						1: {
							id: "smaller6",
							command: "cmd_fullZoomReduce",
							label: "-",
						},
						2: {
							id: "normal6",
						},
						3: {
							id: "larger6",
							command: "cmd_fullZoomEnlarge",
							label: "+",
						},
						4: {},
						5: {
							id: "fullScreen6",
							click: "BrowserFullScreen();",
						},
					},
				],
			},
			10: {},
			11: {
				id: "savePage6",
				command: "Browser:SavePage",
				l10nid: "savePageAs",
				key: "key_savePage",
			},
			12: {
				id: "find6",
				l10nid: "find",
				command: "cmd_find",
				key: "key_find",
			},
			13: {
				id: "print6",
				l10nid: "print",
				command: "cmd_print",
				key: "printKb",
			},
			14: {
				id: "tools6",
				l10nid: "tools",
				subItems: [
					{
						/*1: {
							id: "createShortcut",
							l1nid: "createApplicationShortcuts",
						},
						2: {},*/
						3: {
							id: "extensions",
							l10nid: "extensions",
							command: "Tools:Addons",
						},
						4: {
							id: "taskmgr",
							l10nid: "taskManager",
							command: "View:AboutProcesses",
							key: "key_aboutProcesses",
						},
						5: {
							id: "cleardata",
							l10nid: "clearBrowsingData",
							command: "Tools:Sanitize",
							key: "key_sanitize",
						},
						6: {},
						7: {
							id: "reportIssue",
							l10nid: "reportAnIssue",
							click: "openTrustedLinkIn('https://bugzilla.mozilla.org/home', 'tab');",
						},
						8: {},
						9: {
							id: "viewSource",
							l10nid: "viewSource",
							command: "View:PageSource",
							key: "key_viewSource",
						},
						/*10: {
							id: "devTools",
							l10nid: "developerTools",
							key: "key_toggleToolbox",
						},*/
						/*11: {
							id: "javaScriptConsole",
							l10nid: "javaScriptConsole",
							command: "?",
							acceltext: "Ctrl+Shift+J",
						},*/
					},
				],
			},
			15: {
				id: "alwaysShowBookmarksBar5",
				checkbox: true,
				l10nid: "alwaysShowBookmarksBar",
				command: onViewToolbarCommand,
				acceltext: "Ctrl+B",
			},
			16: {
				id: "fullScreen5",
				l10nid: "fullScreen",
				click: "BrowserFullScreen();",
				key: "key_enterFullScreen",
			},
			17: {},
			18: {
				id: "history",
				l10nid: "history",
				command: "Browser:ShowAllHistory",
				acceltext: "Ctrl+H",
			},
			19: {
				id: "bookmarkManager5",
				l10nid: "bookmarkManager",
				command: "Browser:ShowAllBookmarks",
				acceltext: "Ctrl+Shift+B",
			},
			20: {
				id: "downloads",
				l10nid: "downloads",
				command: "Tools:Downloads",
				key: "key_openDownloads",
			},
			21: {
				id: "extensions5",
				l10nid: "extensions",
				command: "Tools:Addons",
			},
			22: {},
			23: {
				id: "setupSync",
				l10nid: "setUpSync",
				click: "gSync.openPrefsFromFxaMenu('sync_settings', this);",
			},
			24: {},
			25: {
				id: "options5",
				l10nid: "options",
				click: "openPreferences()",
			},
			26: {
				id: "settings6",
				l10nid: "settings",
				click: "openPreferences()",
			},
			27: {
				id: "about",
				l10nid: "about",
				click: "openAbout()",
			},
			28: {
				id: "help",
				l10nid: "help",
				click: "openHelpLink('firefox-help')",
				acceltext: "F1",
			},
			29: {},
			30: {
				id: "exit",
				l10nid: "exit",
				command: "cmd_quitApplication",
			},
		},
		adjustAccelTextWidth: true,
	});
	
	const panelUIButton = document.getElementById("PanelUI-button");
	panelUIButton.appendChild(document.getElementById("page-button"));
	panelUIButton.appendChild(document.getElementById("chrome-button"));
});