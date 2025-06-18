import {Configuration as RspackConfig} from "@rspack/core";

import path from "path";

import {definePlugin} from "@main/plugin";

import {ReplacePlugin} from "@cli/bundler";

import {Browser} from "@typing/browser";

export default definePlugin(() => {
    return {
        name: 'adnbn:asset',
        bundler: ({config}) => {
            return {
                output: {
                    assetModuleFilename: path.join(config.assetsDir, '[name]-[hash:4][ext]'),
                },
                module: {
                    rules: [
                        {
                            test: /\.(png|apng|jpe?g|gif|webp)$/i,
                            oneOf: [
                                {
                                    resourceQuery: /(chrome|browser)/,
                                    type: "asset/resource",
                                    generator: {
                                        publicPath: `${config.browser === Browser.Firefox ? 'moz' : 'chrome'}-extension://__MSG_@@extension_id__/`
                                    }
                                },
                                {
                                    resourceQuery: /base64/,
                                    type: "asset/inline"
                                },
                                {
                                    type: "asset/resource"
                                }
                            ]
                        }
                    ]
                },
                plugins: [
                    new ReplacePlugin({
                        // Fix for asset/resource publicPath
                        values: {
                            '__MSG_%40@extension_id__': '__MSG_@@extension_id__'
                        }
                    })
                ]
            } as RspackConfig;
        },
    };
});