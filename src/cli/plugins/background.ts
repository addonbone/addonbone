import _ from "lodash";

import {definePlugin} from "@core/define";

import {getBackgroundOptions} from "../parsers/entrypoint";

import {getAppsPath, getSharedPath} from "../resolvers/path";

import {processPluginHandler} from "../utils/plugin";
import {isValidEntrypointOptions} from "../utils/option";
import {findBackgroundFiles} from "../utils/entrypoint";

import {BackgroundEntrypointMap} from "@typing/background";
import {ReadonlyConfig} from "@typing/config";


const backgroundFilesToEntries = (files: string[]): BackgroundEntrypointMap => {
    const entries: BackgroundEntrypointMap = new Map;

    for (const file of files) {
        entries.set(file, getBackgroundOptions(file));
    }

    return entries;
}

const findBackgroundEntriesByDir = (dir: string): BackgroundEntrypointMap => {
    return backgroundFilesToEntries(findBackgroundFiles(dir));
}

const getBackgroundEntries = async (config: ReadonlyConfig): Promise<BackgroundEntrypointMap> => {
    let entries: BackgroundEntrypointMap = new Map;

    const appBackgroundEntries = findBackgroundEntriesByDir(getAppsPath(config));

    if (appBackgroundEntries.size > 0) {
        entries = new Map([...entries, ...appBackgroundEntries]);

        if (config.debug) {
            console.info('App background added:', appBackgroundEntries);
        }
    }

    if (appBackgroundEntries.size > 0 && config.mergeBackground || appBackgroundEntries.size === 0) {
        const sharedBackgroundEntries = findBackgroundEntriesByDir(getSharedPath(config));

        if (sharedBackgroundEntries.size > 0) {
            entries = new Map([...entries, ...sharedBackgroundEntries]);

            if (config.debug) {
                console.info('Shared background added:', sharedBackgroundEntries);
            }
        }
    }

    const pluginBackgroundFiles = await Array.fromAsync(processPluginHandler(config, 'background', {
        config,
        entries
    }));

    if (pluginBackgroundFiles.length > 0) {
        const pluginBackgroundEntries = backgroundFilesToEntries(pluginBackgroundFiles);

        entries = new Map([...entries, ...pluginBackgroundEntries]);

        if (config.debug) {
            console.info('Plugin background added:', pluginBackgroundEntries);
        }
    }

    return entries;
}

export interface BackgroundOptions {
    name?: string;
}

export default definePlugin<BackgroundOptions>(options => {
    const {name = 'background'} = options || {};

    let hasBackground: boolean = false;

    return {
        webpack: async ({config, webpack}) => {
            const entries = await getBackgroundEntries(config);

            const files = Array.from(entries)
                .filter(([_, options]) => isValidEntrypointOptions(options, config))
                .map(([file]) => file);

            if (files.length === 0) {
                if (config.debug) {
                    console.warn('Background entries not found');
                }

                return {};
            }

            hasBackground = true;

            if (config.debug) {
                console.info('Background entries:', entries);
            }

            return {
                entry: {
                    [name]: files,
                },
                optimization: {
                    splitChunks: {
                        chunks(chunk) {
                            const {chunks} = webpack.optimization?.splitChunks || {};

                            if (_.isFunction(chunks) && !chunks(chunk)) {
                                return false;
                            }

                            return chunk.name !== name;
                        },
                    }
                }
            };
        },
        manifest: ({manifest}) => {
            if (hasBackground) {
                manifest.resetBackground({
                    entry: name,
                });
            }
        }
    };
});