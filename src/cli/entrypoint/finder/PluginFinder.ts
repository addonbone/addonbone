import _ from "lodash";

import AbstractOptionsFinder from "./AbstractOptionsFinder";

import {processPluginHandler} from "@cli/resolvers/plugin";

import {ReadonlyConfig} from "@typing/config";
import {PluginHandlerKeys} from "@typing/plugin";
import {EntrypointFile, EntrypointOptions, EntrypointParser, EntrypointType} from "@typing/entrypoint";

export default class<O extends EntrypointOptions> extends AbstractOptionsFinder<O> {
    constructor(
        config: ReadonlyConfig,
        protected readonly key: PluginHandlerKeys,
        protected readonly finder: AbstractOptionsFinder<O>
    ) {
        super(config);
    }

    public type(): EntrypointType {
        return this.finder.type();
    }

    protected getParser(): EntrypointParser<O> {
        return this.finder.parser();
    }

    protected async getFiles(): Promise<Set<EntrypointFile>> {
        const pluginResult = await Array.fromAsync(
            processPluginHandler(this.config.plugins, this.key, {
                config: this.config,
            })
        );

        const files = new Set<EntrypointFile>();

        for (const {name, result} of pluginResult) {
            let endpoints: Array<string | EntrypointFile> = [];

            if (_.isBoolean(result)) {
                endpoints = [this.key];
            } else if (_.isString(result) || _.isPlainObject(result)) {
                endpoints = [result as string | EntrypointFile];
            } else if (_.isArray(result)) {
                endpoints = result;
            } else if (_.isSet(result)) {
                endpoints = Array.from(result as Set<EntrypointFile>);
            }

            for (const endpoint of endpoints) {
                files.add(_.isString(endpoint) ? this.resolve(name, endpoint) : endpoint);
            }
        }

        return files;
    }
}
