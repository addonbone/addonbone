import VanillaBuilder from './VanillaBuilder';

import {ContentScriptDefinition} from "@typing/content";

export default (definition: ContentScriptDefinition): void => {
    VanillaBuilder.make(definition).build().catch((e) => {
        console.error('Content script vanilla failed to build', e);
    });
};