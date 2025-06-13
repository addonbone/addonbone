import isURL from 'validator/lib/isURL';

import AbstractMeta from "./AbstractMeta";

import type {ReadonlyConfig} from "@typing/config";

export default class extends AbstractMeta {
    public constructor(config: ReadonlyConfig) {
        super(config);
    }

    public getValue(): ReadonlyConfig['homepage'] {
        return this.config.homepage;
    }

    protected isValid(value?: string): boolean {
        return value ? isURL(value) : false;
    }
}