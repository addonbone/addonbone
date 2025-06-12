import fs from "fs";
import semver from "semver";

import {getEnv} from "@main/env";
import {getInputPath} from "@cli/resolvers/path";

import type {ReadonlyConfig} from "@typing/config";

export default class {
    public constructor(protected config: ReadonlyConfig) {
    }

    public resolveVersion(): string | undefined {
        const version = this.extractVersionValue(this.config.version)

        return this.getVersion(version) || this.getVersion(getEnv(version)) || this.readPackageVersion()
    }
    
    public resolveMinimumVersion(): string | undefined {
        const version = this.extractVersionValue(this.config.minimumVersion)

        return this.getVersion(version) || this.getVersion(getEnv(version))
    }

    protected extractVersionValue(configVersion: string | (() => string)): string {
        return typeof configVersion === "string" ? configVersion : configVersion();
    }

    protected getVersion(version?: string): string | undefined {
        const semverCoerce = semver.coerce(version)

        if (semverCoerce?.raw && typeof semverCoerce.raw === "string") {
            return semverCoerce.raw;
        }
    }

    protected readPackageVersion(): string | undefined {
        const packagePath = getInputPath(this.config, 'package.json');

        try {
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

            return packageJson.version;
        } catch (e) {
            console.error(`Unable to read version from "${packagePath}"`, e);
        }
    }
}