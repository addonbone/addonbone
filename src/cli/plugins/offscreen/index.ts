import {Configuration as RspackConfig, DefinePlugin, HtmlRspackPlugin} from "@rspack/core";
import HtmlRspackTagsPlugin from "html-rspack-tags-plugin";

import {definePlugin} from "@main/plugin";

import {EntrypointPlugin} from "@cli/bundler";

import Offscreen from "./Offscreen";
import OffscreenDeclaration from "./OffscreenDeclaration";

import {Command} from "@typing/app";

export default definePlugin(() => {
    let offscreen: Offscreen;
    let declaration: OffscreenDeclaration;

    return {
        name: 'adnbn:offscreen',
        startup: ({config}) => {
            offscreen = new Offscreen(config);
            declaration = new OffscreenDeclaration(config);
        },
        offscreen: () => offscreen.files(),
        bundler: async ({config}) => {
            declaration.dictionary(await offscreen.dictionary()).build();

            if (await offscreen.empty()) {
                if (config.debug) {
                    console.info('Offscreen entries not found');
                }

                return {};
            } else if (config.manifestVersion === 2) {
                if (config.debug) {
                    console.warn('Offscreen not supported for manifest version 2');
                }

                return {};
            }

            const plugin = EntrypointPlugin.from(await offscreen.view().entries())
                .virtual(file => offscreen.virtual(file));

            if (config.command === Command.Watch) {
                plugin.watch(async () => {
                    declaration.dictionary(await offscreen.clear().dictionary()).build();

                    return offscreen.view().entries();
                });
            }

            const htmlPlugins = (await offscreen.view().html()).map(options => new HtmlRspackPlugin(options));
            const tagsPlugins = (await offscreen.view().tags()).map(options => new HtmlRspackTagsPlugin(options));

            return {
                plugins: [
                    new DefinePlugin({
                        __ADNBN_OFFSCREEN_PARAMETERS__: JSON.stringify(await offscreen.parameters()),
                    }),
                    plugin,
                    ...htmlPlugins,
                    ...tagsPlugins,
                ],
            } satisfies RspackConfig;
        },
        manifest: async ({manifest, config}) => {
            if (config.manifestVersion !== 2 && await offscreen.exists()) {
                manifest.addPermission('offscreen');
            }
        }
    }
});