// ==UserScript==
// @name        Geckium - Downloads Manager
// @author		AngelBruni
// @description	Downloads Manager made to adapt to different Chromium designs.
// @loadorder   3
// ==/UserScript==

/**
 * THIS IS SUPER EXPERIMENTAL, IT WILL HAVE BUGS.
 */

const { gkFileUtils } = ChromeUtils.importESModule("chrome://modules/content/GeckiumFileUtils.sys.mjs");

const gkDownloadManagerBundle = Services.strings.createBundle("chrome://geckium/locale/properties/gkdownloadmanager.properties");

const { FileUtils } = ChromeUtils.import("resource://gre/modules/FileUtils.jsm");
handlerSvc = Cc["@mozilla.org/uriloader/handler-service;1"].getService(
	Ci.nsIHandlerService
);

class gkDownloadManager {
	static paneTemplate = `
	<html:div id="gkDownloadList" />
	<html:div id="gkDownloadActionButtons">
		<button id="gkDownloadShelfShowAll" label="${gkDownloadManagerBundle.GetStringFromName("showAllDownloads")}" />
		<button id="gkDownloadShelfToggle" />
	</html:div>
	`;

	static itemWarningExtensionsTemplate = `
	<hbox class="warning_not_malware">
		<image />
		<label class="warning_text" />
		<hbox class="warning-action-buttons">
			<button class="continue" label="${gkDownloadManagerBundle.GetStringFromName("continue")}" />
			<button class="discard" label="${gkDownloadManagerBundle.GetStringFromName("discard")}" />
		</hbox>
	</hbox>
	`;

	static itemWarningNotMalwareTemplate = `
	<hbox class="warning_not_malware">
		<image />
		<label class="warning_text" />
		<hbox class="warning-action-buttons">
			<button class="keep" label="${gkDownloadManagerBundle.GetStringFromName("keep")}" />
			<button class="discard" label="${gkDownloadManagerBundle.GetStringFromName("discard")}" />
		</hbox>
	</hbox>
	`;

	static itemWarningMalwareTemplate = `
	<hbox class="warning_malware">
		<image />
		<label class="warning_text" />
		<hbox class="warning-action-buttons">
			<button class="discard" label="${gkDownloadManagerBundle.GetStringFromName("discard")}" />
		</hbox>
	</hbox>
	<toolbarbutton class="more" type="menu">
		<html:div class="background">
			<html:div class="normal" />
			<html:div class="hot" />
			<html:div class="active" />
		</html:div>
		<html:div class="separator" />
		<image class="toolbarbutton-icon" type="menu"/>
		<menupopup position="before_start">
			<menuitem class="menuitem_keep" label="${gkDownloadManagerBundle.GetStringFromName("keep")}" />
			<menuseparator />
			<menuitem label="Learn more" onclick="openTrustedLinkIn('https://support.google.com/chrome/?p=ib_download_blocked', 'tab')" />
		</menupopup>
	</toolbarbutton>
	`;

	static itemDownloadingMenu = `
	<menuitem type="checkbox" class="openwhendone" label="${gkDownloadManagerBundle.GetStringFromName("openWhenDone")}" />
	<menuseparator />
	<menuitem class="pause" />
	<menuitem class="show" data-l10n-id="downloads-cmd-show-menuitem-2" />	
	<menuseparator />
	<menuitem class="cancel" data-l10n-id="bookmark-panel-cancel" />
	`

	static itemDownloadedMenu = `
	<menuitem class="open" data-l10n-id="places-open" />
	<menuitem class="alwaysopenthistype" type="checkbox" label="${gkDownloadManagerBundle.GetStringFromName("alwaysOpenFilesOfThisType")}" />
	<menuseparator />
	<menuitem class="show" data-l10n-id="downloads-cmd-show-menuitem-2" />	
	<menuseparator />
	<menuitem class="cancel" disabled="true" data-l10n-id="bookmark-panel-cancel" />
	`

	static get directorySlashes() {
		if (AppConstants.platform == "win")
			return "\\";
		else
			return "/";
	}

	static get shelf() {
		return document.getElementById("gkDownloadShelf");
	}

	static getDownloadItem(targetPath) {
		return document.querySelector(`.item[id="${targetPath.replace(/\\/g, "\\\\")}"]`);
	}

