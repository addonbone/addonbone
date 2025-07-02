//@ts-ignore
import {RelayUnresolvedDefinition} from "adnbn";
//@ts-ignore
import {isValidTransportDefinition, isValidTransportInitFunction, type TransportType} from "adnbn/entry/transport";
//@ts-ignore
import {Builder as RelayBuilder} from "adnbn/entry/relay";

import {Builder as ContentScriptBuilder} from "virtual:content-framework";

import * as module from "virtual:relay-entrypoint";

try {
    const relayName = "virtual:relay-name";

    const {default: defaultDefinition, ...otherDefinition} = module;

    let definition: RelayUnresolvedDefinition<TransportType> = otherDefinition;

    if (isValidTransportDefinition(defaultDefinition)) {
        definition = {...definition, ...defaultDefinition};
    } else if (isValidTransportInitFunction(defaultDefinition)) {
        definition = {...definition, init: defaultDefinition};
    }

    const {init, main, name = relayName, ...options} = definition;

    new RelayBuilder({name, init, main, ...options})
        .content(new ContentScriptBuilder(options))
        .build()
        .catch(e => {
            console.error("Failed to build relay: ", e);
        });
} catch (e) {
    console.error("The relay crashed on startup:", e);
}
