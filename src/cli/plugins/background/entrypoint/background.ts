import _ from "lodash";
import path from "path";

import {getBackgroundOptions} from "@cli/parsers/entrypoint";

import {processPluginHandler} from "@cli/utils/plugin";
import {isValidEntrypointOptions} from "@cli/utils/option";

import {EntrypointFile} from "@typing/entrypoint";
import {ReadonlyConfig} from "@typing/config";
import {BackgroundEntrypointMap} from "@typing/background";

const backgroundFilesToEntries = (files: EntrypointFile[]): BackgroundEntrypointMap => {
    const entries: BackgroundEntrypointMap = new Map;

    for (const file of files) {
        entries.set(file, getBackgroundOptions(file.file));
    }

    return entries;
}

export default async (config: ReadonlyConfig): Promise<BackgroundEntrypointMap> => {
    let entries: BackgroundEntrypointMap = new Map;

    const pluginBackgroundResult = await Array.fromAsync(processPluginHandler(config, 'background', {
        config,
    }));

    if (pluginBackgroundResult.length > 0) {
        const pluginBackgroundFiles = pluginBackgroundResult.reduce((files, {name, result}) => {
            let endpoints: Array<string | EntrypointFile> = [];

            if (_.isBoolean(result)) {
                endpoints = ['background'];
            } else if (_.isString(result) || _.isPlainObject(result)) {
                endpoints = [result as string | EntrypointFile];
            } else if (_.isArray(result)) {
                endpoints = result;
            }

            let next: EntrypointFile[] = [];

            for (const endpoint of endpoints) {
                if (_.isString(endpoint)) {
                    const resolved = path.join(name, endpoint);

                    next.push({
                        file: require.resolve(resolved, {paths: [process.cwd()]}),
                        import: resolved,
                        external: true
                    });
                } else {
                    next.push(endpoint);
                }
            }

            return [...files, ...next];
        }, [] as EntrypointFile[]);

        const pluginBackgroundEntries = backgroundFilesToEntries(pluginBackgroundFiles);

        entries = new Map(
            [...pluginBackgroundEntries]
                .filter(([_, options]) => isValidEntrypointOptions(options, config))
        );

        if (config.debug) {
            console.info('Plugin background entries:', pluginBackgroundEntries);
        }
    }

    return entries;
}