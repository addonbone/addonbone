import type {RelayUnresolvedDefinition} from "adnbn";
import type {TransportType} from "adnbn/transport";
import {isValidTransportDefinition, isValidTransportInitFunction} from "adnbn/entry/transport";
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

    const {init, main, name, ...options} = definition;

    new RelayBuilder({
        name: relayName,
        init,
        main,
        ...options,
    })
        .content(new ContentScriptBuilder(options))
        .build()
        .catch(e => {
            console.error("Failed to build relay: ", e);
        });
} catch (e) {
    console.error("The relay crashed on startup:", e);
}
