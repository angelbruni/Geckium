export class gkFileUtils {
    static moveFile(oldFilePath, newFilePath) {
        return new Promise((resolve, reject) => {
            try {
                let oldFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
                oldFile.initWithPath(oldFilePath);

                let newFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
                newFile.initWithPath(newFilePath);

                // Move the file
                oldFile.moveTo(newFile.parent, newFile.leafName);

                // Function to check if the file exists at the new location
                const checkFileMoved = (checkCount, maxChecks, checkInterval) => {
                    if (newFile.exists()) {
                        console.log(`File successfully moved from ${oldFilePath} to ${newFilePath}`);
                        resolve(`File moved from ${oldFilePath} to ${newFilePath}`);
                    } else if (checkCount < maxChecks) {
                        /* If the file doesn't exist yet, it means the file has not finished moving.
                            If we've not reached max checks, check again after interval. */
                        setTimeout(() => {
                            checkFileMoved(checkCount + 1, maxChecks, checkInterval);
                        }, checkInterval);
                    } else {
                        // If maximum checks exceeded, fail.
                        reject(new Error("File move did not complete within expected time."));
                    }
                };

                const checkInterval = 100;
                const maxChecks = 50;
                checkFileMoved(0, maxChecks, checkInterval);

            } catch (e) {
                console.error(`Failed to move file: ${e}`);
                reject(new Error(`Failed to move file: ${e}`));
            }
        });
    }
}