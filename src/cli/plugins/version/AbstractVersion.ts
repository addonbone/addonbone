import type {ReadonlyConfig} from "@typing/config";

export default abstract class AbstractVersion {

    public static version<T extends AbstractVersion>(this: new (config: ReadonlyConfig) => T, config: ReadonlyConfig): string | undefined {
        return new this(config).getVersion();
    }

    protected constructor(protected readonly config: ReadonlyConfig) {
    }

    public abstract getVersion(): string | undefined;

    protected extractVersionValue<T extends (string | number)>(version: T | (() => T)): string {
        return typeof version === "function" ? String(version()) : String(version);
    }
}