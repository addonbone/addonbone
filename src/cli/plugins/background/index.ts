import {Configuration as WebpackConfig} from "webpack";
import _ from "lodash";

import {definePlugin} from "@core/define";

import WatchPlugin from "@cli/webpack/plugins/WatchPlugin";

import background from "./background";

import {Mode} from "@typing/config";

export interface BackgroundOptions {
    name?: string;
}

export default definePlugin<BackgroundOptions>(options => {
    const {name = 'background'} = options || {};

    let hasBackground: boolean = false;
    let persistent: boolean | undefined;

    return {
        webpack: async ({config, webpack}) => {
            const {files: backgroundFiles, persistent: backgroundPersistent} = await background(config);

            const files = backgroundFiles;

            if (files.length === 0) {
                if (config.debug) {
                    console.warn('Background entries not found');
                }

                return {};
            }

            hasBackground = true;
            persistent = backgroundPersistent;

            const entry = {[name]: files};

            let resolvedWebpack: WebpackConfig = {
                entry,
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

            if (config.mode === Mode.Development) {
                resolvedWebpack = {
                    ...resolvedWebpack,
                    plugins: [
                        new WatchPlugin({
                            key: name,
                            entry,
                            callback: async () => {
                                const {
                                    files: backgroundFiles,
                                    persistent: backgroundPersistent
                                } = await background(config);

                                persistent = backgroundPersistent;

                                return {[name]: backgroundFiles};
                            }
                        }),
                    ],
                };
            }

            return resolvedWebpack;
        },
        manifest: ({manifest}) => {
            if (hasBackground) {
                manifest.resetBackground({
                    entry: name,
                    persistent,
                });
            }
        }
    };
});