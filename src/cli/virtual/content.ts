//@ts-ignore
import {type ContentScriptDefinition} from "adnbn";

import contentScript from "virtual:content-client";
import * as module from "virtual:content-entrypoint";

try {
    const {default: defaultDefinition, ...otherDefinition} = module;

    let definition: ContentScriptDefinition = otherDefinition;

    if (defaultDefinition && typeof defaultDefinition === 'object' && defaultDefinition.constructor === Object) {
        definition = {...definition, ...defaultDefinition};
    } else if (typeof defaultDefinition === 'function' || typeof defaultDefinition === 'string' || typeof defaultDefinition === 'number') {
        definition = {...definition, render: defaultDefinition};
    }

    contentScript(definition);
} catch (e) {
    console.error('The content script crashed on startup:', e);
}
