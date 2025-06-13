//@ts-ignore
import {OffscreenUnresolvedDefinition} from "adnbn";
//@ts-ignore
import {isValidTransportDefinition, isValidTransportInitFunction, type TransportType} from "adnbn/entry/transport";

import offscreen from "virtual:offscreen-framework";

import * as module from "virtual:offscreen-entrypoint";

try {
    const relayName = 'virtual:offscreen-name';

    const {default: defaultDefinition, ...otherDefinition} = module;

    let definition: OffscreenUnresolvedDefinition<TransportType> = otherDefinition;

    if (isValidTransportDefinition(defaultDefinition)) {
        definition = {...definition, ...defaultDefinition};
    } else if (isValidTransportInitFunction(defaultDefinition)) {
        definition = {...definition, init: defaultDefinition};
    }

    const {init, name = relayName, ...options} = definition;

    offscreen({name, init, ...options});
} catch (e) {
    console.error('The offscreen crashed on startup:', e);
}
