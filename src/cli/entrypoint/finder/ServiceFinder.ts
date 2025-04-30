import AbstractPluginFinder from "./AbstractPluginFinder";
import PluginFinder from "./PluginFinder";

import {ServiceParser} from "../parser";
import {InlineNameGenerator} from "../name";

import {ReadonlyConfig} from "@typing/config";
import {ServiceEntrypointOptions, ServiceOptions} from "@typing/service";
import {EntrypointFile, EntrypointOptionsFinder, EntrypointParser, EntrypointType} from "@typing/entrypoint";

export interface ServiceItem {
    options: ServiceOptions;
    contract: string;
}

export type ServiceItems = Map<EntrypointFile, ServiceItem>;

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
            const {name: service, ...definition} = option;

            let name: string;

            if (file.external) {
                name = file.import;

                if (this.names.has(name)) {
                    throw new Error(`Service name "${name}" is already in use.`);
                }

                name = this.names.name(name);
            } else if (service) {
                name = this.names.name(service);
            } else {
                name = this.names.file(file);
            }

            services.set(file, {
                name,
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