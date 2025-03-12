import {ContentScriptDefinition} from "@typing/content";

export const handleContentScript = (definition: ContentScriptDefinition): void => {
    console.log('content script definition', definition);
}