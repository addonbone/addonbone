import fs from "fs";
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

            const patterns: CopyPatterns = [];

            if (fs.existsSync(appPublicPath)) {
                patterns.push({from: appPublicPath, to: publicDir});
            }

            if (mergePublic && fs.existsSync(sharedPublicPath)) {
                patterns.push({from: sharedPublicPath, to: publicDir});
            }

            if (patterns.length === 0) {
                return {};
            }

            return {
                plugins: [
                    new CopyRspackPlugin({patterns})
                ]
            };
        }
    };
});
