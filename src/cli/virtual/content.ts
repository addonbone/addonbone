//@ts-ignore
import {type ContentScriptDefinition} from "adnbn";

import * as module from "virtual:content-entrypoint";

import _isFunction from "lodash/isFunction";
import _isPlainObject from "lodash/isPlainObject";

try {
    const {default: defaultDefinition, ...otherDefinition} = module;

    let definition: ContentScriptDefinition = otherDefinition;

    if (_isPlainObject(defaultDefinition)) {
        definition = {...definition, ...defaultDefinition};
    } else if (_isFunction(defaultDefinition)) {
        definition = {...definition, render: defaultDefinition};
    }

    const {render, ...options} = definition;

} catch (e) {
    console.error('The content script crashed on startup:', e);
}
