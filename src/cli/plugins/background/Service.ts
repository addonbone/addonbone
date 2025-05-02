import BackgroundEntry from "./BackgroundEntry";

import {ServiceFinder} from "@cli/entrypoint";

import {BackgroundEntrypointOptions} from "@typing/background";
import {EntrypointFile} from "@typing/entrypoint";
import {ServiceConfig} from "@typing/service";

export default class extends ServiceFinder {
    public entry(): BackgroundEntry<BackgroundEntrypointOptions> {
        return new BackgroundEntry(this);
    }

    public get(file: EntrypointFile): ServiceConfig | undefined {
        return this._services?.get(file)?.options;
    }

    public async dictionary(): Promise<Record<string, string>> {
        const services = await this.services();

        return services.values().reduce((dictionary, service) => {
            return {...dictionary, [service.options.name]: service.contract || 'any'};
        }, {} as Record<string, string>);
    }
}