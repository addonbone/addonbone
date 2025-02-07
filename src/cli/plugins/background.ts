import path from "path";
import _ from "lodash";

import {getBackgroundOptions} from "../parsers/entrypoint";

import {getAppsPath, getSharedPath} from "../resolvers/path";

import {processPluginHandler} from "../utils/plugin";
import {isValidEntrypointOptions} from "../utils/option";
import {findBackgroundFiles} from "../utils/entrypoint";

import {Plugin} from "@typing/plugin";
import {BackgroundEntrypointMap} from "@typing/background";


const backgroundFilesToEntries = (files: string[]): BackgroundEntrypointMap => {
    const entries: BackgroundEntrypointMap = new Map;

    for (const file of files) {
        entries.set(file, getBackgroundOptions(file));
    }

    return entries;
}

const findBackgroundEntries = (dir: string): BackgroundEntrypointMap => {
    return backgroundFilesToEntries(findBackgroundFiles(dir));
}

export interface BackgroundOptions {
    name?: string;
}

export default (options?: BackgroundOptions): Plugin => {
    const {name = 'background'} = options || {};

    let hasBackground: boolean = false;

    return {
        webpack: async ({config, webpack}) => {
            let entries: BackgroundEntrypointMap = new Map;

            const appBackgroundEntries = findBackgroundEntries(getAppsPath(config));

            if (appBackgroundEntries.size > 0) {
                entries = new Map([...entries, ...appBackgroundEntries]);

                if (config.debug) {
                    console.info('App background added:', appBackgroundEntries);
                }
            }

            if (appBackgroundEntries.size > 0 && config.mergeBackground || appBackgroundEntries.size === 0) {
                const sharedBackgroundEntries = findBackgroundEntries(getSharedPath(config));

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

            console.log('pluginBackgroundFiles', pluginBackgroundFiles);

            if (pluginBackgroundFiles.length > 0) {
                const pluginBackgroundEntries = backgroundFilesToEntries(pluginBackgroundFiles);

                entries = new Map([...entries, ...pluginBackgroundEntries]);

                if (config.debug) {
                    console.info('Plugin background added:', pluginBackgroundEntries);
                }
            }

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
        manifest: ({manifest, config}) => {
            if (hasBackground) {
                manifest.resetBackground({
                    entry: name,
                    file: path.join(config.jsDir, name + '.js'),
                });
            }
        }
    };
};