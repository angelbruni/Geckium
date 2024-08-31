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
		document.getElementById("gkDownloadsPaneToggle").addEventListener("click", this.togglePane);

		Downloads.getList(Downloads.ALL).then(list => {
			// Listen for downloads being added to the list
			list.addView({	
				onDownloadAdded: download => {
					console.log("Download started:", download.source.url, download.target.path, download.target.path.split("/")[parseInt(download.target.path.split("/").length) - 1]);

					this.createItem({
						url: download.source.url,
						directory: download.target.path,
						name: download.target.path.split("/")[parseInt(download.target.path.split("/").length) - 1]
					})

					download.onchange = function () {
						if (download.hasProgress) {
							// console.log("Download progress:", download.target.path, download.progress + "%");

							gkDownloadsManager.updateItem(download.target.path, download.progress);
						}
	
						/* if (download.succeeded) {
							console.log("Download completed:", download.target.path);
						} else if (download.canceled) {
							console.log("Download canceled");
						} else if (download.error) {
							console.log("Download failed:", download.error);
						}*/

						// console.log("Download state changed:", download.state);
					};
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

	static createItem(params) {
		const itemTemplate = `
		<hbox class="item" data-directory="${params.directory}">
			<image class="anim-begin" />
			<button class="main" flex="1">
				<html:div class="progress-container">
					<html:div class="progress-bg" />
					<html:div class="progress-mask" />
					<image class="icon" src="moz-icon://${params.directory}?size=16&amp;state=normal" />
				</html:div>
				<vbox class="info">
					<label>${params.name}</label>
					<label class="estimate">...</label>
				</vbox>
			</button>
			<button class="more" />
		</hbox>
		`

		this.togglePane("show");

		document.getElementById("gkDownloadsList").appendChild(MozXULElement.parseXULToFragment(itemTemplate));
	}

	static updateItem(directory, progress) {
		document.querySelector(`#gkDownloadsList > .item[data-directory="${directory}"]`).setAttribute("data-progress", progress);
		document.querySelector(`#gkDownloadsList > .item[data-directory="${directory}"]`).style.setProperty('--gkdownload-progress', `${progress}%`);;
	}
}

_ucUtils.windowIsReady(window).then(() => {
	gkDownloadsManager.createPane();
});