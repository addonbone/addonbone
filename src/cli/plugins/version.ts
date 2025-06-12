import semver from "semver";
import fs from "fs";

import {getEnv} from "@main/env";
import {definePlugin} from "@main/plugin";
import {getInputPath} from "@cli/resolvers/path";

export default definePlugin(() => {
    return {
        name: 'adnbn:version',
        manifest: ({manifest, config}) => {
            const getVersion = (
                configVersion: string | (() => string),
                packageKey?: string
            ): string | undefined => {
                const version = typeof configVersion === "string" ? configVersion : configVersion();

                if (semver.valid(version)) {
                    return version;
                }

                const envVersion = getEnv(version);

                if (envVersion && semver.valid(envVersion)) {
                    return envVersion
                }

                if (!packageKey) {
                    return
                }

                const packagePath = getInputPath(config, 'package.json');

                try {
                    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

                    return packageJson[packageKey];
                } catch (e) {
                    console.error(`Unable to read ${packageKey} from "${packagePath}"`, e);
                }
            }

            const version = getVersion(config.version, 'version')
            const minimumVersion = getVersion(config.minimumVersion)

            version && manifest.setVersion(version)
            minimumVersion && manifest.setMinimumVersion(minimumVersion)
        }
    }
});
