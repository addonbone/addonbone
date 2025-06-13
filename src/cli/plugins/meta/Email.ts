import isEmail from 'validator/lib/isEmail';

import AbstractMeta from "./AbstractMeta";

import type {ReadonlyConfig} from "@typing/config";

export default class extends AbstractMeta {
    public constructor(config: ReadonlyConfig) {
        super(config);
    }

    public getValue(): ReadonlyConfig['email'] {
        return this.config.email;
    }

    protected isValid(value?: string): boolean {
        return value ? isEmail(value) : false;
    }
}