	static convertBytes(bytes) {
		const units = [
			gkDownloadManagerBundle.GetStringFromName("byte"),
			gkDownloadManagerBundle.GetStringFromName("kiloByte"),
			gkDownloadManagerBundle.GetStringFromName("megaByte"),
			gkDownloadManagerBundle.GetStringFromName("gigaByte"),
			gkDownloadManagerBundle.GetStringFromName("teraByte")
		];
		let unitIndex = 0;
	
		// Convert bytes to the appropriate unit
		while (bytes >= 1024 && unitIndex < units.length - 1) {
			bytes /= 1024;
			unitIndex++;
		}
	
		return { size: bytes, unit: units[unitIndex] };
	}

	static formatSize(bytes, showUnit = true) {
		const { size, unit } = this.convertBytes(bytes);
		const formattedSize = size.toFixed(1);
	
		return showUnit ? `${formattedSize} ${unit}` : `${formattedSize}`;
	}

	static formatETA(seconds) {
		seconds = parseInt(seconds);

		if (isNaN(seconds))
			seconds = 0;

		const timeUnits = [
			{ unit: "year",		seconds: 31536000 },
			{ unit: "month",	seconds: 2592000 },
			{ unit: "day",		seconds: 86400 },
			{ unit: "hour",		seconds: 3600 },
			{ unit: "minute",	seconds: 60 },
			{ unit: "second",	seconds: 1 }
		];
		
		for (const { unit, seconds: unitSeconds } of timeUnits) {
			var count = Math.floor(seconds / unitSeconds);

			if (count > 0) {
				if (count > 1) {
					if (unit)
						return `${count} ${gkDownloadManagerBundle.GetStringFromName(unit + "s")}`;
					else
						return;
				} else {
					if (unit)
						return `${count} ${gkDownloadManagerBundle.GetStringFromName(unit)}`;
					else
						return;
				}
			}
		}
	}

