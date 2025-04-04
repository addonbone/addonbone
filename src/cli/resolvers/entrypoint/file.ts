import fs, {type Dirent} from 'fs';
import path from 'path';

import {getAppSourcePath, getSharedPath} from "../path";

import {isEntrypointFilename, isSupportedEntrypointExtension} from "@cli/utils/entrypoint";
import {toPosix} from "@cli/utils/path";

import {EntrypointFile, EntrypointFileExtensions, EntrypointType} from "@typing/entrypoint";
import {ReadonlyConfig} from "@typing/config";

const possibleIndexFiles = new Set([...EntrypointFileExtensions].map((ext) => `index.${ext}`));

const pathToImport = (filePath: string): string => {
    const {dir, name, ext} = path.parse(filePath);

    const result = name === 'index' && isSupportedEntrypointExtension(ext) ? dir : path.join(dir, name);

    return toPosix(result);
}

export const findEntrypointFiles = (
    directory: string,
    entrypoint: EntrypointType
): Set<EntrypointFile> => {
    const files: EntrypointFile[] = [];

    const finder = (dir: string): void => {
        let entries: Dirent[];

        try {
            entries = fs.readdirSync(dir, {withFileTypes: true});
        } catch (e) {
            console.log('Error reading entrypoint directory:', dir);

            return;
        }

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                if (entry.name === entrypoint || entry.name.endsWith(`.${entrypoint}`)) {
                    for (const indexFile of possibleIndexFiles) {
                        const indexPath = path.join(fullPath, indexFile);

                        try {
                            const stat = fs.statSync(indexPath);

                            if (stat.isFile()) {
                                files.push({file: indexPath, import: pathToImport(indexPath)});
                            }
                        } catch (e) {
                            //console.log('Error reading entrypoint index file:', indexPath);
                        }
                    }
                }

                finder(fullPath);
            } else if (entry.isFile()) {
                if (isEntrypointFilename(entry.name, entrypoint)) {
                    files.push({file: fullPath, import: pathToImport(fullPath)});
                }
            }
        }
    };

    finder(directory);

    if (files.length === 0) {
        try {
            directory = path.join(directory, entrypoint);

            const stat = fs.statSync(directory);

            if (stat.isDirectory()) {
                finder(directory);
            }
        } catch (e) {
            //console.log('Error reading entrypoint directory:', directory);
        }
    }

    return new Set(files);
};

export const getEntrypointFiles = (config: ReadonlyConfig, entrypoint: EntrypointType): Set<EntrypointFile> => {
    let files = new Set<EntrypointFile>();

    const appFiles = findEntrypointFiles(getAppSourcePath(config), entrypoint);

    if (appFiles.size > 0) {
        files = appFiles;

        if (config.debug) {
            console.info('App files added:', appFiles);
        }
    }

    const mergeShared: boolean = {
        [EntrypointType.Background]: config.mergeBackground,
        [EntrypointType.Command]: config.mergeCommands,
        [EntrypointType.ContentScript]: config.mergeContentScripts,
    }[entrypoint];

    if (appFiles.size > 0 && mergeShared || appFiles.size === 0) {
        const sharedFiles = findEntrypointFiles(getSharedPath(config), entrypoint);

        if (sharedFiles.size > 0) {
            files = new Set([...files, ...sharedFiles]);

            if (config.debug) {
                console.info('Shared files added:', sharedFiles);
            }
        }
    }

    return files;
}