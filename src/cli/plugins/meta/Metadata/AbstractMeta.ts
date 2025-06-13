import type {ReadonlyConfig} from "@typing/config";

export default abstract class AbstractMeta {
    protected constructor(protected readonly config: ReadonlyConfig) {
    }

    public abstract getValue(): string | undefined;

    public static value<T extends AbstractMeta>(
        this: new (config: ReadonlyConfig) => T,
        config: ReadonlyConfig
    ): string | undefined {
        return new this(config).getValue();
    }

    protected getResolvedValue(value: string | (() => string)): string {
        return typeof value === "function" ? value() : value;
    }
}