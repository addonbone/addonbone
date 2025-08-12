import _ from "lodash";
import {merge as mergeConfig} from "webpack-merge";

import {definePlugin} from "@main/plugin";

export default definePlugin(() => {
    return {
        name: "adnbn:bundler",
        bundler: async ({config, rspack}) => {
            const {bundler} = config;

            const userConfig = _.isFunction(bundler) ? await bundler(rspack) : bundler;

            return mergeConfig(userConfig, {
                resolve: {
                    fallback: {
                        crypto: "crypto-browserify",
                        buffer: "buffer/",
                        stream: "stream-browserify",
                        vm: "vm-browserify",
                        string_decoder: "string_decoder/",
                        path: "path-browserify",
                        process: "process/browser",
                    },
                },
            });
        },
    };
});
