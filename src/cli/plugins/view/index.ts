import {definePlugin} from "@main/plugin";
import {isEntryModuleOrIssuer} from "@cli/bundler";

export {default as View} from "./View";

export default definePlugin(() => {
    return {
        name: 'adnbn:view',
        bundler: {
            optimization: {
                splitChunks: {
                    cacheGroups: {
                        frameworkView: {
                            minChunks: 2,
                            name: 'view',
                            test: isEntryModuleOrIssuer('view'),
                            enforce: false,
                            reuseExistingChunk: true,
                            priority: 10
                        },
                    }
                }
            }
        }
    };
});