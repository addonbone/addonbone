//@ts-ignore
import {type ContentScriptDefinition} from "adnbn";
//@ts-ignore
import {handleContentScript} from "adnbn/client/content";

import * as module from "virtual:content-entrypoint";

try {
    const {default: defaultDefinition, ...otherDefinition} = module;

    let definition: ContentScriptDefinition = otherDefinition;

    if (defaultDefinition && typeof defaultDefinition === 'object' && defaultDefinition.constructor === Object) {
        definition = {...definition, ...defaultDefinition};
    } else if (typeof defaultDefinition === 'function') {
        definition = {...definition, render: defaultDefinition};
    }

    const {render, ...options} = definition;

    handleContentScript({render, ...options});
} catch (e) {
    console.error('The content script crashed on startup:', e);
}
