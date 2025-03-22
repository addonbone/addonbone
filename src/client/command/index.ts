import Builder from "./Builder";

import {CommandUnresolvedDefinition} from "@typing/command";

export * from "./resolvers";

export default (definition: CommandUnresolvedDefinition): void => {
    new Builder(definition).build().catch((e) => {
        console.error('Command failed to build', e);
    });
}