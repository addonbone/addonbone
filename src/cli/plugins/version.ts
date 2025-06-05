import semver from 'semver';
import fs from "fs";

import {getEnv} from "@main/env";
import {definePlugin} from "@main/plugin";
import {getInputPath} from "@cli/resolvers/path";

export default definePlugin(() => {
    return {
        name: 'adnbn:version',
        manifest: ({manifest, config}) => {
            const trySetVersion = (version?: string): boolean => {
                if (version && semver.valid(version)) {
                    manifest.setVersion(version);
                    return true;
                }
                return false;
            };

            if (trySetVersion(config.version)) return;

            if (trySetVersion(getEnv(config.version))) return;

            try {
                const packageJsonPath = getInputPath(config, 'package.json');
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
                trySetVersion(packageJson.version);
            } catch(err) {
                console.error('Unable to read version from package.json', err);
            }
        }
    }
});
