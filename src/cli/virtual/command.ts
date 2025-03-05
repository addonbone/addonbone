//@ts-ignore
import {type CommandDefinition} from "adnbn";
import {handleCommand} from "adnbn/client";

import * as module from "virtual:command-entrypoint";

import _isFunction from "lodash/isFunction";
import _isPlainObject from "lodash/isPlainObject";
import _isString from "lodash/isString";
import _isEmpty from "lodash/isEmpty";

try {
    const commandName = 'virtual:command-name';

    const {default: defaultDefinition, ...otherDefinition} = module;

    let definition: Partial<CommandDefinition> = otherDefinition;

    if (_isPlainObject(defaultDefinition)) {
        definition = {...definition, ...defaultDefinition};
    } else if (_isFunction(defaultDefinition)) {
        definition = {...definition, execute: defaultDefinition};
    }

    const {execute, name = commandName, ...options} = definition;

    if (!_isFunction(execute)) {
        throw new Error('The command entrypoint must export a execute function');
    }

    if (!_isString(name) || _isEmpty(name)) {
        throw new Error('The command entrypoint must export a name string');
    }

    handleCommand(name, execute, options);
} catch (e) {
    console.error('The command crashed on startup:', e);
}
