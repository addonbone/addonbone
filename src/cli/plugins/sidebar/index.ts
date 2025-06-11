import {Configuration as RspackConfig, DefinePlugin, HtmlRspackPlugin} from "@rspack/core";
import HtmlRspackTagsPlugin from "html-rspack-tags-plugin";

import {definePlugin} from "@main/plugin";

import {EntrypointPlugin} from "@cli/bundler";
import {virtualViewModule} from "@cli/virtual";

import Sidebar from "./Sidebar";

import {SidebarDeclaration} from "./declaration";

import {Command} from "@typing/app";
import {Browser} from "@typing/browser";

export default definePlugin(() => {
    let sidebar: Sidebar;
    let declaration: SidebarDeclaration;

    return {
        name: 'adnbn:sidebar',
        startup: ({config}) => {
            sidebar = new Sidebar(config);
            declaration = new SidebarDeclaration(config);
        },
        sidebar: () => sidebar.files(),
        bundler: async ({config}) => {
            declaration.setAlias(await sidebar.getAlias()).build();

            if (await sidebar.empty()) {
                if (config.debug) {
                    console.info('Sidebar entries not found');
                }

                return {};
            } else if (config.manifestVersion === 2) {
                if (config.debug) {
                    console.warn('Sidebar not supported for manifest version 2');
                }

                return {};
            }

            const plugin = EntrypointPlugin.from(await sidebar.view().entries())
                .virtual(file => virtualViewModule(file));

            if (config.command === Command.Watch) {
                plugin.watch(async () => {
                    declaration.setAlias(await sidebar.clear().getAlias()).build();

                    return sidebar.view().entries();
                });
            }

            const htmlPlugins = (await sidebar.view().html()).map(options => new HtmlRspackPlugin(options));
            const tagsPlugins = (await sidebar.view().tags()).map(options => new HtmlRspackTagsPlugin(options));

            return {
                plugins: [
                    new DefinePlugin({
                        __ADNBN_SIDEBAR_MAP__: JSON.stringify(await sidebar.manifestByAlias()),
                    }),
                    plugin,
                    ...htmlPlugins,
                    ...tagsPlugins,
                ],
            } as RspackConfig;
        },
        manifest: async ({manifest, config}) => {
            if (config.manifestVersion === 2) {
                return;
            }

            manifest.setSidebar(await sidebar.manifest());

            if (await sidebar.exists() && config.browser !== Browser.Opera) {
                manifest.addPermission('sidePanel');
            }
        }
    };
});