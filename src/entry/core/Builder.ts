import {EntrypointBuilder, EntrypointBuilderClass} from "@typing/entrypoint";

export default abstract class implements EntrypointBuilder {
    public abstract build(): Promise<void>;

    public abstract destroy(): Promise<void>;

    public static resolver(this: new (definition: any) => EntrypointBuilder) {
        return (definition: EntrypointBuilderClass<typeof this>): void => {
            new this(definition).build().catch(e => {
                console.error('Failed to build entrypoint:', e);
            });
        };
    }
}