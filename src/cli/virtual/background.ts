//@ts-ignore
import {type BackgroundDefinition} from "adnbn";

import * as module from "virtual:background-entrypoint";

import _isFunction from "lodash/isFunction";
import _isPlainObject from "lodash/isPlainObject";

try {
    const {default: defaultDefinition, ...otherDefinition} = module;

    let definition: BackgroundDefinition = otherDefinition;

    if (_isPlainObject(defaultDefinition)) {
        definition = {...definition, ...defaultDefinition};
    } else if (_isFunction(defaultDefinition)) {
        definition = {...definition, main: defaultDefinition};
    }

    const {main, ...options} = definition;

    if (_isFunction(main)) {
        Promise.resolve(main(options)).catch((e) => {
            console.error('The background main function crashed:', e);
        });
    }
} catch (e) {
    console.error('The background crashed on startup:', e);
}
