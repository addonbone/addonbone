//@ts-ignore
import {RelayUnresolvedDefinition} from "adnbn";
//@ts-ignore
import {isValidTransportDefinition, isValidTransportInitFunction, type TransportType} from "adnbn/entry/transport";

import relay from "virtual:relay-framework";

import * as module from "virtual:relay-entrypoint";

try {
    const relayName = 'virtual:relay-name';

    const {default: defaultDefinition, ...otherDefinition} = module;

    let definition: RelayUnresolvedDefinition<TransportType> = otherDefinition;

    if (isValidTransportDefinition(defaultDefinition)) {
        definition = {...definition, ...defaultDefinition};
    } else if (isValidTransportInitFunction(defaultDefinition)) {
        definition = {...definition, init: defaultDefinition};
    }

    const {init, name = relayName, ...options} = definition;

    relay({name, init, ...options});
} catch (e) {
    console.error('The relay crashed on startup:', e);
}
