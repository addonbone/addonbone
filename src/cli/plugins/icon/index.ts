import {Configuration as RspackConfig, CopyRspackPlugin, DefinePlugin} from "@rspack/core";

import {definePlugin} from "@main/plugin";

import {DefaultIconGroupName} from "@typing/icon";

import Icon, {IconDefinition, CopyPatterns} from "./Icon";

import {IconDeclaration} from "./declaration";

export {Icon, type IconDefinition, type CopyPatterns};

export default definePlugin(() => {
    let icon: Icon;

    return {
        name: 'adnbn:icon',
        startup: ({config}) => {
            icon = new Icon(config);
        },
        icon: () => icon.files(),
        bundler: async ({config}) => {
            new IconDeclaration(config).setNames(await icon.names()).build();

            return {
                plugins: [
                    new CopyRspackPlugin({
                        patterns: await icon.copy(),
                    }),
                    new DefinePlugin({
                        __ADNBN_ICONS__: JSON.stringify(await icon.define()),
                    }),
                ]
            } satisfies RspackConfig;
        },
        manifest: async ({manifest, config}) => {
            manifest
                .setIcons(await icon.manifest())
                .setIcon(config.icon.name || DefaultIconGroupName);
        }
    };
});