import {Configuration as RspackConfig} from "@rspack/core";

import {definePlugin} from "@main/plugin";

export default definePlugin(() => {
    return {
        name: 'adnbn:react',
        bundler: () => {
            return {
                resolve: {
                    extensions: [".js", ".jsx"],
                },
                optimization: {
                    splitChunks: {
                        cacheGroups: {
                            react: {
                                name: 'react',
                                test: /[\\/]node_modules[\\/](react|react-dom|scheduler)([\\/]|$)/,
                                priority: -5,
                                reuseExistingChunk: true,
                                enforce: true,
                            },
                        },
                    },
                },
            } as RspackConfig;
        },
    };
});