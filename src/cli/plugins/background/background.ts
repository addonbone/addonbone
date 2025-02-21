import {findBackgroundFiles} from "@cli/utils/entrypoint";
import {getAppsPath, getSharedPath} from "@cli/resolvers/path";

import {ReadonlyConfig} from "@typing/config";
import {EntrypointFile} from "@typing/entrypoint";

export default (config: ReadonlyConfig): EntrypointFile[] => {
    let files: EntrypointFile[] = [];

    const appBackgroundFiles = findBackgroundFiles(getAppsPath(config));

    if (appBackgroundFiles.length > 0) {
        files.push(...appBackgroundFiles);

        if (config.debug) {
            console.info('App background files added:', appBackgroundFiles);
        }
    }

    if (appBackgroundFiles.length > 0 && config.mergeBackground || appBackgroundFiles.length === 0) {
        const sharedBackgroundFiles = findBackgroundFiles(getSharedPath(config));

        if (sharedBackgroundFiles.length > 0) {
            files.push(...sharedBackgroundFiles);

            if (config.debug) {
                console.info('Shared background files added:', sharedBackgroundFiles);
            }
        }
    }

    return files;
}