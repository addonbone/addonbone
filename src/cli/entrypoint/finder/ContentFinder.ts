import AbstractPluginFinder from "./AbstractPluginFinder";
import PluginFinder from "./PluginFinder";

import {ContentParser} from "../parser";

import {ReadonlyConfig} from "@typing/config";
import {ContentScriptEntrypointOptions} from "@typing/content";
import {EntrypointOptionsFinder, EntrypointParser, EntrypointType} from "@typing/entrypoint";

export default class extends AbstractPluginFinder<ContentScriptEntrypointOptions> {
    public constructor(config: ReadonlyConfig) {
        super(config);
    }

    public type(): EntrypointType {
        return EntrypointType.ContentScript;
    }

    protected getPlugin(): EntrypointOptionsFinder<ContentScriptEntrypointOptions> {
        return new PluginFinder(this.config, "content", this);
    }

    protected getParser(): EntrypointParser<ContentScriptEntrypointOptions> {
        return new ContentParser(this.config);
    }

    public canMerge(): boolean {
        return this.config.mergeContentScripts;
    }
}
