import {getEnv} from "@main/env";

import type {ReadonlyConfig} from "@typing/config";

export default abstract class AbstractMeta<V extends string = string> {

    public static value<T extends AbstractMeta<any>>(
        this: new (config: ReadonlyConfig) => T,
        config: ReadonlyConfig
    ): T extends AbstractMeta<infer V> ? V | undefined : never {
        return new this(config).getResolved() as T extends AbstractMeta<infer V> ? V | undefined : never;
    }

    public abstract getValue(): undefined | V | (() => V | undefined);

    protected constructor(protected readonly config: ReadonlyConfig) {
    }

    public getResolved(): V | undefined {
        const value = this.getValue();

        let resolved = typeof value === "function" ? value() : value;

        if (this.isValid(resolved)) {
            return resolved;
        }

        if (typeof resolved === "string") {
            resolved = getEnv(resolved);

            if (this.isValid(resolved)) {
                return resolved;
            }
        }
    }

    protected isValid(value?: V): boolean {
        return true;
    }
}