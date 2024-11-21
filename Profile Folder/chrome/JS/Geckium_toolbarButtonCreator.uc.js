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
		
				onCreated: function (toolbarbutton) {
					if (!params.delegatesanchor)
						toolbarbutton.removeAttribute("delegatesanchor");
		
					if (!params.tooltip)
						toolbarbutton.setAttribute("tooltiptext", params.label);

					if (params.l10nArgs)
						toolbarbutton.dataset.l10nId = params.l10nArgs;

					if (params.l10nId)
						toolbarbutton.dataset.l10nId = params.l10nId;
		
					if (params.onclick)
						toolbarbutton.setAttribute("onclick", params.onclick);

					if (params.oncommand)
						toolbarbutton.setAttribute("oncommand", params.oncommand);

					if (typeof params.onCreated === "function")
						params.onCreated(toolbarbutton);
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

			if (params.l10nId)
				menuItem.dataset.l10nId = params.l10nId;

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
						l10nId: object[key].l10nId,
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
						l10nId: object[key].l10nId,
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
						l10nId: object[key].l10nId,
						accesskey: object[key].accesskey,
						key: object[key].key,
						acceltext: object[key].acceltext
					});
				}
			}
		}
	}
}

UC_API.Runtime.startupFinished().then(() => {
	gkToolbarMenuButtons.createItem({
		parentID: "toolbar-context-menu",
		type: "menuitem",
		id: "toolbar-context-gsettings",
		oncommand: "openGSettings()"
	});

	document.getElementById("toolbar-context-menu").addEventListener("popupshown", () => {
		const gSettingsBundle = Services.strings.createBundle("chrome://geckium/locale/properties/gsettings.properties");

		document.getElementById("menu_toolbar-context-gsettings").setAttribute("label", gSettingsBundle.GetStringFromName("geckiumSettings"));
	});
	
	gkToolbarButtons.create({
		id: "gsettings",
		removable: true,
		overflows: false,
		area: CustomizableUI.AREA_NAVBAR,
		oncommand: "openGSettings()",

		onCreated: function(toolbarbutton) {
			toolbarbutton.addEventListener("mouseover", () => {
				const gSettingsBundle = Services.strings.createBundle("chrome://geckium/locale/properties/gsettings.properties");
				const gSettingsTitle = gSettingsBundle.GetStringFromName("geckiumSettings");
				gkSetAttributes(document.getElementById("gsettings-button"), {
					"label": gSettingsTitle,
					"tooltiptext": gSettingsTitle
				});
			});
		}
	});
	gkToolbarButtons.create({
		id: "gk-firefox-account",
		removable: false,
		overflows: false,
		area: CustomizableUI.AREA_TABSTRIP,

		onCreated: function(toolbarbutton) {
			const stack = document.createXULElement("stack");
			stack.classList.add("toolbarbutton-badge-stack");
			const vbox = document.createXULElement("vbox");
			stack.appendChild(vbox);
			const avatarImg = document.createXULElement("image");
			avatarImg.id = "fxa-avatar-image";
			vbox.appendChild(avatarImg);
			toolbarbutton.prepend(stack);

			const toolbarbuttonIcon = document.createXULElement("image");
			toolbarbuttonIcon.classList.add("toolbarbutton-icon");
			toolbarbutton.appendChild(toolbarbuttonIcon);

			const toolbarbuttonText = document.createXULElement("label");
			toolbarbuttonText.classList.add("toolbarbutton-text");
			toolbarbutton.appendChild(toolbarbuttonText);

			toolbarbutton.addEventListener("command", (e) => {
				gSync.toggleAccountPanel(toolbarbutton, e);
			});

			if (UIState.get().status == "signed_in") {
				toolbarbutton.dataset.l10nId = null;
				toolbarbutton.removeAttribute("label");
				toolbarbutton.removeAttribute("tooltiptext");
				toolbarbutton.setAttribute("label", UIState.get().displayName || UIState.get().email);
				toolbarbutton.setAttribute("tooltiptext", UIState.get().displayName || UIState.get().email);
				toolbarbutton.querySelector(".toolbarbutton-text").textContent = UIState.get().displayName || UIState.get().email;
			} else {
				toolbarbutton.dataset.l10nId = "toolbar-button-account";
			}

			Services.obs.addObserver((subject, topic, data) => {
				if (topic === UIState.ON_UPDATE) {
					if (UIState.get().status == "signed_in") {
						toolbarbutton.dataset.l10nId = null;
						toolbarbutton.removeAttribute("label");
						toolbarbutton.removeAttribute("tooltiptext");
						toolbarbutton.setAttribute("label", UIState.get().displayName || UIState.get().email);
						toolbarbutton.setAttribute("tooltiptext", UIState.get().displayName || UIState.get().email);
						toolbarbutton.querySelector(".toolbarbutton-text").textContent = UIState.get().displayName || UIState.get().email;
					} else {
						toolbarbutton.dataset.l10nId = "toolbar-button-account";
					}
				}
			}, UIState.ON_UPDATE);
		}
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
				l10nId: "cut",
				command: "cmd_cut",
				key: "key_cut",
			},
			4: {
				id: "copy",
				l10nId: "copy",
				command: "cmd_copy",
				key: "key_copy",
			},
			5: {
				id: "paste",
				l10nId: "paste",
				command: "cmd_paste",
				key: "key_paste",
			},
			6: {},
			7: {
				id: "find",
				l10nId: "find",
				command: "cmd_find",
				key: "key_find",
			},
			8: {
				id: "savePageAs",
				l10nId: "savePageAs",
				command: "Browser:SavePage",
				key: "key_savePage",
			},
			9: {
				id: "print",
				l10nId: "print",
				command: "cmd_print",
				key: "printKb",
			},
			10: {},
			11: {
				id: "zoom",
				l10nId: "zoom",
				subItems: [
					{
						1: {
							id: "larger",
							l10nId: "larger",
							command: "cmd_fullZoomEnlarge",
							key: "key_fullZoomEnlarge",
						},
						2: {
							id: "normal",
							l10nId: "normal",
							command: "cmd_fullZoomReset",
							key: "key_fullZoomReset",
						},
						3: {
							id: "smaller",
							l10nId: "smaller",
							command: "cmd_fullZoomReduce",
							key: "key_fullZoomReduce",
						},
					},
				],
			},
			/*12: {
				id: "encoding",
				l10nId: "encoding",
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
				l10nId: "developer",
				subItems: [
					{
						1: {
							id: "viewSource",
							l10nId: "viewSource",
							command: "View:PageSource",
							key: "key_viewSource",
						},
						/*2: {
							id: "developerTools",
							l10nId: "developerTools",
							acceltext: "Ctrl+Shift+I",
						},
						3: {
							id: "javaScriptConsole",
							l10nId: "javaScriptConsole",
							acceltext: "Ctrl+Shift+J",
						},*/
						4: {
							id: "taskManager",
							l10nId: "taskManager",
							command: "View:AboutProcesses",
							key: "key_aboutProcesses",
						},
					},
				],
			},
			15: {},
			16: {
				id: "reportBugOrBrokenWebsite",
				l10nId: "reportBugOrBrokenWebsite",
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
				l10nId: "newVersion",
				click: "openTrustedLinkIn('https://github.com/angelbruni/Geckium/releases/latest', 'tab');",
			},
			2: {
				id: "newTab",
				l10nId: "newTab",
				command: "cmd_newNavigatorTab",
				key: "key_newNavigatorTab",
			},
			3: {
				id: "newWindow",
				l10nId: "newWindow",
				command: "cmd_newNavigator",
				key: "key_newNavigator",
			},
			4: {
				id: "newIncognitoWindow",
				l10nId: "newIncognitoWindow",
				command: "Tools:PrivateBrowsing",
				acceltext: "Ctrl+Shift+N",
			},
			5: {
				id: "bookmarks",
				l10nId: "bookmarks",
				subItems: [
					{
						1: {
							id: "showBookmarks",
							l10nId: "showBookmarksBar",
							checkbox: true,
							command: onViewToolbarCommand,
							acceltext: "Ctrl+Shift+B",
						},
						2: {
							id: "bookmarkMgr",
							l10nId: "bookmarkManager",
							command: "Browser:ShowAllBookmarks",
							key: "manBookmarkKb",
						},
						3: {
							id: "bookmarkImport",
							l10nId: "importBookmarksAndSettings",
							command: "OrganizerCommand_browserImport",
						},
						4: {},
						5: {
							id: "bookmarkPage",
							l10nId: "bookmarkThisPage",
							command: "Browser:AddBookmarkAs",
							key: "addBookmarkAsKb",
						},
					},
				],
			},
			6: {},
			7: {
				id: "edit",
				l10nId: "edit",
				items: [
					{
						1: {
							id: "cut6",
							l10nId: "cut",
							command: "cmd_cut",
						},
						2: {
							id: "copy6",
							l10nId: "copy",
							command: "cmd_copy",
						},
						3: {
							id: "paste6",
							l10nId: "paste",
							command: "cmd_paste",
						},
					},
				],
			},
			8: {},
			9: {
				id: "zoom6",
				l10nId: "zoom",
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
				l10nId: "savePageAs",
				key: "key_savePage",
			},
			12: {
				id: "find6",
				l10nId: "find",
				command: "cmd_find",
				key: "key_find",
			},
			13: {
				id: "print6",
				l10nId: "print",
				command: "cmd_print",
				key: "printKb",
			},
			14: {
				id: "tools6",
				l10nId: "tools",
				subItems: [
					{
						/*1: {
							id: "createShortcut",
							l1nid: "createApplicationShortcuts",
						},
						2: {},*/
						3: {
							id: "extensions",
							l10nId: "extensions",
							command: "Tools:Addons",
						},
						4: {
							id: "taskmgr",
							l10nId: "taskManager",
							command: "View:AboutProcesses",
							key: "key_aboutProcesses",
						},
						5: {
							id: "cleardata",
							l10nId: "clearBrowsingData",
							command: "Tools:Sanitize",
							key: "key_sanitize",
						},
						6: {},
						7: {
							id: "reportIssue",
							l10nId: "reportAnIssue",
							click: "openTrustedLinkIn('https://bugzilla.mozilla.org/home', 'tab');",
						},
						8: {},
						9: {
							id: "viewSource",
							l10nId: "viewSource",
							command: "View:PageSource",
							key: "key_viewSource",
						},
						/*10: {
							id: "devTools",
							l10nId: "developerTools",
							key: "key_toggleToolbox",
						},*/
						/*11: {
							id: "javaScriptConsole",
							l10nId: "javaScriptConsole",
							command: "?",
							acceltext: "Ctrl+Shift+J",
						},*/
					},
				],
			},
			15: {
				id: "alwaysShowBookmarksBar5",
				checkbox: true,
				l10nId: "alwaysShowBookmarksBar",
				command: onViewToolbarCommand,
				acceltext: "Ctrl+B",
			},
			16: {
				id: "fullScreen5",
				l10nId: "fullScreen",
				click: "BrowserFullScreen();",
				key: "key_enterFullScreen",
			},
			17: {},
			18: {
				id: "history",
				l10nId: "history",
				command: "Browser:ShowAllHistory",
				acceltext: "Ctrl+H",
			},
			19: {
				id: "bookmarkManager5",
				l10nId: "bookmarkManager",
				command: "Browser:ShowAllBookmarks",
				acceltext: "Ctrl+Shift+B",
			},
			20: {
				id: "downloads",
				l10nId: "downloads",
				command: "Tools:Downloads",
				key: "key_openDownloads",
			},
			21: {
				id: "extensions5",
				l10nId: "extensions",
				command: "Tools:Addons",
			},
			22: {},
			23: {
				id: "setupSync",
				l10nId: "setUpSync",
				click: "gSync.openPrefsFromFxaMenu('sync_settings', this);",
			},
			24: {},
			25: {
				id: "options5",
				l10nId: "options",
				click: "openPreferences()",
			},
			26: {
				id: "settings6",
				l10nId: "settings",
				click: "openPreferences()",
			},
			27: {
				id: "about",
				l10nId: "about",
				click: "openAbout()",
			},
			28: {
				id: "help",
				l10nId: "help",
				click: "openHelpLink('firefox-help')",
				acceltext: "F1",
			},
			29: {},
			30: {
				id: "exit",
				l10nId: "exit",
				command: "cmd_quitApplication",
			},
		},
		adjustAccelTextWidth: true,
	});
	if (versionFlags.is133Plus) {
		gkToolbarButtons.create({
			id: "searchmode-switcher",
			removable: true,
			overflows: false,
			area: CustomizableUI.AREA_NAVBAR,

			onCreated: function(toolbarbutton) {
				async function updateL10nArgs() {
					try {
						while (!Services.search.hasSuccessfullyInitialized) {
							await new Promise(resolve => setTimeout(resolve, 100));
						}
					
						toolbarbutton.dataset.l10nArgs = `{"engine":"${Services.search.defaultEngine.name}"}`;
						toolbarbutton.dataset.l10nId = "urlbar-searchmode-button2";
					} catch (e) {
						console.error(e);	
					}
				}

				async function updateIcon() {
					try {
						while (!Services.search.hasSuccessfullyInitialized) {
							await new Promise(resolve => setTimeout(resolve, 100));
						}
					
						toolbarbutton.style.listStyleImage = `url('${await Services.search.defaultEngine.getIconURL()}')`;
					} catch (e) {
						console.error(e);	
					}
				}

				updateIcon();
				updateL10nArgs();

				const toolbarButtonArrow = document.createXULElement("image");
				toolbarButtonArrow.classList.add("toolbarbutton-arrow");
				
				waitForElm(`#${this.id}-button .toolbarbutton-text`).then(() => {
					gkInsertElm.after(toolbarButtonArrow, toolbarbutton.querySelector(".toolbarbutton-text"));
				})

				Services.obs.addObserver((subject, topic, data) => {
					if (topic === "browser-search-engine-modified") {
						updateIcon();
						updateL10nArgs();
					}
				}, "browser-search-engine-modified"); 

				let _popup = document.getElementById("searchmode-switcher-popup");

				_popup.addEventListener("popupshown", (e) => {
					toolbarbutton.setAttribute("open", true);
				});
				_popup.addEventListener("popuphidden", () => {
					toolbarbutton.removeAttribute("open");
				})

				toolbarbutton.addEventListener("command", (e) => {
					window.gURLBar.searchModeSwitcher.openPanel(e) // Force list building.
					PanelMultiView.openPopup(
						_popup,
						toolbarbutton,
						{
							position: "bottomright topright"
						}
					)
				});
			}
		});
	}
	
	const panelUIButton = document.getElementById("PanelUI-button");
	panelUIButton.appendChild(document.getElementById("page-button"));
	panelUIButton.appendChild(document.getElementById("chrome-button"));
});