    static createShelf() {
		const browserElm = document.getElementById("tabbrowser-tabpanels");
        const downloadShelf = document.createElement("div");
		downloadShelf.id = "gkDownloadShelf";				
        gkInsertElm.after(downloadShelf, browserElm);
		downloadShelf.appendChild(MozXULElement.parseXULToFragment(this.paneTemplate));

		document.getElementById("gkDownloadShelfShowAll").addEventListener("click", () => {
			openTrustedLinkIn('about:downloads', 'tab');
			this.toggleShelf("hide");
		})
		document.getElementById("gkDownloadShelfToggle").addEventListener("click", () => {
			this.toggleShelf("hide");	
		});

		Downloads.getList(Downloads.ALL).then(list => {
			list.getAll().then(downloads => {
				// Iterate through all downloads and update UI if Firefox is launched and there are still downloads left
				for (let download of downloads) {
					gkDownloadManager.updateItem(download);
				}
			});

			list.addView({
				onDownloadAdded: download => {
					const downloadItem = gkDownloadManager.createItem(download);
					document.getElementById("gkDownloadList").prepend(downloadItem);
					const downloadItemElm = gkDownloadManager.getDownloadItem(download.target.path);

					downloadItemElm.addEventListener('contextmenu', (e) => {
						e.preventDefault();
						
						if (downloadItemElm.dataset.state.includes !== "dangerous") {
							document.getElementById(downloadItemElm.getAttribute("context")).openPopupAtScreen(e.screenX, e.screenY, true);

							downloadItemElm.querySelector(".more").removeAttribute("open");
						}
					});
					
					// Open / Open when complete
					downloadItemElm.querySelector(`.file-button`).addEventListener("click", (e) => {
						// Only open if it's a left click.
						if (e.button == 0) {
							if (!download.succeeded && !download.stopped && !download.error)
								gkDownloadManager.openWhenDone(download);
							else if (download.succeeded)
								gkDownloadManager.open(download);
						}
					});

					gkDownloadManager.updateItemMenu(download);	
					
					downloadItemElm.querySelector(`menupopup`).addEventListener("popupshowing", () => {
						// Open when done
						downloadItemElm.querySelector(`.openwhendone`).setAttribute("checked", download.launchWhenSucceeded);

						// Pause
						const pauseMenuItem = gkDownloadManager.getDownloadItem(download.target.path).querySelector(`.pause`);
						
						if (download.stopped)
							pauseMenuItem.dataset.l10nId = "downloads-cmd-resume";
						else
							pauseMenuItem.dataset.l10nId = "downloads-cmd-pause";
					});
					
					setTimeout(() => {
						gkDownloadManager.checkItemBounds();
					}, 450);
					addEventListener("resize", () => {
						gkDownloadManager.checkItemBounds();
					});

					// Initialize previous bytes and time for download speed calculation
					if (typeof downloadItemElm.dataset.previousBytes !== undefined)
						downloadItemElm.dataset.previousBytes = 0;

					if (typeof downloadItemElm.dataset.previousTime !== undefined)
						downloadItemElm.dataset.previousTime = Date.now();
				},
				onDownloadChanged: async function(download) {
					gkDownloadManager.updateItem(download);
					gkDownloadManager.updateItemMenu(download);

					if (download.succeeded) {
						const fileName = download.target.path.split(gkDownloadManager.directorySlashes).pop()	;

						const downloadItemElm = gkDownloadManager.getDownloadItem(download.target.path);
						// Always open files of this type
						downloadItemElm.querySelector(`menupopup`).addEventListener("popupshowing", () => {
							const downloadAlwaysOpenThisTypeMenuItem = downloadItemElm.querySelector(".alwaysopenthistype");

							downloadAlwaysOpenThisTypeMenuItem.removeAttribute("hidden");
							const mimeInfo = DownloadsCommon.getMimeInfo(download);
							downloadAlwaysOpenThisTypeMenuItem.setAttribute("checked", mimeInfo.preferredAction === mimeInfo.useSystemDefault);
						});

						// Special CRX treatment
						if (fileName.endsWith(".crx")) {
							const extensionJson = await gkChrTheme.getThemeData(`jar:file://${download.target.path}!/manifest.json`);

							if (extensionJson != null && extensionJson.theme) {
								downloadItemElm.querySelectorAll(".warning > *").forEach(warning => {
									warning.remove();
								});	
								downloadItemElm.querySelector(`.warning`).appendChild(MozXULElement.parseXULToFragment(gkDownloadManager.itemWarningExtensionsTemplate));
								downloadItemElm.querySelector(`.warning .warning_text`).textContent = gkDownloadManagerBundle.GetStringFromName("extensionsAndThemesCanHarm");
								downloadItemElm.dataset.state = "dangerous_not_malware";

								downloadItemElm.querySelector(`.continue`).addEventListener("click", async () => {
									try {
										if (AppConstants.platform == "win")
											await gkFileUtils.moveFile(download.target.path, `${chrThemesFolder.replace(/\//g, "\\")}${gkDownloadManager.directorySlashes}${fileName}`);
										else
											await gkFileUtils.moveFile(download.target.path, `${chrThemesFolder}${gkDownloadManager.directorySlashes}${fileName}`);

										const lighttheme = await AddonManager.getAddonByID("firefox-compact-light@mozilla.org");
										await lighttheme.enable();
										gkPrefUtils.set("Geckium.chrTheme.fileName").string(fileName.split(".")[0]);

										DownloadsCommon.deleteDownload(download).catch(console.error);
									} catch (error) {
										console.error('Failed to move file: ' + error.message);
										await DownloadsCommon.deleteDownload(download);
									}
								});

								downloadItemElm.querySelector(`.discard`).addEventListener("click", () => {
									if (gkPrefUtils.tryGet("Geckium.crx.saveDiscarded").bool) {
										downloadItemElm.dataset.state = "done";
									} else {
										DownloadsCommon.deleteDownload(download).catch(console.error);
									}
								});
							}
						}
					}
				},
				onDownloadRemoved: download => {
					const downloadItemElm = gkDownloadManager.getDownloadItem(download.target.path);
					if (downloadItemElm)
						downloadItemElm.remove();

					if (document.getElementById("gkDownloadList").children.length == 0)
						gkDownloadManager.toggleShelf("hide");

					setTimeout(() => {
						gkDownloadManager.checkItemBounds();
					}, 450);
				}
			});
		}).catch(console.error);
    }

