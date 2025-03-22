import ReactBuilder from "./ReactBuilder";

import {ContentScriptDefinition} from "@typing/content";

export default (definition: ContentScriptDefinition): void => {
    ReactBuilder.make(definition).build().catch((e) => {
        console.error('Content script react failed to build', e);
    });
};