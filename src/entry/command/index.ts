import Builder from "./Builder";

import {buildEntrypoint} from "entry/utils/entrypoint";

import {CommandUnresolvedDefinition} from "@typing/command";

export * from "./resolvers";

export default (definition: CommandUnresolvedDefinition): void => {
    buildEntrypoint(new Builder(definition));
}