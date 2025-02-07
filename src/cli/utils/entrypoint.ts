import {Dirent, readdirSync, statSync} from 'fs';
import path from 'path';

const escapeRegExp = (text: string): string =>
    text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const findEntrypointFiles = (
    directory: string,
    entrypoint: string
): string[] => {
    const files: string[] = [];

    const regex = new RegExp(
        `^(?:.*\\.)?${escapeRegExp(entrypoint)}\\.(ts|tsx|js)$`
    );

    const finder = (dir: string): void => {
        let entries: Dirent[];

        try {
            entries = readdirSync(dir, {withFileTypes: true});
        } catch (e) {
            console.log('Error reading entrypoint directory:', dir);

            return;
        }

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                if (entry.name === entrypoint || entry.name.endsWith(`.${entrypoint}`)) {
                    const possibleIndexFiles = ['index.ts', 'index.tsx', 'index.js'];

                    for (const indexFile of possibleIndexFiles) {
                        const indexPath = path.join(fullPath, indexFile);

                        try {
                            const stat = statSync(indexPath);

                            if (stat.isFile()) {
                                files.push(indexPath);
                            }
                        } catch (e) {
                            //console.log('Error reading entrypoint index file:', indexPath);
                        }
                    }
                }

                finder(fullPath);
            } else if (entry.isFile()) {
                if (regex.test(entry.name)) {
                    files.push(fullPath);
                }
            }
        }
    };

    finder(directory);

    return files;
};

export const findBackgroundFiles = (directory: string): string[] => {
    return findEntrypointFiles(directory, 'background');
}

export const findContentFiles = (directory: string): string[] => {
    return findEntrypointFiles(directory, 'content');
}