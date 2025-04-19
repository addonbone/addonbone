import path from "path";
import {Configuration as RspackConfig} from "@rspack/core";

import Content from "./Content";

import {definePlugin} from "@core/define";
import {virtualContentScriptModule} from "@cli/virtual";

import {EntrypointPlugin} from "@cli/bundler";

import {Command, PackageName} from "@typing/app";

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

            const contentEntrypointPlugin = EntrypointPlugin.from(await content.entries())
                .virtual(file => virtualContentScriptModule(file));

            if (config.command === Command.Watch) {
                // contentEntrypointPlugin.watch(async () => {
                //     contentScriptEntries = await getContentScriptEntries(config);
                //
                //     return contentScriptEntryForPlugin(contentScriptEntries);
                // });
            }

            const rspack: RspackConfig = {
                plugins: [contentEntrypointPlugin],
                optimization: {
                    splitChunks: {
                        cacheGroups: {
                            frameworkContent: {
                                name: content.getFrameworkEntry(),
                                test: (module, {moduleGraph}): boolean => {
                                    const entryDirs = [
                                        path.join('node_modules', PackageName, 'entry', 'content'),
                                        path.join('addonbone', 'dist', 'entry', 'content'), // TODO: Remove this for production
                                    ];

                                    if (entryDirs.some((dir) => (module.resource || '').includes(dir))) {
                                        return true;
                                    }

                                    let issuer = moduleGraph.getIssuer(module);

                                    while (issuer) {
                                        if (entryDirs.some((dir) => (issuer?.resource || '').includes(dir))) {
                                            return true;
                                        }

                                        issuer = moduleGraph.getIssuer(issuer);
                                    }

                                    return false;
                                },
                                chunks: (chunk): boolean => {
                                    const {name} = chunk;

                                    if (!name) {
                                        return false;
                                    }

                                    return content.likely(name);
                                },
                                enforce: true,
                                reuseExistingChunk: true,
                                priority: -10
                            }
                        }
                    }
                }
            };

            return rspack;
        },
        manifest: async ({manifest}) => {
            manifest.setContentScripts(await content.manifest());
        }
    };
});