// ==UserScript==
// @name        Geckium - Downloads Manager
// @author		AngelBruni
// @description	Downloads Manager made to adapt to different Chromium designs.
// @loadorder   3
// ==/UserScript==

/**
 * THIS IS SUPER EXPERIMENTAL, IT WILL HAVE BUGS.
 */

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

	static warningNotMalwareTemplate = `
	<hbox class="warning_not_malware">
		<image />
		<label class="warning_text" />
		<hbox class="warning-action-buttons">
			<button class="keep" label="${gkDownloadManagerBundle.GetStringFromName("keep")}" />
			<button class="discard" label="${gkDownloadManagerBundle.GetStringFromName("discard")}" />
		</hbox>
	</hbox>
	`;

	static warningMalwareTemplate = `
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

	static get shelf() {
		return document.getElementById("gkDownloadShelf");
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
					const downloadItemElm = document.querySelector(`.item[id="${download.target.path}"]`);
					setTimeout(() => {
						gkDownloadManager.checkItemBounds();
					}, 450);
					addEventListener("resize", () => {
						gkDownloadManager.checkItemBounds();
					});
					
					// Popup Showing check
					downloadItemElm.querySelector(`menupopup`).addEventListener("popupshowing", () => {
						if (download.succeeded) {
							// Open when done
							downloadItemElm.querySelector(`.openwhendone`).removeAttribute("type");
							downloadItemElm.querySelector(`.openwhendone`).removeAttribute("checked");
							downloadItemElm.querySelector(`.openwhendone`).setAttribute("data-l10n-id", "places-open");

							// Always open files of this type
							downloadItemElm.querySelector(`.alwaysopenthistype`).removeAttribute("hidden");
							const mimeInfo = DownloadsCommon.getMimeInfo(download);
							if (mimeInfo.preferredAction === mimeInfo.useSystemDefault)
								downloadItemElm.querySelector(`.alwaysopenthistype`).setAttribute("checked", true);
							else
								downloadItemElm.querySelector(`.alwaysopenthistype`).removeAttribute("checked");

							downloadItemElm.querySelector(`.pause`).setAttribute("hidden", true);
							downloadItemElm.querySelector(`.cancel`).setAttribute("hidden", true);
							downloadItemElm.querySelector(`.cancelseparator`).setAttribute("hidden", true);
						} else if (download.canceled && !download.hasPartialData) {
							document.querySelectorAll(`.item[id="${download.target.path}"] menuitem`).forEach(menuitem => {
								menuitem.setAttribute("disabled", true);
							});
						} else {
							// Open when done
							downloadItemElm.querySelector(`.openwhendone`).setAttribute("label", gkDownloadManagerBundle.GetStringFromName("openWhenDone"));
							downloadItemElm.querySelector(`.openwhendone`).setAttribute("checked", download.launchWhenSucceeded);

							// Always open files of this type
							downloadItemElm.querySelector(`.alwaysopenthistype`).setAttribute("hidden", true);

							// Pause
							downloadItemElm.querySelector(`.pause`).removeAttribute("hidden");
							if (download.stopped)
								downloadItemElm.querySelector(`.pause`).setAttribute("data-l10n-id", "downloads-cmd-resume");
							else
								downloadItemElm.querySelector(`.pause`).setAttribute("data-l10n-id", "downloads-cmd-pause");


							downloadItemElm.querySelector(`.cancel`).removeAttribute("hidden");
							downloadItemElm.querySelector(`.cancelseparator`).removeAttribute("hidden");
						}
					});

					// Open / Open when complete
					downloadItemElm.querySelector(`.file-button`).addEventListener("click", () => {
						if (!download.succeeded && !download.stopped && !download.error) {
							if (download.launchWhenSucceeded)
								download.launchWhenSucceeded = false;
							else
								download.launchWhenSucceeded = true;
						} else if (download.succeeded) {
							download.launch().catch(console.error);
						}
					});
					downloadItemElm.querySelector(`.openwhendone`).addEventListener("click", () => {
						if (!download.succeeded && !download.stopped && !download.error) {
							if (download.launchWhenSucceeded)
								download.launchWhenSucceeded = false;
							else
								download.launchWhenSucceeded = true;
						} else if (download.succeeded) {
							download.launch().catch(console.error);
						}
					});


					// Always open files of this type
					downloadItemElm.querySelector(`.alwaysopenthistype`).addEventListener("click", () => {
						const mimeInfo = DownloadsCommon.getMimeInfo(download);
						if (!mimeInfo)
							throw new Error("Can't open download with unknown mime-type");

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
					});

					// Pause // Resume
					downloadItemElm.querySelector(`.pause`).addEventListener("click", () => {
						if (download.stopped)
							download.start();
						else
							download.cancel();
					});
					
					// Show in folder
					downloadItemElm.querySelector(`.show`).addEventListener("click", () => {
						let file = new FileUtils.File(download.target.path);
						DownloadsCommon.showDownloadedFile(file);
					});

					// Cancel
					downloadItemElm.querySelector(`.cancel`).addEventListener("click", () => {
						download.cancel().catch(() => {});
						download.removePartialData().catch(console.error).finally(() => this.download.target.refresh());
					});

					// Initialize previous bytes and time for download speed calculation
					if (typeof downloadItem.dataset.previousBytes !== undefined)
						downloadItem.dataset.previousBytes = 0;

					if (typeof downloadItem.dataset.previousTime !== undefined)
						downloadItem.dataset.previousTime = Date.now();
				},
				onDownloadChanged: download => {
					gkDownloadManager.updateItem(download);
				},
				onDownloadRemoved: download => {
					const downloadItemElm = document.querySelector(`.item[id="${download.target.path}"]`);
					if (downloadItemElm)
						downloadItemElm.remove();

					if (document.getElementById("gkDownloadList").children.length == 0)
						gkDownloadManager.toggleShelf("hide");
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

		if (download.target.path.split("/").lastIndexOf('.') !== 1)
			downloadFileName = download.target.path.split("/").pop().slice(0, download.target.path.split("/").pop().lastIndexOf('.'));
		else
			downloadFileName = download.target.path.split("/").pop();

		if (download.target.path.split(".").pop())
			downloadFileFormat = "." + download.target.path.split(".").pop();
		else
			downloadFileFormat = "";

		const itemTemplate = `
		<hbox class="item" id="${download.target.path}" style="--gkdownload-progress: 0;">
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
					<menupopup position="before_start">
						<menuitem type="checkbox" class="openwhendone" />
						<menuitem class="alwaysopenthistype" type="checkbox" label="${gkDownloadManagerBundle.GetStringFromName("alwaysOpenFilesOfThisType")}" />
						<menuseparator />
						<menuitem class="pause" />
						<menuitem class="show" data-l10n-id="downloads-cmd-show-menuitem-2" />	
						<menuseparator class="cancelseparator" />
						<menuitem class="cancel" data-l10n-id="bookmark-panel-cancel" />	
					</menupopup>
				</toolbarbutton>
			</hbox>
			<hbox class="warning" />
		</hbox>
		`

		this.toggleShelf("show");

		return MozXULElement.parseXULToFragment(itemTemplate);
	}

	static updateItem(download) {
		const downloadItemElm = document.querySelector(`.item[id="${download.target.path}"]`);

		if (downloadItemElm) {	
			function convertBytes(bytes) {
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

			function formatSize(bytes, showUnit = true) {
				const { size, unit } = convertBytes(bytes);
				const formattedSize = size.toFixed(1);
			
				return showUnit ? `${formattedSize} ${unit}` : `${formattedSize}`;
			}

			// Update the downloaded size / total file size using the same unit
			const downloadedSize = formatSize(download.currentBytes);
			const totalSize = formatSize(download.totalBytes);	

			if (download.launchWhenSucceeded) {
				downloadItemElm.querySelector(`.size`).textContent = ``;
			} else {	
				if (download.totalBytes !== 0)		
					downloadItemElm.querySelector(`.size`).textContent = `${formatSize(download.currentBytes, false)}/${totalSize},\xa0`;
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
					if (formatETA(estimatedTimeRemaining))
						downloadItemElm.querySelector(`.eta`).textContent = gkDownloadManagerBundle.GetStringFromName("timeLeft").replace("%s", formatETA(estimatedTimeRemaining));
					else
						downloadItemElm.querySelector(`.eta`).textContent = "";
				}
				else {
					downloadItemElm.querySelector(`.eta`).textContent = "";
				}

				if (download.launchWhenSucceeded) {
					if (download.totalBytes !== 0) {
						if (formatETA(estimatedTimeRemaining))
							downloadItemElm.querySelector(`.eta`).textContent = gkDownloadManagerBundle.GetStringFromName("openingInTime").replace("%s", formatETA(estimatedTimeRemaining));
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
							downloadItemElm.querySelector(`.warning`).appendChild(MozXULElement.parseXULToFragment(gkDownloadManager.warningMalwareTemplate));
							downloadItemElm.querySelector(`.warning .warning_text`).textContent = gkDownloadManagerBundle.GetStringFromName("fileIsMaliciousAndBrowserHasBlockedIt").replace("%s", download.target.path.split("/").pop()).replace("%b", gkBranding.getBrandingKey("productName", true));
							downloadItemElm.querySelector(`.menuitem_keep`).addEventListener("click", () => {
								download.unblock();
							});
						} else {
							downloadItemElm.querySelector(`.warning`).appendChild(MozXULElement.parseXULToFragment(gkDownloadManager.warningNotMalwareTemplate));
							downloadItemElm.querySelector(`.warning .warning_text`).textContent = gkDownloadManagerBundle.GetStringFromName("thisTypeOfFileCanHarmYourComputer").replace("%s", download.target.path.split("/").pop());
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
		
		function formatETA(seconds) {
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

_ucUtils.windowIsReady(window).then(() => {
	gkDownloadManager.createShelf();
});