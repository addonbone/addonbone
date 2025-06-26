import path from "path";

import {CopyRspackPlugin} from "@rspack/core";

import {definePlugin} from "@main/plugin";

import {getAppPath, getSharedPath} from "@cli/resolvers/path";

import type {RawCopyPattern} from "@rspack/binding";

type CopyPatterns = Array<Pick<RawCopyPattern, 'from' | 'to'>>;

export default definePlugin(() => {
    return {
        name: 'adnbn:public',
        bundler: async ({config}) => {
            const {publicDir, mergePublic} = config;

            const appPath = getAppPath(config);
            const appPublicPath = getAppPath(config, publicDir);
            const sharedPublicPath = getSharedPath(config, publicDir);

            if (path.resolve(appPath) === path.resolve(appPublicPath)) {
                throw new Error('"publicDir" can\'t be the root directory');
            }

            const patterns: CopyPatterns = [{from: appPublicPath, to: publicDir}];

            if (mergePublic) {
                patterns.push({from: sharedPublicPath, to: publicDir});
            }

            return {
                plugins: [
                    new CopyRspackPlugin({patterns})
                ]
            };
        }
    };
});
