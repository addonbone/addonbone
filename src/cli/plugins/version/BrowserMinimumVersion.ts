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
        const coerceVersion = semver.coerce(version)

        if (!version || !coerceVersion) return

        const parts: string[] = coerceVersion.version.split(".");

        while (parts.length && parts[parts.length - 1] === '0') {
            parts.pop();
        }

        return parts.join('.') || undefined;
    }
}