// ==UserScript==
// @name        Geckium - Downloads Manager
// @author		AngelBruni
// @description	Downloads Manager made to adapt to different Chromium designs.
// @loadorder   3
// ==/UserScript==

/**
 * THIS IS SUPER EXPERIMENTAL, IT WILL HAVE BUGS.
 */

class gkDownloadsManager {
	static paneTemplate = `
	<html:div id="gkDownloadsList" />
	<html:div id="gkDownloadsActionButtons">
		<button id="gkDownloadsPaneShowAll">
			Show all downloads...
		</button>
		<button id="gkDownloadsPaneToggle">
			x
		</button>
	</html:div>
	`

	static get pane() {
		return document.getElementById("gkDownloadsPane");
	}

    static createPane() {
        //const browserElm = document.getElementById("browser");
		const browserElm = document.getElementById("tabbrowser-tabpanels");
        const downloadsPane = document.createElement("div");
		downloadsPane.setAttribute("hidden", true);
        downloadsPane.id = "gkDownloadsPane";
        gkInsertElm.after(downloadsPane, browserElm);
		downloadsPane.appendChild(MozXULElement.parseXULToFragment(this.paneTemplate));

		document.getElementById("gkDownloadsPaneShowAll").addEventListener("click", () => {
			openTrustedLinkIn('about:downloads', 'tab');
			this.togglePane("hide");
		})
		document.getElementById("gkDownloadsPaneToggle").addEventListener("click", () => {
			this.togglePane("hide");	
		});

		Downloads.getList(Downloads.ALL).then(list => {
			list.addView({
				onDownloadAdded: download => {
					const downloadItem = gkDownloadsManager.createItem(download);
					document.getElementById("gkDownloadsList").appendChild(MozXULElement.parseXULToFragment(downloadItem));

						document.querySelector(`.item[id="${download.target.path}"] .pause`).addEventListener("click", () => {
							if (download.stopped)
								download.start();
							else
								download.cancel();
						})

					// Initialize previous bytes and time for download speed calculation
					downloadItem.dataset.previousBytes = 0;
					downloadItem.dataset.previousTime = Date.now();

					download.onchange = function () {
						gkDownloadsManager.updateItem(download);
					};
				},
				onDownloadChanged: download => {
					gkDownloadsManager.updateItem(download);
				},
				onDownloadRemoved: download => {
					const downloadItem = document.querySelector(`[data-download-id="${download.target.path}"]`);
					if (downloadItem) {
						downloadItem.remove();
					}
				}
			});
		}).catch(console.error);
    }

	static togglePane(toggle) {
		if (!toggle) {
			if (this.pane.getAttribute("hidden"))
				this.pane.removeAttribute("hidden");
			else
				this.pane.setAttribute("hidden", true);	
		} else {
			switch (toggle) {
				case "show":
					this.pane.removeAttribute("hidden");	
					break;
				case "hide":
					this.pane.setAttribute("hidden", true);
					break;
			}
		}
		
	}

	static createItem(download) {
		const itemTemplate = `
		<hbox class="item" id="${download.target.path}" style="--gkdownload-progress: 0;">
			<image class="anim-begin" />
			<button class="main" flex="1">
				<html:div class="progress-container">
					<html:div class="progress-bg" />
					<html:div class="progress-mask" />
				<image class="icon" src="moz-icon://${download.target.path}?size=16&amp;state=normal" />
				</html:div>
				<vbox class="info">
					<label>${download.target.path.split("/").pop()}</label>
					<html:div class="description">
						<label class="size" />
						<label class="eta" />
					</html:div>
				</vbox>
			</button>
			<toolbarbutton class="more" type="menu">
				<menupopup position="before_start">
					<menuitem label="Open when done" />
					<menuitem label="Always open files of this type" />
					<menuseparator />
					<menuitem class="pause" label="Pause" />
					<menuitem class="show" label="Show in folder" />	
					<menuseparator />
					<menuitem label="Cancel" />	
				</menupopup>
			</toolbarbutton>
		</hbox>
		`

		this.togglePane("show");

		return itemTemplate;
	}

	static updateItem(download) {
		const downloadItem = document.getElementById(download.target.path);

		if (downloadItem) {
			function formatSize(bytes, unitIndex) {
				while (unitIndex > 0) {
					bytes /= 1024;
					unitIndex--;
				}
				return `${bytes.toFixed(1)}`;
			}

			function determineUnitIndex(bytes) {
				const units = ["B", "KB", "MB", "GB", "TB"];
				let unitIndex = 0;
	
				while (bytes >= 1024 && unitIndex < units.length - 1) {
					bytes /= 1024;
					unitIndex++;
				}
	
				return unitIndex;
			}

			// Determine the appropriate unit index for the total size
			const totalUnitIndex = determineUnitIndex(download.totalBytes);
			const units = ["B", "KB", "MB", "GB", "TB"];
			const unit = units[totalUnitIndex];

			if (download.hasProgress) {
				downloadItem.dataset.state = "progress";

				if (!download.canceled || !download.error) {
					downloadItem.style.setProperty('--gkdownload-progress', `${download.progress}%`);

					// Update the downloaded size / total file size using the same unit
					const downloadedSize = formatSize(download.currentBytes, totalUnitIndex);
					const totalSize = formatSize(download.totalBytes, totalUnitIndex);
						document.querySelector(`.item[id="${download.target.path}"] .size`).textContent = `${downloadedSize}/${totalSize} ${unit},\xa0		`;
							
					// Calculate and update download speed	
					const remainingBytes = download.totalBytes - download.currentBytes;
					const currentTime = Date.now();
					const elapsedTime = (currentTime - downloadItem.dataset.previousTime) / 1000;
					const downloadSpeed = (download.currentBytes - downloadItem.dataset.previousBytes) / elapsedTime;
					const estimatedTimeRemaining = remainingBytes / downloadSpeed;

					if (!isNaN(estimatedTimeRemaining)) {
						const minutes = Math.floor(estimatedTimeRemaining / 60);
						const seconds = Math.floor(estimatedTimeRemaining % 60);
						document.querySelector(`.item[id="${download.target.path}"] .eta`).textContent = `${minutes}m ${seconds}s`;
					}

					// Update previous values for the next calculation
					downloadItem.dataset.previousBytes = download.currentBytes;
					downloadItem.dataset.previousTime = currentTime;
				}
			}

			if (download.succeeded) {
				downloadItem.dataset.state = "done";
			} else if (download.canceled) {
				downloadItem.dataset.state = "canceled";
				document.querySelector(`.item[id="${download.target.path}"] .size`).textContent = `Canceled`;
				document.querySelector(`.item[id="${download.target.path}"] .eta`).textContent = ``;
			} 	else if (download.error) {
				downloadItem.dataset.state = "error";
				document.querySelector(`.item[id="${download.target.path}"] .size`).textContent = `Canceled`;
				document.querySelector(`.item[id="${download.target.path}"] .eta`).textContent = ``;
			}
		}
	}
}

_ucUtils.windowIsReady(window).then(() => {
	gkDownloadsManager.createPane();
});