import {DefinePlugin, HtmlRspackPlugin} from "@rspack/core";
import HtmlRspackTagsPlugin from "html-rspack-tags-plugin";

import Page from "./Page";

import {PageDeclaration} from "./declaration";

import {definePlugin} from "@main/plugin";
import {virtualViewModule} from "@cli/virtual";
import {EntrypointPlugin} from "@cli/bundler";

import {Command} from "@typing/app";

export {Page};

export default definePlugin(() => {
    let page: Page;
    let pageDeclaration: PageDeclaration;

    return {
        name: 'adnbn:page',
        startup: ({config}) => {
            page = new Page(config);
            pageDeclaration = new PageDeclaration(config);
        },
        page: () => page.files(),
        bundler: async ({config}) => {
            pageDeclaration.setAlias(await page.aliasKeys()).build();

            if (await page.empty()) {
                if (config.debug) {
                    console.info('Page entries not found');
                }

                return {};
            }

            const plugin = EntrypointPlugin.from(await page.entries())
                .virtual(file => virtualViewModule(file));

            if (config.command === Command.Watch) {
                plugin.watch(async () => {
                    pageDeclaration.setAlias(await page.clear().aliasKeys()).build();

                    return page.entries();
                });
            }

            const htmlPlugins = (await page.html()).map(options => new HtmlRspackPlugin(options));
            const tagsPlugins = (await page.tags()).map(options => new HtmlRspackTagsPlugin(options));

            return {
                plugins: [
                    new DefinePlugin({
                        '__ADNBN_PAGE_ALIAS__': JSON.stringify(await page.alias()),
                    }),
                    plugin,
                    ...htmlPlugins,
                    ...tagsPlugins,
                ],
            };
        }
    };
});