export class gkUpdater {
	static async getVersion() {
		try {
			const response = await fetch("chrome://userchrome/content/version.json");
			const data = await response.json();

			const version = data.version;
			const updateChannel = data.update_channel;
			let channel;
			switch (updateChannel) {
				case "alpha":
					channel = "a";
					break;
				case "beta":
					channel = "b";
					break;
				case "canary":
					channel = "c";
					break;
			}

			return channel + version;
		} catch (error) {
			console.error('Error fetching JSON:', error);
			throw error; // re-throw the error to propagate it further if needed
		}
	}
	
	static checkForUpdates() {
		return "W.I.P."
	}
}