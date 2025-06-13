import {getEnv} from "@main/env";

import AbstractMeta from "./AbstractMeta";

import type {ReadonlyConfig} from "@typing/config";

export default class extends AbstractMeta {
    public constructor(config: ReadonlyConfig) {
        super(config);
    }

    public getValue(): string | undefined {
        const homepage = this.getResolvedValue(this.config.homepage)

        if (this.isValidUrl(homepage)) return homepage;

        const envHomepage = getEnv(homepage);
        if (this.isValidUrl(envHomepage)) return envHomepage;
    }

    protected isValidUrl(value?: string): boolean {
        try {
            new URL(value || '');
            return true;
        } catch {
            return false;
        }
    }
}