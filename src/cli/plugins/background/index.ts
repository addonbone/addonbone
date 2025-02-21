import _ from "lodash";

import {Configuration as WebpackConfig} from "webpack";

import getBackgroundFiles from "./background";
import getBackgroundEntrypoint from "./entrypoint/background";

import {definePlugin} from "@core/define";
import {virtualBackgroundModule} from "@cli/virtual";

import EntrypointPlugin, {EntrypointPluginEntries} from "@cli/webpack/plugins/EntrypointPlugin";

import {BackgroundEntrypointMap} from "@typing/background";
import {Command} from "@typing/config";

const name = 'background';

const isPersistent = (background: BackgroundEntrypointMap): boolean => {
    return Array.from(background.values()).some(({persistent}) => persistent);
}

const getEntry = (background: BackgroundEntrypointMap): EntrypointPluginEntries => {
    return {[name]: Array.from(background.keys())};
}

export default definePlugin(() => {
    let hasBackground: boolean = false;
    let persistent: boolean | undefined;

    return {
        name: import.meta.dirname,
        background: ({config}) => getBackgroundFiles(config),
        webpack: async ({config, webpack}) => {
            const backgroundEntrypoint = await getBackgroundEntrypoint(config);

            if (backgroundEntrypoint.size === 0) {
                if (config.debug) {
                    console.warn('Background entries not found');
                }

                return {};
            }

            hasBackground = true;
            persistent = isPersistent(backgroundEntrypoint);

            const backgroundEntrypointPlugin = (new EntrypointPlugin(getEntry(backgroundEntrypoint), 'background-entrypoint'))
                .virtual(file => virtualBackgroundModule(file.import));

            if (config.command === Command.Watch) {
                backgroundEntrypointPlugin.watch(async () => {
                    const backgroundEntrypoint = await getBackgroundEntrypoint(config);

                    persistent = isPersistent(backgroundEntrypoint);

                    console.warn('Updating background entrypoint', persistent);

                    return getEntry(backgroundEntrypoint);
                });
            }

            let resolvedWebpack: WebpackConfig = {
                plugins: [backgroundEntrypointPlugin],
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