import {DefinePlugin, HtmlRspackPlugin, Configuration as RspackConfig} from "@rspack/core";
import HtmlRspackTagsPlugin from "html-rspack-tags-plugin";

import {definePlugin} from "@main/plugin";

import {EntrypointPlugin} from "@cli/bundler";
import {virtualViewModule} from "@cli/virtual";

import Popup from "./Popup";

import {PopupDeclaration} from "./declaration";

import {Command} from "@typing/app";

export default definePlugin(() => {
    let popup: Popup;
    let declaration: PopupDeclaration;

    return {
        name: 'adnbn:popup',
        startup: ({config}) => {
            popup = new Popup(config);
            declaration = new PopupDeclaration(config);
        },
        popup: () => popup.files(),
        bundler: async ({config}) => {
            declaration.setAlias(await popup.getAlias()).build();

            if (await popup.empty()) {
                if (config.debug) {
                    console.info('Popup entries not found');
                }

                return {};
            }

            const plugin = EntrypointPlugin.from(await popup.view().entries())
                .virtual(file => virtualViewModule(file));

            if (config.command === Command.Watch) {
                plugin.watch(async () => {
                    declaration.setAlias(await popup.clear().getAlias()).build();

                    return popup.view().entries();
                });
            }

            const htmlPlugins = (await popup.view().html()).map(options => new HtmlRspackPlugin(options));
            const tagsPlugins = (await popup.view().tags()).map(options => new HtmlRspackTagsPlugin(options));

            return {
                plugins: [
                    new DefinePlugin({
                        __ADNBN_POPUP_MAP__: JSON.stringify(await popup.manifestByAlias()),
                    }),
                    plugin,
                    ...htmlPlugins,
                    ...tagsPlugins,
                ],
            } as RspackConfig;
        },
        manifest: async ({manifest}) => {
            manifest.setPopup(await popup.manifest());
        }
    };
});