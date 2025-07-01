import {EntrypointBuilder, EntrypointConstructorParameter} from "@typing/entrypoint";

export default abstract class implements EntrypointBuilder {
    public abstract build(): Promise<void>;

    public abstract destroy(): Promise<void>;

    public static resolver<T extends new (definition: any) => EntrypointBuilder>(this: T) {
        return (definition: EntrypointConstructorParameter<T>): void => {
            new this(definition).build().catch(e => {
                console.error("Failed to build entrypoint:", e);
            });
        };
    }
}
