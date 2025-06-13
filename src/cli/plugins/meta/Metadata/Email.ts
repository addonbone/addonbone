import validator from 'validator';

import {getEnv} from "@main/env";

import AbstractMeta from "./AbstractMeta";

import type {ReadonlyConfig} from "@typing/config";

export default class extends AbstractMeta {
    public constructor(config: ReadonlyConfig) {
        super(config);
    }

    public getValue(): string | undefined {
        const email = this.getResolvedValue(this.config.email);

        return this.getValid(email) || this.getValid(getEnv(email));
    }

    protected getValid(value?: string): string | undefined {
        return validator.isEmail(value || '') ? value : undefined;
    }
}