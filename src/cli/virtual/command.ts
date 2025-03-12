//@ts-ignore
import {type CommandDefinition} from "adnbn";
//@ts-ignore
import {handleCommand} from "adnbn/client/command";

import * as module from "virtual:command-entrypoint";

try {
    const commandName = 'virtual:command-name';

    const {default: defaultDefinition, ...otherDefinition} = module;

    let definition: Partial<CommandDefinition> = otherDefinition;

    if (defaultDefinition && typeof defaultDefinition === 'object' && defaultDefinition.constructor === Object) {
        definition = {...definition, ...defaultDefinition};
    } else if (typeof defaultDefinition === 'function') {
        definition = {...definition, execute: defaultDefinition};
    }

    const {execute, name = commandName, ...options} = definition;

    handleCommand({name, execute, ...options});
} catch (e) {
    console.error('The command crashed on startup:', e);
}
