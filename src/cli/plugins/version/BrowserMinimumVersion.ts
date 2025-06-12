import semver from "semver";

import {getEnv} from "@main/env";

import AbstractVersion from "./AbstractVersion";

import type {ReadonlyConfig} from "@typing/config";

export default class extends AbstractVersion {

    constructor(config: ReadonlyConfig) {
        super(config);
    }

    public getVersion(): string | undefined {
        const version = this.extractVersionValue(this.config.minimumVersion)

        const configVersion = this.resolveVersion(version);

        const envVersion = this.resolveVersion(getEnv(version));

        return configVersion || envVersion;
    }

    protected resolveVersion(version?: string): string | undefined {
        if (!version) return

        const semverVersion: string = semver.coerce(version)?.raw

        if (semverVersion) {
            const parts = version.split(".")

            if (parts.length === 4 && Number.isFinite(Number(parts[3]))) {
                return semverVersion + '.' + parts[3]
            }
            return semverVersion + '.0';
        }
    }
}