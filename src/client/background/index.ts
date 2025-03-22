import Builder from "./Builder";

import {buildEntrypoint} from "../utils/entrypoint";

import {BackgroundDefinition} from "@typing/background";

export * from "./resolvers";

export default (definition: BackgroundDefinition): void => {
    buildEntrypoint(new Builder(definition));
}