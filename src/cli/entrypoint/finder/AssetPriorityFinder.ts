import _ from "lodash";

import {getAppPath, getAppSourcePath, getRootPath, getSharedPath, getSourcePath} from "@cli/resolvers/path";
import fs from "fs";
import path from "path";

import AbstractFinder from "./AbstractFinder";
import AbstractAssetFinder from "./AbstractAssetFinder";

import {EntrypointFile} from "@typing/entrypoint";
import {ReadonlyConfig} from "@typing/config";

export default class extends AbstractFinder {

    protected readonly priorityDirectories: string[];

    constructor(config: ReadonlyConfig, protected readonly finder: AbstractAssetFinder) {
        super(config);

        this.priorityDirectories = [
            'node_modules',
            getSourcePath(config),
            getSharedPath(config),
            getAppPath(config),
            getAppSourcePath(config),
        ];
    }

    protected async getFiles(): Promise<Set<EntrypointFile>> {
        const files = new Set<EntrypointFile>;

        const parser = async (directory: string): Promise<void> => {
            if (files.size === 0 || this.finder.canMerge()) {
                const localeFiles = await this.findFiles(getRootPath(directory));

                for (const file of localeFiles) {
                    files.add(file);
                }
            }
        };

        const dir = this.finder.getDirectory();

        await parser(getAppSourcePath(this.config, dir));
        await parser(getAppPath(this.config, dir));
        await parser(getSharedPath(this.config, dir));
        await parser(getSourcePath(this.config, dir));

        return files;
    }

    protected async findFiles(directory: string): Promise<Set<EntrypointFile>> {
        const files = new Set<EntrypointFile>;

        try {
            const entries = fs.readdirSync(directory);

            for (const entry of entries) {
                const fullPath = path.join(directory, entry);
                const stats = fs.statSync(fullPath);

                if (stats.isFile() && this.finder.isValidFilename(fullPath)) {
                    files.add(this.file(fullPath));
                }
            }
        } catch {
        }

        return files;
    }

    public priority(file: EntrypointFile): number {
        return _.findIndex(this.priorityDirectories, dir => file.file.includes(dir));
    }

}