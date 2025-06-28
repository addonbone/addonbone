import _ from "lodash";
import {Configuration as RspackConfig, NormalModule} from "@rspack/core";

import {definePlugin} from "@main/plugin";

import {getRootPath, getSourcePath} from "@cli/resolvers/path";

export default definePlugin(() => {
    return {
        name: "adnbn:optimization",
        bundler: ({config}) => {
            if (!config.commonChunks) {
                return {};
            }

            return {
                optimization: {
                    usedExports: true,
                    providedExports: true,
                    splitChunks: {
                        minSize: 10,
                        cacheGroups: {
                            default: false,
                            defaultVendors: false,
                            common: {
                                test: (module) => {
                                    const {resource} = module as NormalModule;

                                    if (!resource) {
                                        return false;
                                    }

                                    return resource.startsWith(getRootPath(getSourcePath(config)));
                                },
                                name: (module, chunks, cacheGroupKey) => {
                                    const entryNames = Array.from(
                                        new Set(
                                            chunks
                                                .map(({name}) => name)
                                                .filter((name) => _.isString(name))
                                        )
                                    ).sort();

                                    return `${entryNames.join('-')}.${cacheGroupKey}`;
                                },
                                minSize: 10,
                                minChunks: 2,
                                priority: -10,
                                reuseExistingChunk: true,
                            },
                        },
                    },
                },
            } satisfies RspackConfig;
        },
    };
});