	static toggleShelf(toggle) {
		if (!toggle) {
			if (this.shelf.getAttribute("hidden"))
				this.shelf.setAttribute("hidden", false);
			else
				this.shelf.setAttribute("hidden", true);	
		} else {
			switch (toggle) {
				case "show":
					this.shelf.setAttribute("hidden", false);	
					break;
				case "hide":
					this.shelf.setAttribute("hidden", true);
					break;
			}
		}
	}

	static createItem(download) {
		var downloadFileName;
		var downloadFileFormat;

		if (download.target.path.split(gkDownloadManager.directorySlashes).lastIndexOf('.') !== 1)
			downloadFileName = download.target.path.split(gkDownloadManager.directorySlashes).pop().slice(0, download.target.path.split(gkDownloadManager.directorySlashes).pop().lastIndexOf('.'));
		else
			downloadFileName = download.target.path.split(gkDownloadManager.directorySlashes).pop();

		if (download.target.path.split(".").pop())
			downloadFileFormat = download.target.path.split(".").pop();
		else
			downloadFileFormat = "";

		const itemTemplate = `
		<hbox class="item" id="${download.target.path}" context="${download.target.path}-menu" style="--gkdownload-progress: 0;">
			<image class="anim-begin" />
			<hbox class="main">
				<button class="file-button" flex="1">
					<html:div class="background">
						<html:div class="normal" />
						<html:div class="hot" />
						<html:div class="active" />
					</html:div>
					<html:div class="progress-container">
						<html:div class="progress-bg" />
						<html:div class="progress-mask" />
					<image class="icon" src="moz-icon://${download.target.path}?size=16&amp;state=normal" />
					</html:div>
					<vbox class="info">
						<html:div class="name">
							<label class="file">${downloadFileName}</label>
							<label class="format">.${downloadFileFormat}</label>
						</html:div>
						<html:div class="description">
							<label class="size" />
							<label class="eta" />
						</html:div>
					</vbox>
				</button>
				<toolbarbutton class="more" type="menu">
					<html:div class="background">
						<html:div class="normal" />
						<html:div class="hot" />
						<html:div class="active" />
					</html:div>
					<html:div class="separator" />
					<image class="toolbarbutton-icon" type="menu"/>
					<menupopup id="${download.target.path}-menu" position="before_start" />
				</toolbarbutton>
			</hbox>
			<hbox class="warning" />
		</hbox>
		`

		this.toggleShelf("show");

		return MozXULElement.parseXULToFragment(itemTemplate);
	}

