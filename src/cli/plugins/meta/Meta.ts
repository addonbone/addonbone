import {getEnv} from "@main/env";

import type {ReadonlyConfig} from "@typing/config";

export default class {
    public constructor(protected config: ReadonlyConfig) {
    }

    public getAuthor(): string | undefined {
        return this.getResolvedValue(this.config.author) || undefined
    }

    public getEmail(): string | undefined {
        const email = this.getResolvedValue(this.config.email);

        if (this.isValidEmail(email)) return email;

        const envEmail = getEnv(email);

        if (this.isValidEmail(envEmail)) return envEmail;
    }

    public getHomepage(): string | undefined {
        const homepage = this.getResolvedValue(this.config.homepage)

        if (this.isValidUrl(homepage)) return homepage;

        const envHomepage = getEnv(homepage);
        if (this.isValidUrl(envHomepage)) return envHomepage;
    }

    protected getResolvedValue(value: string | (() => string)): string {
        return typeof value === "function" ? value() : value;
    }

    protected isValidEmail(value?: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '');
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