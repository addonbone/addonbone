import path from "path";
import fs from "fs";
import _isFunction from "lodash/isFunction";

import {getAppsPath, getSharedPath} from "../resolvers/path";

import {processPluginHandler} from "../utils/plugin";

import {Plugin} from "@typing/plugin";

const findBackgroundFile = (dir: string): string | undefined => {
    const candidates = [
        path.join(dir, 'background.ts'),
        path.join(dir, 'background', 'index.ts'),
    ];

    for (const file of candidates) {
        if (fs.existsSync(file)) {
            return file;
        }
    }
}

export interface BackgroundOptions {
    name?: string;
}

export default (options?: BackgroundOptions): Plugin => {
    const {name = 'background'} = options || {};

    let hasBackground: boolean = false;

    return {
        webpack: async ({config, webpack}) => {
            const files: string[] = [];

            const appBackgroundFile = findBackgroundFile(getAppsPath(config));

            if (appBackgroundFile) {
                files.push(appBackgroundFile);

                if (config.debug) {
                    console.info('App background file added:', appBackgroundFile);
                }
            }

            if (appBackgroundFile && config.mergeBackground || !appBackgroundFile) {
                const sharedBackgroundFile = findBackgroundFile(getSharedPath(config));

                if (sharedBackgroundFile) {
                    files.push(sharedBackgroundFile);

                    if (config.debug) {
                        console.info('Shared background file added:', sharedBackgroundFile);
                    }
                }
            }

            for await (const pluginBackgroundFile of processPluginHandler(config, 'background', {config, files})) {
                files.push(pluginBackgroundFile);

                if (config.debug) {
                    console.info('Plugin background file added:', pluginBackgroundFile);
                }
            }

            if (files.length === 0) {
                if (config.debug) {
                    console.warn('Background files not found');
                }

                return {};
            }

            hasBackground = true;

            if (config.debug) {
                console.info('Background files:', files);
            }

            return {
                entry: {
                    [name]: files,
                },
                optimization: {
                    splitChunks: {
                        chunks(chunk) {
                            const {chunks} = webpack.optimization?.splitChunks || {};

                            if (_isFunction(chunks) && !chunks(chunk)) {
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
                manifest.resetBackground(path.join(config.jsDir, name + '.js'));
            }
        }
    };
};