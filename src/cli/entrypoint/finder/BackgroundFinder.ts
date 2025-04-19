import AbstractPluginFinder from "./AbstractPluginFinder";
import PluginFinder from "./PluginFinder";

import {BackgroundParser} from "../parser";

import {BackgroundEntrypointOptions} from "@typing/background";
import {EntrypointFinder, EntrypointParser, EntrypointType} from "@typing/entrypoint";
import {ReadonlyConfig} from "@typing/config";


export default class extends AbstractPluginFinder<BackgroundEntrypointOptions> {

    public constructor(config: ReadonlyConfig) {
        super(config);
    }

    public type(): EntrypointType {
        return EntrypointType.Background;
    }

    public canMerge(): boolean {
        return this.config.mergeBackground;
    }

    protected getParser(): EntrypointParser<BackgroundEntrypointOptions> {
        return new BackgroundParser();
    }

    protected getPlugin(): EntrypointFinder<BackgroundEntrypointOptions> {
        return new PluginFinder(this.config, 'background', this);
    }
}