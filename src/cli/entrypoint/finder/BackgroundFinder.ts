import AbstractPluginFinder from "./AbstractPluginFinder";
import PluginFinder from "./PluginFinder";

import {BackgroundParser} from "../parser";

import {ReadonlyConfig} from "@typing/config";
import {BackgroundEntrypointOptions} from "@typing/background";
import {EntrypointOptionsFinder, EntrypointParser, EntrypointType} from "@typing/entrypoint";

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
        return new BackgroundParser(this.config);
    }

    protected getPlugin(): EntrypointOptionsFinder<BackgroundEntrypointOptions> {
        return new PluginFinder(this.config, "background", this);
    }
}
