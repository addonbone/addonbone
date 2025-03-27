import _ from "lodash";
import path from "path";

import {
    PluginEntrypointKeys,
    PluginHandler,
    PluginHandlerKeys,
    PluginHandlerOptions,
    PluginNameHandlerResult
} from "@typing/plugin";
import {ReadonlyConfig} from "@typing/config";
import {EntrypointFile} from "@typing/entrypoint";

export const resolvePluginHandler = async <O extends object, T>(handler: PluginHandler<O, T> | undefined, options: O): Promise<T | undefined> => {
    if (_.isFunction(handler)) {
        const result = handler(options);

        if (result instanceof Promise) {
            return await result;
        }

        return result;
    }

    return handler;
};


export const processPluginHandler = async function* <K extends PluginHandlerKeys>(config: ReadonlyConfig, key: K, options: PluginHandlerOptions<K>): AsyncGenerator<PluginNameHandlerResult<K>, void, void> {
    const {plugins = []} = config;

    for await (const plugin of plugins) {
        const handler = plugin[key] as PluginHandler<PluginHandlerOptions<K>> | undefined;

        const result = await resolvePluginHandler(handler, options);

        if (result !== undefined) {
            yield {name: plugin.name, result};
        }
    }
}

export const getPluginEntrypointFiles = async <K extends PluginEntrypointKeys>(config: ReadonlyConfig, key: K): Promise<Set<EntrypointFile>> => {
    const pluginResult = await Array.fromAsync(processPluginHandler(config, key, {
        config,
    }));

    if (pluginResult.length > 0) {
        const pluginFiles = pluginResult.reduce((files, {name, result}) => {
            let endpoints: Array<string | EntrypointFile> = [];

            if (_.isBoolean(result)) {
                endpoints = [key];
            } else if (_.isString(result) || _.isPlainObject(result)) {
                endpoints = [result as string | EntrypointFile];
            } else if (_.isArray(result)) {
                endpoints = result;
            } else if (result instanceof Set) {
                endpoints = Array.from(result as Set<EntrypointFile>);
            }

            const endpointFiles: EntrypointFile[] = [];

            for (const endpoint of endpoints) {
                if (_.isString(endpoint)) {
                    const resolved = path.join(name, endpoint);

                    endpointFiles.push({
                        file: require.resolve(resolved, {paths: [process.cwd()]}),
                        import: resolved,
                        external: true
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