import {definePlugin} from "@main/plugin";
import {onlyViaTopLevelEntry} from "@cli/bundler";

export {default as View} from "./View";

export default definePlugin(() => {
    return {
        name: "adnbn:view",
        bundler: {
            optimization: {
                splitChunks: {
                    cacheGroups: {
                        frameworkView: {
                            minChunks: 2,
                            name: "view",
                            test: onlyViaTopLevelEntry("view"),
                            enforce: false,
                            reuseExistingChunk: true,
                            priority: 50,
                        },
                    },
                },
            },
        },
    };
});
