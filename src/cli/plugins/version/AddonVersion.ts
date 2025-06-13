import fs from "fs";
import semver from "semver";

import {getEnv} from "@main/env";
import {getInputPath} from "@cli/resolvers/path";

import AbstractVersion from "./AbstractVersion";

import type {ReadonlyConfig} from "@typing/config";

export default class extends AbstractVersion {

    constructor(config: ReadonlyConfig) {
        super(config);
    }

    public getVersion(): string | undefined {
        const version = this.extractVersionValue(this.config.version)

        if(semver.valid(version)){
            return version;
        }

        const envVersion = getEnv(version);

        if(semver.valid(envVersion)){
            return envVersion;
        }

        const packagePath = getInputPath(this.config, 'package.json');

        try {
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

            return packageJson.version;
        } catch (e) {
            console.error(`Unable to read version from "${packagePath}"`, e);
        }
    }
}