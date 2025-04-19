import _ from "lodash";

import stringify from "json-stringify-deterministic";

import AbstractPluginFinder from "./AbstractPluginFinder";
import PluginFinder from "./PluginFinder";

import {NameGenerator} from "../name";
import {ContentParser} from "../parser";

import {ContentScriptEntrypointOptions} from "@typing/content";
import {EntrypointFile, EntrypointFinder, EntrypointParser, EntrypointType} from "@typing/entrypoint";
import {ReadonlyConfig} from "@typing/config";

export interface ContentItem {
    file: EntrypointFile;
    options: ContentScriptEntrypointOptions;
}

export type ContentItems = Map<string, Set<ContentItem>>;

export default class extends AbstractPluginFinder<ContentScriptEntrypointOptions> {
    protected _content?: ContentItems;

    protected readonly _names = new Map<string, string>();

    protected readonly names: NameGenerator;

    public constructor(config: ReadonlyConfig) {
        super(config);

        this.names = new NameGenerator(this.type());
    }

    public type(): EntrypointType {
        return EntrypointType.ContentScript;
    }

    protected getPlugin(): EntrypointFinder<ContentScriptEntrypointOptions> {
        return new PluginFinder(this.config, 'content', this);
    }

    protected getParser(): EntrypointParser<ContentScriptEntrypointOptions> {
        return new ContentParser();
    }

    protected async getContent(): Promise<ContentItems> {
        const options = await this.plugin().options();

        return _.chain(Array.from(options.entries()))
            .groupBy(([file, options]) => {
                return this.createName(file, options);
            })
            .reduce((content, items, name) => {
                const value = new Set<ContentItem>();

                for (const [file, options] of items) {
                    value.add({file, options});
                }

                content.set(name, value);

                return content;
            }, new Map as ContentItems)
            .value();
    }

    public async content(): Promise<ContentItems> {
        if (this._content) {
            return this._content;
        }

        return this._content = await this.getContent();
    }

    public likely(name: string): boolean {
        return this.names.likely(name);
    }

    public clear(): this {
        this.names.reset();

        this._names.clear();
        this._content = undefined;

        return super.clear();
    }

    protected createName(file: EntrypointFile, options: ContentScriptEntrypointOptions): string {
        const entry = this.names.file(file);

        if (!this.config.concatContentScripts) {
            return entry;
        }

        const key = stringify(options);

        const existingEntry = this._names.get(key);

        if (existingEntry) {
            return existingEntry;
        }

        this._names.set(key, entry);

        return entry;
    }
}