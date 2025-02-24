import fs, {type Dirent} from 'fs';
import path from 'path';

import {getAppsPath, getSharedPath} from "./path";

import {EntrypointFile, EntrypointType} from "@typing/entrypoint";
import {ReadonlyConfig} from "@typing/config";

const escapeRegExp = (text: string): string =>
    text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const pathToImport = (filePath: string): string => {
    const {dir, name, ext} = path.parse(filePath);

    if (name === 'index' && (ext === '.ts' || ext === '.tsx')) {
        return dir;
    }

    return path.join(dir, name);
}

export const findEntrypointFiles = (
    directory: string,
    entrypoint: EntrypointType
): Set<EntrypointFile> => {
    const files: EntrypointFile[] = [];

    const regex = new RegExp(
        `^(?:.*\\.)?${escapeRegExp(entrypoint)}\\.(ts|tsx)$`
    );

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
                    const possibleIndexFiles = ['index.ts', 'index.tsx'];

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
                if (regex.test(entry.name)) {
                    files.push({file: fullPath, import: pathToImport(fullPath)});
                }
            }
        }
    };

    finder(directory);

    return new Set(files);
};

export const getEntrypointFiles = (config: ReadonlyConfig, entrypoint: EntrypointType): Set<EntrypointFile> => {
    let files = new Set<EntrypointFile>();

    const appFiles = findEntrypointFiles(getAppsPath(config), entrypoint);

    if (appFiles.size > 0) {
        files = appFiles;

        if (config.debug) {
            console.info('App files added:', appFiles);
        }
    }

    const mergeShared: boolean = {
        [EntrypointType.Background]: config.mergeBackground,
        [EntrypointType.Command]: config.mergeCommands,
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