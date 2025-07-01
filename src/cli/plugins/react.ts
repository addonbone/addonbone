import path from "path";
import {Configuration as RspackConfig} from "@rspack/core";

import {definePlugin} from "@main/plugin";

import {getRootPath} from "@cli/resolvers/path";

export default definePlugin(() => {
    return {
        name: "adnbn:react",
        bundler: () => {
            return {
                resolve: {
                    extensions: [".js", ".jsx"],
                    alias: {
                        react: getRootPath(path.join("node_modules", "react")),
                        "react-dom": getRootPath(path.join("node_modules", "react-dom")),
                        scheduler: getRootPath(path.join("node_modules", "scheduler")),
                    },
                },
                optimization: {
                    splitChunks: {
                        cacheGroups: {
                            react: {
                                name: "react",
                                test: /[\\/]node_modules[\\/](react|react-dom|scheduler)([\\/]|$)/,
                                priority: 100,
                                reuseExistingChunk: true,
                                enforce: true,
                            },
                        },
                    },
                },
                module: {
                    rules: [
                        {
                            test: /\.svg$/i,
                            issuer: /\.[jt]sx?$/,
                            resourceQuery: /react/,
                            use: [
                                {
                                    loader: "@svgr/webpack",
                                    options: {
                                        expandProps: "start",
                                        typescript: true,
                                    },
                                },
                            ],
                        },
                    ],
                },
            } as RspackConfig;
        },
    };
});
