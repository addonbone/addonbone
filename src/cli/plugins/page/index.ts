import {DefinePlugin, HtmlRspackPlugin} from "@rspack/core";
import HtmlRspackTagsPlugin from "html-rspack-tags-plugin";

import {definePlugin} from "@core/define";

import {virtualViewModule} from "@cli/virtual";

import {EntrypointPlugin} from "@cli/bundler";

import Page from "./Page";

export {Page};

export default definePlugin(() => {
    let page: Page;

    return {
        name: 'adnbn:page',
        startup: ({config}) => {
            page = new Page(config);
        },
        page: () => page.files(),
        bundler: async ({config}) => {
            if (await page.empty()) {
                if (config.debug) {
                    console.info('Page entries not found');
                }

                return {};
            }

            const pageEntrypointPlugin = EntrypointPlugin.from(await page.entries())
                .virtual(file => virtualViewModule(file));

            // if (config.command === Command.Watch) {
            //     pageEntrypointPlugin.watch(async () => {
            //         const pageEntries = await getPageEntries(config);
            //
            //         return extractEntries(pageEntries);
            //     });
            // }

            const htmlPlugins = (await page.html()).map(options => new HtmlRspackPlugin(options));
            const tagsPlugins = (await page.tags()).map(options => new HtmlRspackTagsPlugin(options));

            return {
                plugins: [
                    new DefinePlugin({
                        'PAGE_ALIAS': JSON.stringify(await page.alias()),
                    }),
                    pageEntrypointPlugin,
                    ...htmlPlugins,
                    ...tagsPlugins,
                ]
            };
        }
    };
});