import {ContentScriptDefinition} from "adnbn";
import {isContentScriptDefinition, isValidContentScriptDefinitionRenderValue} from "adnbn/entry/content";

import contentScript from "virtual:content-framework";

import * as module from "virtual:content-entrypoint";

try {
    const {default: defaultDefinition, ...otherDefinition} = module;

    let definition: ContentScriptDefinition = otherDefinition;

    if (isContentScriptDefinition(defaultDefinition)) {
        definition = {...definition, ...defaultDefinition};
    } else if (isValidContentScriptDefinitionRenderValue(defaultDefinition)) {
        definition = {...definition, render: defaultDefinition};
    }

    contentScript(definition);
} catch (e) {
    console.error("The content script crashed on startup:", e);
}
