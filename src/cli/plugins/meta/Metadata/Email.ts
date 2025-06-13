import {getEnv} from "@main/env";

import AbstractMeta from "./AbstractMeta";

import type {ReadonlyConfig} from "@typing/config";

export default class extends AbstractMeta {
    public constructor(config: ReadonlyConfig) {
        super(config);
    }

    public getValue(): string | undefined {
        const email = this.getResolvedValue(this.config.email);

        if (this.isValidEmail(email)) return email;

        const envEmail = getEnv(email);

        if (this.isValidEmail(envEmail)) return envEmail;
    }

    protected isValidEmail(value?: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '');
    }
}