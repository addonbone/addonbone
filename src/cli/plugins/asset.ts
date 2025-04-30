import path from "path";

import {definePlugin} from "@main/plugin";

import {ReplacePlugin} from "@cli/bundler";

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
                                    resourceQuery: /chrome/,
                                    type: "asset/resource",
                                    generator: {
                                        publicPath: "chrome-extension://__MSG_@@extension_id__/"
                                    }
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
            };
        },
    };
});