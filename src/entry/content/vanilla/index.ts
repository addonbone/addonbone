import VanillaBuilder from './VanillaBuilder';

import {buildEntrypoint} from "../../utils/entrypoint";

import {ContentScriptDefinition} from "@typing/content";

export default (definition: ContentScriptDefinition): void => {
    buildEntrypoint(VanillaBuilder.make(definition));
};