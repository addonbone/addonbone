import _isFunction from "lodash/isFunction";

import {PluginHandler, PluginHandlerKeys, PluginHandlerOptions, PluginHandlerResult} from "@typing/plugin";
import {ReadonlyConfig} from "@typing/config";

export const resolvePluginHandler = async <O extends object, T>(handler: PluginHandler<O, T> | undefined, options: O): Promise<T | undefined> => {
    if (_isFunction(handler)) {
        const result = handler(options);

        if (result instanceof Promise) {
            return await result;
        }

        return result;
    }

    return handler;
};


export const processPluginHandler = async function* <K extends PluginHandlerKeys>(config: ReadonlyConfig, key: K, options: PluginHandlerOptions<K>): AsyncGenerator<PluginHandlerResult<K>, void, void> {
    const {plugins = []} = config;

    for await (const plugin of plugins) {
        const handler = plugin[key] as PluginHandler<PluginHandlerOptions<K>> | undefined;

        const result = await resolvePluginHandler(handler, options);

        if (result !== undefined) {
            yield result;
        }
    }
}