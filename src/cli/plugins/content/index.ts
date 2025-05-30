import {Configuration as RspackConfig} from "@rspack/core";

import ContentManager from "./ContentManager";
import Content from "./Content";
import Relay from "./Relay";

import {definePlugin} from "@main/plugin";

import {EntrypointPlugin, isEntryModuleOrIssuer} from "@cli/bundler";

import {Command} from "@typing/app";


export default definePlugin(() => {
    let content: Content;
    let relay: Relay;
    let manager: ContentManager;

    return {
        name: 'adnbn:content',
        startup: async ({config}) => {
            content = new Content(config);
            relay = new Relay(config);

            manager = new ContentManager(config)
                .provider(content)
                .provider(relay);
        },
        content: () => content.files(),
        relay: () => relay.files(),
        bundler: async ({config}) => {

            if (await manager.empty()) {
                if (config.debug) {
                    console.warn('Content script or relay entries not found');
                }

                return {};
            }

            await relay.transport();


            const plugin = EntrypointPlugin.from(await manager.entries())
                .virtual(file => manager.virtual(file));

            if (config.command === Command.Watch) {
                plugin.watch(() => manager.clear().entries());
            }

            return {
                plugins: [plugin],
                optimization: {
                    splitChunks: {
                        cacheGroups: {
                            frameworkContent: {
                                minChunks: 2,
                                name: manager.chunkName(),
                                test: isEntryModuleOrIssuer(['content', 'relay']),
                                chunks: (chunk): boolean => {
                                    const {name} = chunk;

                                    if (!name) {
                                        return false;
                                    }

                                    return manager.likely(name);
                                },
                                enforce: false,
                                reuseExistingChunk: true,
                                priority: -10
                            }
                        }
                    }
                }
            } satisfies RspackConfig;
        },
        manifest: async ({manifest}) => {
            manifest.setContentScripts(await manager.manifest());
        }
    };
});