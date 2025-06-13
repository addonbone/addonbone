import type {ReadonlyConfig} from "@typing/config";

export default abstract class {
    protected constructor(protected readonly config: ReadonlyConfig) {
    }

    public abstract getVersion(): string | undefined;

    protected extractVersionValue<T extends (string | number)>(version: T | (() => T)): string {
        return typeof version === "function" ? String(version()) : String(version);
    }
}