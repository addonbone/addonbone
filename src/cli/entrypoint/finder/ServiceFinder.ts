import AbstractPluginFinder from "./AbstractPluginFinder";
import PluginFinder from "./PluginFinder";

import {ServiceParser} from "../parser";
import {InlineNameGenerator} from "../name";

import {ReadonlyConfig} from "@typing/config";
import {ServiceEntrypointOptions, ServiceOptions} from "@typing/service";
import {EntrypointFile, EntrypointOptionsFinder, EntrypointParser, EntrypointType} from "@typing/entrypoint";


export default class extends AbstractPluginFinder<ServiceEntrypointOptions> {
    protected _services?: Map<EntrypointFile, ServiceOptions>;

    protected readonly names: InlineNameGenerator;

    public constructor(config: ReadonlyConfig) {
        super(config);

        this.names = new InlineNameGenerator(this.type());
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

    protected async getServices(): Promise<Map<EntrypointFile, ServiceOptions>> {
        const services = new Map<EntrypointFile, ServiceOptions>();

        for (const [file, option] of await this.plugin().options()) {
            const {name, ...definition} = option;

            services.set(file, {
                name: name ? this.names.name(name) : this.names.file(file),
                ...definition,
            });
        }

        return services;
    }

    public async services(): Promise<Map<EntrypointFile, ServiceOptions>> {
        return this._services ??= await this.getServices();
    }

    public canMerge(): boolean {
        return this.config.mergeServices;
    }

    public clear(): this {
        this.names.reset();

        this._services = undefined;

        return super.clear();
    }
}