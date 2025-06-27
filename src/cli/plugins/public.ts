import fs from "fs";
import path from "path";

import {CopyRspackPlugin} from "@rspack/core";

import {definePlugin} from "@main/plugin";

import {getAppPath, getAppSourcePath, getAppsPath, getSharedPath, getSourcePath} from "@cli/resolvers/path";

import type {RawCopyPattern} from "@rspack/binding";

type CopyPatterns = Array<Pick<RawCopyPattern, 'from' | 'to'>>;

export default definePlugin(() => {
    return {
        name: 'adnbn:public',
        bundler: async ({config}) => {
            const {publicDir, mergePublic} = config;

            const appSourcePath = getAppSourcePath(config, publicDir);
            const appPath = getAppPath(config, publicDir);
            const appsPath = getAppsPath(config, publicDir);
            const sharedPath = getSharedPath(config, publicDir);
            const sourcePath = getSourcePath(config, publicDir);

            if (path.resolve(getSourcePath(config)) === path.resolve(sourcePath)) {
                throw new Error('"publicDir" can\'t be the root directory');
            }

            const patterns: CopyPatterns = [];

            const paths: string[] = [appSourcePath, appPath, appsPath, sharedPath, sourcePath];

            for (const path of paths) {
                if (!mergePublic && patterns.length > 0) break;

                if (fs.existsSync(path)) {
                    patterns.push({from: path, to: publicDir});
                }
            }

            return {
                plugins: [
                    new CopyRspackPlugin({patterns})
                ]
            };
        }
    };
});
