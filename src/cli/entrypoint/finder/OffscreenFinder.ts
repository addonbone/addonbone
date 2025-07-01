import AbstractTransportFinder from "./AbstractTransportFinder";
import PluginFinder from "./PluginFinder";

import {OffscreenParser} from "../parser";

import {ReadonlyConfig} from "@typing/config";
import {OffscreenEntrypointOptions, OffscreenOptions} from "@typing/offscreen";
import {EntrypointOptionsFinder, EntrypointParser, EntrypointType} from "@typing/entrypoint";

export default class extends AbstractTransportFinder<OffscreenEntrypointOptions, OffscreenOptions> {
    constructor(config: ReadonlyConfig) {
        super(config);
    }

    public type(): EntrypointType {
        return EntrypointType.Offscreen;
    }

    protected getParser(): EntrypointParser<OffscreenEntrypointOptions> {
        return new OffscreenParser(this.config);
    }

    protected getPlugin(): EntrypointOptionsFinder<OffscreenEntrypointOptions> {
        return new PluginFinder(this.config, "offscreen", this);
    }

    public canMerge(): boolean {
        return this.config.mergeOffscreen;
    }
}
