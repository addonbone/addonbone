import path from "path";

import AbstractPluginFinder from "./AbstractPluginFinder";
import PluginFinder from "./PluginFinder";

import {PageParser} from "../parser";
import {InlineNameGenerator, NameGenerator} from "../name";

import {ReadonlyConfig} from "@typing/config";
import {PageEntrypointOptions} from "@typing/page";
import {EntrypointFile, EntrypointFinder, EntrypointParser, EntrypointType} from "@typing/entrypoint";

export interface PageItem {
    filename: string;
    alias: string;
    file: EntrypointFile;
    options: PageEntrypointOptions;
}

export type PageItems = Map<string, PageItem>;

export default class extends AbstractPluginFinder<PageEntrypointOptions> {
    protected _pages?: PageItems;

    protected readonly names: NameGenerator;
    protected readonly aliases: InlineNameGenerator;

    public constructor(config: ReadonlyConfig) {
        super(config);

        this.names = new NameGenerator(this.type());
        this.aliases = new InlineNameGenerator(this.type());

        this.aliases
            .reserve(EntrypointType.Background)
            .reserve(EntrypointType.Command)
            .reserve(EntrypointType.ContentScript)
            .reserve(EntrypointType.Sidebar)
            .reserve(EntrypointType.Popup)
            .reserve(EntrypointType.Offscreen)
            .reserve(EntrypointType.Options);
    }

    public type(): EntrypointType {
        return EntrypointType.Page;
    }

    protected getParser(): EntrypointParser<PageEntrypointOptions> {
        return new PageParser();
    }

    protected getPlugin(): EntrypointFinder<PageEntrypointOptions> {
        return new PluginFinder(this.config, 'page', this);
    }

    protected async getPages(): Promise<PageItems> {
        const pages: PageItems = new Map;

        for (const [file, options] of await this.plugin().options()) {
            let {name} = options;

            let alias = name ? this.aliases.name(name) : this.aliases.file(file);

            const filename = path.join(this.config.htmlDir, alias + '.html');

            name = name ? this.names.name(name) : this.names.file(file);

            if (file.external) {
                alias = file.import;
            }

            pages.set(name, {alias, filename, file, options});
        }

        return pages;
    }

    public async pages(): Promise<PageItems> {
        if (this._pages) {
            return this._pages;
        }

        return this._pages = await this.getPages();
    }

    public async alias(): Promise<Map<string, string>> {
        return Array.from(await this.pages()).reduce((aliases, [_, item]) => {
            return {
                ...aliases,
                [item.alias]: item.filename,
            };
        }, {} as Map<string, string>);
    }

    public canMerge(): boolean {
        return this.config.mergePages;
    }

    public clear(): this {
        this._pages = undefined;

        this.names.reset();
        this.aliases.reset();

        return super.clear();
    }
}