	static updateItem(download) {
		const downloadItemElm = gkDownloadManager.getDownloadItem(download.target.path);
		// Update the downloaded size / total file size using the same unit
		const downloadedSize = gkDownloadManager.formatSize(download.currentBytes);
		const totalSize = gkDownloadManager.formatSize(download.totalBytes);	

		if (download.launchWhenSucceeded) {
			downloadItemElm.querySelector(`.size`).textContent = ``;
		} else {	
			if (download.totalBytes !== 0)		
				downloadItemElm.querySelector(`.size`).textContent = `${gkDownloadManager.formatSize(download.currentBytes, false)}/${totalSize},\xa0`;
			else
				downloadItemElm.querySelector(`.size`).textContent = `${downloadedSize}`;
		}
				
		// Calculate and update download speed	
		const remainingBytes = download.totalBytes - download.currentBytes;
		const currentTime = Date.now();

		if (typeof downloadItemElm.dataset.previousTime !== undefined)
			var elapsedTime = (currentTime - downloadItemElm.dataset.previousTime) / 1000;

		if (typeof downloadItemElm.dataset.previousBytes !== undefined)
			var downloadSpeed = (download.currentBytes - downloadItemElm.dataset.previousBytes) / elapsedTime;

		const estimatedTimeRemaining = remainingBytes / downloadSpeed;

		if (!isNaN(estimatedTimeRemaining)) {
			if (download.totalBytes !== 0) {
				if (gkDownloadManager.formatETA(estimatedTimeRemaining))
					downloadItemElm.querySelector(`.eta`).textContent = gkDownloadManagerBundle.GetStringFromName("timeLeft").replace("%s", gkDownloadManager.formatETA(estimatedTimeRemaining));
				else
					downloadItemElm.querySelector(`.eta`).textContent = "";
			}
			else {
				downloadItemElm.querySelector(`.eta`).textContent = "";
			}

			if (download.launchWhenSucceeded) {
				if (download.totalBytes !== 0) {
					if (gkDownloadManager.formatETA(estimatedTimeRemaining))
						downloadItemElm.querySelector(`.eta`).textContent = gkDownloadManagerBundle.GetStringFromName("openingInTime").replace("%s", gkDownloadManager.formatETA(estimatedTimeRemaining));
					else
						downloadItemElm.querySelector(`.eta`).textContent = "";
				} else {
					downloadItemElm.querySelector(`.eta`).textContent = gkDownloadManagerBundle.GetStringFromName("openingWhenComplete");
				}
					
			}
		}

		// Update previous values for the next calculation
		downloadItemElm.dataset.previousBytes = download.currentBytes;
		downloadItemElm.dataset.previousTime = currentTime;

		if (download.hasProgress) {
			downloadItemElm.dataset.state = "progress";

			if (!download.canceled || !download.error)	
				downloadItemElm.style.setProperty('--gkdownload-progress', `${download.progress}%`);
		}

		if (download.succeeded) {
			downloadItemElm.dataset.state = "done";
		} else if (download.canceled) {
			downloadItemElm.dataset.state = "canceled";

			if (download.hasPartialData)
				downloadItemElm.querySelector(`.size`).textContent = DownloadsCommon.strings.statePaused;
			else
				downloadItemElm.querySelector(`.size`).textContent = DownloadsCommon.strings.stateCanceled;		

			downloadItemElm.querySelector(`.eta`).textContent = "";
		} else if (download.error) {
			if (download.hasBlockedData) {
				if (download.error.reputationCheckVerdict == Downloads.Error.BLOCK_VERDICT_MALWARE)
					downloadItemElm.dataset.state = "dangerous_malware";
				else
					downloadItemElm.dataset.state = "dangerous_not_malware";
				
				if (downloadItemElm.querySelector(`.warning`).children.length == 0) {
					if (download.error.reputationCheckVerdict == Downloads.Error.BLOCK_VERDICT_MALWARE) {
						downloadItemElm.querySelector(`.warning`).appendChild(MozXULElement.parseXULToFragment(gkDownloadManager.itemWarningMalwareTemplate));
						downloadItemElm.querySelector(`.warning .warning_text`).textContent = gkDownloadManagerBundle.GetStringFromName("fileIsMaliciousAndBrowserHasBlockedIt").replace("%s", download.target.path.split(gkDownloadManager.directorySlashes).pop()).replace("%b", gkBranding.getBrandingKey("productName", true));
						downloadItemElm.querySelector(`.menuitem_keep`).addEventListener("click", () => {
							download.unblock();
						});
					} else {
						downloadItemElm.querySelector(`.warning`).appendChild(MozXULElement.parseXULToFragment(gkDownloadManager.itemWarningNotMalwareTemplate));
						downloadItemElm.querySelector(`.warning .warning_text`).textContent = gkDownloadManagerBundle.GetStringFromName("thisTypeOfFileCanHarmYourComputer").replace("%s", download.target.path.split(gkDownloadManager.directorySlashes).pop());
						downloadItemElm.querySelector(`.keep`).addEventListener("click", () => {
							download.unblock();
						});
					}

					downloadItemElm.querySelector(`.discard`).addEventListener("click", () => {
						download.confirmBlock();
						DownloadsCommon.deleteDownload(download).catch(console.error);		
					});
				}	
			} else {
				downloadItemElm.dataset.state = "error";

				if (download.error.localizedReason)
					downloadItemElm.querySelector(`.size`).textContent = `${DownloadsCommon.strings.stateFailed} - ${download.error.localizedReason}`;
				else
					downloadItemElm.querySelector(`.size`).textContent = `${DownloadsCommon.strings.stateFailed}`;
			}

			downloadItemElm.querySelector(`.eta`).textContent = "";
		}
	}

	static open(download) {
		const downloadItemElm = gkDownloadManager.getDownloadItem(download.target.path);			

		download.launch().catch((e) => {
			console.error(e);		

			if (e.result == Components.results.NS_ERROR_FILE_NOT_FOUND) {
				downloadItemElm.dataset.state = "error";
				downloadItemElm.querySelector(".description > .size").textContent = gkDownloadManagerBundle.GetStringFromName("removed");
			}
		});
	}

