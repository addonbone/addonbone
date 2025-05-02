import {contentScriptMountAppendResolver} from "@entry/content";

import {ContentScriptAppendDefinition, ContentScriptDefinition} from "@typing/content";

export * from "@entry/content";
export * from "@typing/content";

export const defineContentScript = (options: ContentScriptDefinition): ContentScriptDefinition => {
    return options;
}

export const defineContentScriptAppend = (options: ContentScriptAppendDefinition): ContentScriptDefinition => {
    const {append, ...definition} = options;

    return {
        ...definition,
        mount: contentScriptMountAppendResolver(append),
    };
}