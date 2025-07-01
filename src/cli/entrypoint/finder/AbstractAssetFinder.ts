import path from "path";
import fs from "fs";

import {getAppPath, getAppSourcePath, getRootPath, getSharedPath, getSourcePath} from "@cli/resolvers/path";

import AbstractFinder from "./AbstractFinder";

import {EntrypointFile} from "@typing/entrypoint";

export default abstract class extends AbstractFinder {
    public abstract getNames(): ReadonlySet<string>;

    public abstract isValidExtension(extension: string): boolean;

    public getDirectory(): string {
        return ".";
    }

    public isValidName(name: string): boolean {
        return name.length > 0 && this.getNames().has(name);
    }

    public canMerge(): boolean {
        return false;
    }

    public isValidFilename(filename: string): boolean {
        let {name, ext} = path.parse(filename);

        if (ext.startsWith(".")) {
            ext = ext.slice(1);
        }

        return this.isValidName(name) && this.isValidExtension(ext);
    }

    protected async getFiles(): Promise<Set<EntrypointFile>> {
        const files = new Set<EntrypointFile>();

        const parser = async (directory: string): Promise<void> => {
            if (files.size === 0 || this.canMerge()) {
                const localeFiles = await this.findFiles(getRootPath(directory));

                for (const file of localeFiles) {
                    files.add(file);
                }
            }
        };

        const dir = this.getDirectory();

        await parser(getAppSourcePath(this.config, dir));
        await parser(getAppPath(this.config, dir));
        await parser(getSharedPath(this.config, dir));
        await parser(getSourcePath(this.config, dir));

        return files;
    }

    protected async findFiles(directory: string): Promise<Set<EntrypointFile>> {
        const files = new Set<EntrypointFile>();

        try {
            const entries = fs.readdirSync(directory);

            for (const entry of entries) {
                const fullPath = path.join(directory, entry);
                const stats = fs.statSync(fullPath);

                if (stats.isFile() && this.isValidFilename(fullPath)) {
                    files.add(this.file(fullPath));
                }
            }
        } catch {}

        return files;
    }
}
