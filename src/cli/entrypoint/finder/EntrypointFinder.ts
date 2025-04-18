import fs, {Dirent} from "fs";
import path from "path";

import OptionsFinder from "./OptionsFinder";

import {getAppSourcePath, getSharedPath} from "@cli/resolvers/path";

import {toPosix} from "@cli/utils/path";

import {EntrypointFile, EntrypointFileExtensions, EntrypointOptions} from "@typing/entrypoint";

const fileExtensions = [...EntrypointFileExtensions]
    .map(ext => ext.replace('.', '\\.'))
    .join('|');

const possibleIndexFiles = new Set([...EntrypointFileExtensions].map((ext) => `index.${ext}`));

export default abstract class<O extends EntrypointOptions> extends OptionsFinder<O> {
    public canMerge(): boolean {
        return false;
    }

    public async getFiles(): Promise<Set<EntrypointFile>> {
        const entrypoint = this.type();

        let files = new Set<EntrypointFile>();

        const appFiles = this.findFiles(getAppSourcePath(this.config));

        if (appFiles.size > 0) {
            files = appFiles;

            if (this.config.debug) {
                console.info(`App "${entrypoint}" files added:`, appFiles);
            }
        }

        if (appFiles.size > 0 && this.canMerge() || appFiles.size === 0) {
            const sharedFiles = this.findFiles(getSharedPath(this.config));

            if (sharedFiles.size > 0) {
                files = new Set([...files, ...sharedFiles]);

                if (this.config.debug) {
                    console.info(`Shared ${entrypoint}" files added:`, sharedFiles);
                }
            }
        }

        return files;
    }

    protected findFiles(directory: string): Set<EntrypointFile> {
        const entrypoint = this.type();

        const files: EntrypointFile[] = [];

        const finder = (dir: string): void => {
            let entries: Dirent[];

            try {
                entries = fs.readdirSync(dir, {withFileTypes: true});
            } catch (e) {
                if (this.config.debug) {
                    console.warn(`Error reading ${entrypoint} entrypoint directory: ${dir}`);
                }

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
                                    files.push({file: indexPath, import: this.getPathToImport(indexPath)});
                                }
                            } catch (e) {
                                if (this.config.debug) {
                                    console.log(`Error reading ${entrypoint} entrypoint index file: ${indexPath}`);
                                }

                            }
                        }
                    }

                    finder(fullPath);
                } else if (entry.isFile()) {
                    if (this.isValidFilename(entry.name)) {
                        files.push({file: fullPath, import: this.getPathToImport(fullPath)});
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
                if (this.config.debug) {
                    console.log('Error reading entrypoint directory:', directory);
                }

            }
        }

        return new Set(files);
    }

    protected getPathToImport(filename: string): string {
        let {dir, name, ext} = path.parse(filename);

        if (ext.startsWith('.')) {
            ext = ext.slice(1);
        }

        const result = name === 'index' && EntrypointFileExtensions.has(ext) ? dir : path.join(dir, name);

        return toPosix(result);
    }

    protected isValidFilename(filename: string): boolean {
        const name = this.type().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const pattern = new RegExp(`^(?:.*\\.)?${name}\\.(${fileExtensions})$`);

        return pattern.test(filename);
    }

}