import stringify from "json-stringify-deterministic";

import {getContentScriptConfigFromOptions} from "./utils";
import {ContentNameGenerator} from "./types";

import {NameGenerator} from "@cli/entrypoint";

import {ReadonlyConfig} from "@typing/config";
import {EntrypointType} from "@typing/entrypoint";
import {ContentScriptEntrypointOptions} from "@typing/content";

export default class ContentName extends NameGenerator implements ContentNameGenerator<ContentScriptEntrypointOptions> {
    protected readonly _names = new Map<string, string>();

    constructor(protected readonly config: ReadonlyConfig) {
        super(EntrypointType.ContentScript);

        this.reserve(this.getChunkName());
    }

    public getChunkName(): string {
        return "common." + this.entrypoint;
    }

    public create(name: string, options: ContentScriptEntrypointOptions): string {
        const entry = this.name(name);

        if (!this.config.concatContentScripts) {
            return entry;
        }

        const key = stringify(getContentScriptConfigFromOptions(options));

        const existingEntry = this._names.get(key);

        if (existingEntry) {
            return existingEntry;
        }

        this._names.set(key, entry);

        return entry;
    }
}
