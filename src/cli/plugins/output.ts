import _ from "lodash";
import {Configuration as RspackConfig} from "@rspack/core";

import {definePlugin} from "@main/plugin";

import {appFilenameResolver} from "@cli/bundler";
import {getOutputPath, getRootPath} from "@cli/resolvers/path";

export default definePlugin(() => {
    return {
        name: 'adnbn:output',
        bundler: ({config}) => {
            const {app, jsDir, jsFilename} = config;

            const kebabApp = _.kebabCase(app);
            const snakeApp = _.snakeCase(app);

            const filename = appFilenameResolver(app, jsFilename, jsDir);

            return {
                output: {
                    path: getRootPath(getOutputPath(config)),
                    filename,
                    chunkFilename: filename,
                    hotUpdateGlobal: snakeApp + 'HotUpdate',
                    chunkLoadingGlobal: snakeApp + 'ChunkLoading',
                    uniqueName: kebabApp
                },
            } satisfies RspackConfig;
        },
    }
});