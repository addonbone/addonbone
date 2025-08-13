import _ from "lodash";

import {definePlugin} from "@main/plugin";

export default definePlugin(() => {
    return {
        name: "adnbn:bundler",
        bundler: async ({config, rspack}) => {
            const {bundler} = config;

            return _.isFunction(bundler) ? await bundler(rspack) : bundler;
        },
    };
});
