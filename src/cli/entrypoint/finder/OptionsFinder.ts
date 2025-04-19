import AbstractFinder from "./AbstractFinder";

import {EntrypointFile, EntrypointOptions, EntrypointParser} from "@typing/entrypoint";
import {ReadonlyConfig} from "@typing/config";

export default abstract class<O extends EntrypointOptions> extends AbstractFinder<O> {
    protected _parser?: EntrypointParser<O>;

    protected abstract getParser(): EntrypointParser<O>;

    protected constructor(protected readonly config: ReadonlyConfig) {
        super();
    }

    public parser(): EntrypointParser<O> {
        if (this._parser) {
            return this._parser;
        }

        return this._parser = this.getParser();
    }

    protected async getOptions(): Promise<Map<EntrypointFile, O>> {
        const collect = new Map<EntrypointFile, O>();

        for (const file of await this.files()) {
            const options = this.parser().options(file);

            if (!this.isValidOptions(options)) {
                continue;
            }

            collect.set(file, options);
        }

        return collect;
    }

    protected isValidOptions(options: O): boolean {
        const {browser, app} = this.config;

        const {includeBrowser = [], includeApp = [], excludeBrowser = [], excludeApp = []} = options;

        if (includeBrowser.length > 0 && !includeBrowser.includes(browser)) {
            return false;
        }

        if (includeApp.length > 0 && !includeApp.includes(app)) {
            return false;
        }

        if (excludeBrowser.length > 0 && excludeBrowser.includes(browser)) {
            return false;
        }

        return !(excludeApp.length > 0 && excludeApp.includes(app));
    }
}