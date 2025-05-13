import path from "path";

import AbstractFinder from "./AbstractFinder";

export default abstract class extends AbstractFinder {

    public abstract getNames(): ReadonlySet<string>;

    public abstract isValidExtension(extension: string): boolean;

    public getDirectory(): string {
        return '.'
    }

    public isValidName(name: string): boolean {
        return name.length > 0 && this.getNames().has(name);
    }

    public canMerge(): boolean {
        return false;
    }

    public isValidFilename(filename: string): boolean {
        let {name, ext} = path.parse(filename);

        if (ext.startsWith('.')) {
            ext = ext.slice(1);
        }

        if (name.includes('.')) {
            name = name.split('.').slice(0, -1).join('.');
        }

        return this.isValidName(name) && this.isValidExtension(ext);
    }
}