import {Configuration as RspackConfig, HtmlRspackPlugin, Plugins} from "@rspack/core";
import HtmlRspackTagsPlugin from "html-rspack-tags-plugin";

import Page from "./Page";

import {PageDeclaration} from "./declaration";

import {definePlugin} from "@main/plugin";
import {virtualViewModule} from "@cli/virtual";
import {EntrypointPlugin, RuntimeDataPlugin} from "@cli/bundler";

import {Command} from "@typing/app";
import {PageAliasesRuntimeProperty} from "@typing/page";

export default definePlugin(() => {
    let page: Page;
    let declaration: PageDeclaration;

    return {
        name: "adnbn:page",
        startup: ({config}) => {
            page = new Page(config);
            declaration = new PageDeclaration(config);
        },
        page: () => page.files(),
        bundler: async ({config}) => {
            declaration.setAlias(await page.getAlias()).build();

            const aliases = Object.fromEntries(
                Array.from((await page.views()).values(), item => [item.alias, item.filename])
            );

            const aliasPlugin = new RuntimeDataPlugin({property: PageAliasesRuntimeProperty, data: aliases});

            const plugins: Plugins = [];

            if (await page.empty()) {
                if (config.debug) {
                    console.info("Page entries not found");
                }
            } else {
                // prettier-ignore
                const plugin = EntrypointPlugin.from(await page.view().entries())
                    .virtual(file => virtualViewModule(file));

                if (config.command === Command.Watch) {
                    plugin.watch(async () => {
                        declaration.setAlias(await page.clear().getAlias()).build();

                        aliasPlugin.update(
                            Object.fromEntries(
                                Array.from((await page.views()).values(), item => [item.alias, item.filename])
                            )
                        );

                        return page.view().entries();
                    });
                }

                const htmlPlugins = (await page.view().html()).map(options => new HtmlRspackPlugin(options));
                const tagsPlugins = (await page.view().tags()).map(options => new HtmlRspackTagsPlugin(options));

                plugins.push(plugin, ...htmlPlugins, ...tagsPlugins);
            }

            return {
                plugins: [aliasPlugin, ...plugins],
            } satisfies RspackConfig;
        },
        manifest: async ({manifest}) => {
            manifest.appendAccessibleResources(await page.accessibleResources()).appendCsp(await page.csp());
        },
    };
});
