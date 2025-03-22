import ReactBuilder from "./ReactBuilder";

import {buildEntrypoint} from "../../utils/entrypoint";

import {ContentScriptDefinition} from "@typing/content";

export default (definition: ContentScriptDefinition): void => {
    buildEntrypoint(ReactBuilder.make(definition));
};