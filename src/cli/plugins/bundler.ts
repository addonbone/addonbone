import {Configuration as RspackConfig} from "@rspack/core";

import {definePlugin} from "@main/plugin";

export default definePlugin(() => {
    return {
        name: "adnbn:bundler",
        bundler: () => {
            return {
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
            } satisfies RspackConfig;
        },
    };
});
