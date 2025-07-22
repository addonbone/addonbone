import _ from "lodash";

import AbstractMeta from "./AbstractMeta";

import {getEnv} from "@main/env";

import type {ReadonlyConfig} from "@typing/config";

export default class extends AbstractMeta {
    public constructor(config: ReadonlyConfig) {
        super(config);
    }

    public getValue(): ReadonlyConfig["author"] {
        return this.config.author;
    }

    protected isValid(value?: string): value is string {
        return _.isString(value) && value.length > 0;
    }

    public getResolved(): string | undefined {
        const value = this.getValue();

        let resolved = _.isFunction(value) ? value() : value;

        if (!this.isValid(resolved)) {
            return;
        }

        resolved = getEnv(resolved, resolved);

        if (this.isValid(resolved)) {
            return resolved;
        }
    }
}
