import {definePlugin} from "@core/define";

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
                                test: /[\\/]node_modules[\\/](react|react-dom)([\\/]|$)/,
                                priority: -5,
                                reuseExistingChunk: true,
                                enforce: true,
                            },
                        },
                    },
                },
            }
        },
    };
});