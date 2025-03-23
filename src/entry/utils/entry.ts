import {EntrypointBuilder, EntrypointBuilderClass} from "@typing/entrypoint";

export function createEntryResolver<T extends new (definition: any) => EntrypointBuilder>(BuilderClass: T) {
    return (definition: EntrypointBuilderClass<T>): void => {
        new BuilderClass(definition).build().catch(e => {
            console.error('Failed to build entrypoint:', e);
        });
    };
}