	static openWhenDone(download) {
		if (download.launchWhenSucceeded)
			download.launchWhenSucceeded = false;
		else
			download.launchWhenSucceeded = true;
	}

	static alwaysOpenThisType(download) {
		const mimeInfo = DownloadsCommon.getMimeInfo(download);
		if (!mimeInfo) {
			console.log("ERROR!", mimeInfo);
			throw new Error("Can't open download with unknown mime-type");	
		}
		
		// User has selected to always open this mime-type from now on and will add this
		// mime-type to our preferences table with the system default option. Open the
		// file immediately after selecting the menu item like alwaysOpenInSystemViewer.
		if (mimeInfo.preferredAction !== mimeInfo.useSystemDefault) {			
			mimeInfo.preferredAction = mimeInfo.useSystemDefault;
			handlerSvc.store(mimeInfo);
			DownloadsCommon.openDownload(download).catch(console.error);
		} else {
		// Otherwise, if user unchecks this option after already enabling it from the
		// context menu, resort to saveToDisk.
			mimeInfo.preferredAction = mimeInfo.saveToDisk;
			handlerSvc.store(mimeInfo);
		}
	}

	static pauseOrResume(download) {
		const pauseMenuItem = gkDownloadManager.getDownloadItem(download.target.path).querySelector(`.pause`);

		if (download.stopped)
			download.start();
		else
			download.cancel();
	}

	static cancel(download) {
		download.cancel().catch(() => {});
		download.removePartialData().catch(console.error).finally(() => download.target.refresh());
	}

	static showInFolder(download) {
		let file = new FileUtils.File(download.target.path);
		DownloadsCommon.showDownloadedFile(file);
	}

	static updateItemMenu(download) {
		const downloadItemElm = gkDownloadManager.getDownloadItem(download.target.path);
		const downloadItemMenu = downloadItemElm.querySelector("menupopup");

		if (download.succeeded) {
			if (downloadItemMenu.getAttribute("menu-type") == "downloaded")
				return;
			
			downloadItemMenu.querySelectorAll("*").forEach(item => {
				item.remove();
			});

			downloadItemMenu.appendChild(MozXULElement.parseXULToFragment(gkDownloadManager.itemDownloadedMenu));
			downloadItemMenu.setAttribute("menu-type", "downloaded");

			downloadItemElm.querySelector(".open").addEventListener("click", () => {
				this.open(download);
			});

			downloadItemElm.querySelector(".alwaysopenthistype").addEventListener("click", () => {
				this.alwaysOpenThisType(download);
			});
		} else if (download.canceled && !download.hasPartialData) {
			downloadItemElm.querySelectorAll("menuitem").forEach(menuitem => {
				menuitem.setAttribute("disabled", true);
			});
		} else {
			if (downloadItemMenu.getAttribute("menu-type") == "downloading")
				return;

			downloadItemMenu.querySelectorAll("*").forEach(item => {
				item.remove();
			});

			downloadItemMenu.appendChild(MozXULElement.parseXULToFragment(gkDownloadManager.itemDownloadingMenu));
			downloadItemMenu.setAttribute("menu-type", "downloading");

			downloadItemElm.querySelector(".openwhendone").addEventListener("click", () => {
				this.openWhenDone(download);
			});

			downloadItemElm.querySelector(".pause").addEventListener("click", () => {
				this.pauseOrResume(download);
			});

			downloadItemElm.querySelector(".cancel").addEventListener("click", () => {
				this.cancel(download);	
			});
		}

		downloadItemElm.querySelector(".show").addEventListener("click", () => {
			this.showInFolder(download);
		});
	}

	static checkItemBounds() {
		const parent = document.getElementById("gkDownloadList");
		const children = document.querySelectorAll(`#gkDownloadList > .item`);

		children.forEach(child => {	
			const childRect = child.getBoundingClientRect();
			const parentRect = parent.getBoundingClientRect();
			
			if (childRect.right > parentRect.width) {
				child.style.opacity = '0';
				child.style.pointerEvents = 'none';
			} else {
				child.style.opacity = '1';
				child.style.pointerEvents = 'auto';
			}
		});
	}
}

UC_API.Runtime.startupFinished().then(()=>{
	if (!isBrowserPopUpWindow)
		gkDownloadManager.createShelf();
});