import validator from 'validator';

import {getEnv} from "@main/env";

import AbstractMeta from "./AbstractMeta";

import type {ReadonlyConfig} from "@typing/config";

export default class extends AbstractMeta {
    public constructor(config: ReadonlyConfig) {
        super(config);
    }

    public getValue(): string | undefined {
        const homepage = this.getResolvedValue(this.config.homepage)

        return this.getValid(homepage) || this.getValid(getEnv(homepage));
    }

    protected getValid(value?: string): string | undefined {
        return validator.isURL(value || '') ? value : undefined;
    }
}