import AbstractAssetFinder from "./AbstractAssetFinder";

import {LanguageCodes, LocaleDirectoryName, LocaleFileExtensions} from "@typing/locale";

export default abstract class extends AbstractAssetFinder {

    public isValidExtension(extension: string): boolean {
        return LocaleFileExtensions.has(extension);
    }

    public getDirectory(): string {
        return LocaleDirectoryName;
    }

    public getNames(): ReadonlySet<string> {
        return LanguageCodes;
    }

    public canMerge(): boolean {
        return this.config.mergeLocales;
    }
}