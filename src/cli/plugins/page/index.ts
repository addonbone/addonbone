import {DefinePlugin, HtmlRspackPlugin, Configuration as RspackConfig} from "@rspack/core";
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
    let declaration: PageDeclaration;

    return {
        name: 'adnbn:page',
        startup: ({config}) => {
            page = new Page(config);
            declaration = new PageDeclaration(config);
        },
        page: () => page.files(),
        bundler: async ({config}) => {
            declaration.setAlias(await page.getAlias()).build();

            if (await page.empty()) {
                if (config.debug) {
                    console.info('Page entries not found');
                }

                return {};
            }

            const plugin = EntrypointPlugin.from(await page.view().entries())
                .virtual(file => virtualViewModule(file));

            if (config.command === Command.Watch) {
                plugin.watch(async () => {
                    declaration.setAlias(await page.clear().getAlias()).build();

                    return page.view().entries();
                });
            }

            const htmlPlugins = (await page.view().html()).map(options => new HtmlRspackPlugin(options));
            const tagsPlugins = (await page.view().tags()).map(options => new HtmlRspackTagsPlugin(options));

            return {
                plugins: [
                    new DefinePlugin({
                        '__ADNBN_PAGE_ALIAS__': JSON.stringify(await page.getAliasToFilename()),
                    }),
                    plugin,
                    ...htmlPlugins,
                    ...tagsPlugins,
                ],
            } satisfies RspackConfig;
        }
    };
});