import _ from "lodash";
import {Configuration as RspackConfig} from "@rspack/core";

import {definePlugin} from "@main/plugin";

import {appFilenameResolver} from "@cli/bundler";
import {getOutputPath, getRootPath} from "@cli/resolvers/path";

export default definePlugin(() => {
    return {
        name: "adnbn:output",
        bundler: ({config}) => {
            const {app, jsDir, jsFilename} = config;

            const kebabApp = _.kebabCase(app);
            const camelApp = _.camelCase(app);

            const filename = appFilenameResolver(app, jsFilename, jsDir);

            return {
                output: {
                    path: getRootPath(getOutputPath(config)),
                    filename,
                    chunkFilename: filename,
                    hotUpdateGlobal: camelApp + "HotUpdate",
                    chunkLoadingGlobal: camelApp + "ChunkLoading",
                    uniqueName: kebabApp,
                },
            } satisfies RspackConfig;
        },
    };
});
