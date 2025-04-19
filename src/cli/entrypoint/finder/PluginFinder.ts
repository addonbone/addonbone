import path from "path";
import _ from "lodash";

import OptionsFinder from "./OptionsFinder";

import {processPluginHandler} from "@cli/resolvers/plugin";

import {ReadonlyConfig} from "@typing/config";
import {PluginHandlerKeys} from "@typing/plugin";
import {EntrypointFile, EntrypointOptions, EntrypointParser, EntrypointType} from "@typing/entrypoint";

export default class<O extends EntrypointOptions> extends OptionsFinder<O> {
    constructor(
        config: ReadonlyConfig,
        protected readonly key: PluginHandlerKeys,
        protected readonly finder: OptionsFinder<O>
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
        const pluginResult = await Array.fromAsync(processPluginHandler(this.config.plugins, this.key, {
            config: this.config,
        }));

        if (pluginResult.length > 0) {
            const pluginFiles = pluginResult.reduce((files, {name, result}) => {
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

                const endpointFiles: EntrypointFile[] = [];

                for (const endpoint of endpoints) {
                    if (_.isString(endpoint)) {
                        const resolved = path.join(name, endpoint);

                        endpointFiles.push({
                            file: require.resolve(resolved, {paths: [process.cwd()]}),
                            import: resolved,
                            external: name,
                        });
                    } else {
                        endpointFiles.push(endpoint);
                    }
                }

                return [...files, ...endpointFiles];
            }, [] as EntrypointFile[]);

            return new Set(pluginFiles);
        }

        return new Set();
    }
}