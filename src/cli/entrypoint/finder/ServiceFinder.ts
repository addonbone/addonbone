import AbstractTransportPlugin from "./AbstractTransportPlugin";
import PluginFinder from "./PluginFinder";

import {ServiceParser} from "../parser";

import {ReadonlyConfig} from "@typing/config";
import {ServiceEntrypointOptions} from "@typing/service";
import {EntrypointOptionsFinder, EntrypointParser, EntrypointType} from "@typing/entrypoint";

export default class extends AbstractTransportPlugin<ServiceEntrypointOptions> {
    public constructor(config: ReadonlyConfig) {
        super(config);
    }

    public type(): EntrypointType {
        return EntrypointType.Service;
    }

    protected getParser(): EntrypointParser<ServiceEntrypointOptions> {
        return new ServiceParser(this.config);
    }

    protected getPlugin(): EntrypointOptionsFinder<ServiceEntrypointOptions> {
        return new PluginFinder(this.config, 'service', this);
    }

    public canMerge(): boolean {
        return this.config.mergeServices;
    }
}