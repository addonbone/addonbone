import fs, {type Dirent} from 'fs';
import path from 'path';

import {EntrypointFile} from "@typing/entrypoint";

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
    entrypoint: string
): EntrypointFile[] => {
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

    return files;
};

export const findBackgroundFiles = (directory: string): EntrypointFile[] => {
    return findEntrypointFiles(directory, 'background');
}

export const findContentFiles = (directory: string): EntrypointFile[] => {
    return findEntrypointFiles(directory, 'content');
}