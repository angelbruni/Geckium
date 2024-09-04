// ==UserScript==
// @name        Geckium - Downloads Manager
// @author		AngelBruni
// @description	Downloads Manager made to adapt to different Chromium designs.
// @loadorder   3
// ==/UserScript==

/**
 * THIS IS SUPER EXPERIMENTAL, IT WILL HAVE BUGS.
 */

class gkdownloadmanager {
	static paneTemplate = `
	<html:div id="gkDownloadList" />
	<html:div id="gkDownloadActionButtons">
		<button id="gkDownloadShelfShowAll" label="Show all downloads..." />
		<button id="gkDownloadShelfToggle" />
	</html:div>
	`

	static get shelf() {
		return document.getElementById("gkDownloadShelf");
	}

    static createShelf() {
        //const browserElm = document.getElementById("browser");
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
			list.addView({
				onDownloadAdded: download => {
					const downloadItem = gkdownloadmanager.createItem(download);
					document.getElementById("gkDownloadList").prepend(downloadItem);
					document.querySelector(`.item[id="${download.target.path}"] .main`).addEventListener("click", () => {
						if (download.hasProgress && !download.succeeded) {
							if (download.launchWhenSucceeded)
								download.launchWhenSucceeded = false;
							else
								download.launchWhenSucceeded = true;
						} else if (download.hasProgress && download.succeeded) {
							download.launch().catch(console.error);
						}
					});

					document.querySelector(`.item[id="${download.target.path}"] .pause`).addEventListener("click", () => {
						if (download.stopped)
							download.start();
						else
							download.cancel();
					});

					// Initialize previous bytes and time for download speed calculation
					downloadItem.dataset.previousBytes = 0;
					downloadItem.dataset.previousTime = Date.now();
				},
				onDownloadChanged: download => {
					gkdownloadmanager.updateItem(download);
				},
				onDownloadRemoved: download => {
					const downloadItem = document.querySelector(`.item[id="${download.target.path}"]`);
					if (downloadItem)
						downloadItem.remove();

					if (document.getElementById("gkDownloadList").children.length == 0)
						gkdownloadmanager.toggleShelf("hide");
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
		const itemTemplate = `
		<hbox class="item" id="${download.target.path}" style="--gkdownload-progress: 0;">
			<image class="anim-begin" />
			<button class="main" flex="1">
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
					<label class="name">${download.target.path.split("/").pop()}</label>
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
					<menuitem label="Open when done" />
					<menuitem label="Always open files of this type" />
					<menuseparator />
					<menuitem class="pause" data-l10n-id="downloads-cmd-pause" />
					<menuitem class="show" data-l10n-id="downloads-cmd-show-menuitem-2" />	
					<menuseparator />
					<menuitem label="Cancel" />	
				</menupopup>
			</toolbarbutton>
		</hbox>
		`

		this.toggleShelf("show");

		return MozXULElement.parseXULToFragment(itemTemplate);
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

					if (download.launchWhenSucceeded)
						document.querySelector(`.item[id="${download.target.path}"] .size`).textContent = ``;
					else
						document.querySelector(`.item[id="${download.target.path}"] .size`).textContent = `${downloadedSize}/${totalSize} ${unit},\xa0`;
							
					// Calculate and update download speed	
					const remainingBytes = download.totalBytes - download.currentBytes;
					const currentTime = Date.now();
					const elapsedTime = (currentTime - downloadItem.dataset.previousTime) / 1000;
					const downloadSpeed = (download.currentBytes - downloadItem.dataset.previousBytes) / elapsedTime;
					const estimatedTimeRemaining = remainingBytes / downloadSpeed;

					if (!isNaN(estimatedTimeRemaining)) {
						if (download.launchWhenSucceeded)
							document.querySelector(`.item[id="${download.target.path}"] .eta`).textContent = `Opening in ${formatETA(estimatedTimeRemaining)}...`;
						else
							document.querySelector(`.item[id="${download.target.path}"] .eta`).textContent = `${formatETA(estimatedTimeRemaining)} left`;
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
			} else if (download.error) {
				downloadItem.dataset.state = "error";
				document.querySelector(`.item[id="${download.target.path}"] .size`).textContent = `Canceled`;
				document.querySelector(`.item[id="${download.target.path}"] .eta`).textContent = ``;
			}
		}
		
		function formatETA(seconds) {
			const timeUnits = [
				{ unit: "year", 	seconds: 31536000 },
				{ unit: "month",	seconds: 2592000 },
				{ unit: "day", 		seconds: 86400 },
				{ unit: "hour", 	seconds: 3600 },
				{ unit: "min", 		seconds: 60 },
				{ unit: "sec", 		seconds: 1 }
			];
	
			for (const { unit, seconds: unitSeconds } of timeUnits) {
				const count = Math.floor(seconds / unitSeconds);
				if (count > 0)
					return `${count} ${unit}${count > 1 ? "s" : ""}`;
			}
		}
	}
}

_ucUtils.windowIsReady(window).then(() => {
	gkdownloadmanager.createShelf();
});