//@ts-ignore
import {type CommandDefinition} from "adnbn";
//@ts-ignore
import {onCommand} from "adnbn/browser";

import * as module from "virtual:command-entrypoint";

import _isFunction from "lodash/isFunction";
import _isPlainObject from "lodash/isPlainObject";
import _isString from "lodash/isString";
import _isEmpty from "lodash/isEmpty";

try {
    const staticName = 'virtual:command-name';

    const {default: defaultDefinition, ...otherDefinition} = module;

    let definition: Partial<CommandDefinition> = otherDefinition;

    if (_isPlainObject(defaultDefinition)) {
        definition = {...definition, ...defaultDefinition};
    } else if (_isFunction(defaultDefinition)) {
        definition = {...definition, main: defaultDefinition};
    }

    const {main, name = staticName, ...options} = definition;

    if (!_isFunction(main)) {
        throw new Error('The command entrypoint must export a main function');
    }

    if (!_isString(name) || _isEmpty(name)) {
        throw new Error('The command entrypoint must export a name string');
    }

    onCommand((command, tab) => {
        try {
            if (command === name) {
                Promise.resolve(main({name, ...options}, tab)).catch((e) => {
                    console.error('The command main async function crashed:', e);
                });
            }
        } catch (e) {
            console.error('The command main function crashed:', e);
        }
    });
} catch (e) {
    console.error('The command crashed on startup:', e);
}
