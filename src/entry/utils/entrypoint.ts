import {EntrypointBuilder} from "@typing/entrypoint";

export const buildEntrypoint = (builder: EntrypointBuilder): void => {
    builder.build().catch(e => {
        console.error('Failed to build entrypoint:', e);
    });
};