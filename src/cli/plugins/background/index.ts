import _ from "lodash";

import {definePlugin} from "@core/define";
import {isValidEntrypointOptions} from "@cli/utils/option";

import {getBackgroundEntries} from "./background";

export interface BackgroundOptions {
    name?: string;
}

export default definePlugin<BackgroundOptions>(options => {
    const {name = 'background'} = options || {};

    let hasBackground: boolean = false;
    let persistent: boolean | undefined;

    return {
        webpack: async ({config, webpack}) => {
            const backgroundEntries = Array.from(await getBackgroundEntries(config))
                .filter(([_, options]) => isValidEntrypointOptions(options, config))

            const files = backgroundEntries.map(([file]) => file);

            if (files.length === 0) {
                if (config.debug) {
                    console.warn('Background entries not found');
                }

                return {};
            }

            hasBackground = true;

            if (backgroundEntries.some(([_, {persistent: isPersistent}]) => isPersistent)) {
                persistent = true;
            }

            if (config.debug) {
                console.info('Background entries:', new Map(backgroundEntries));
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
                    persistent
                });
            }
        }
    };
});