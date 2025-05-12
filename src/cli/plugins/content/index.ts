import {Configuration as RspackConfig} from "@rspack/core";

import Content from "./Content";

import {definePlugin} from "@main/plugin";
import {virtualContentScriptModule} from "@cli/virtual";

import {EntrypointPlugin, isEntryModuleOrIssuer} from "@cli/bundler";

import {Command} from "@typing/app";

export {Content};

export default definePlugin(() => {
    let content: Content;

    return {
        name: 'adnbn:content',
        startup: ({config}) => {
            content = new Content(config);
        },
        content: () => content.files(),
        bundler: async ({config}) => {
            if (await content.empty()) {
                if (config.debug) {
                    console.warn('Content script entries not found');
                }

                return {};
            }

            const plugin = EntrypointPlugin.from(await content.entries())
                .virtual(file => virtualContentScriptModule(file));

            if (config.command === Command.Watch) {
                plugin.watch(() => content.clear().entries());
            }

            return {
                plugins: [plugin],
                optimization: {
                    splitChunks: {
                        cacheGroups: {
                            frameworkContent: {
                                minChunks: 2,
                                name: content.getFrameworkEntry(),
                                test: isEntryModuleOrIssuer('content'),
                                chunks: (chunk): boolean => {
                                    const {name} = chunk;

                                    if (!name) {
                                        return false;
                                    }

                                    return content.likely(name);
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
            manifest.setContentScripts(await content.manifest());
        }
    };
});