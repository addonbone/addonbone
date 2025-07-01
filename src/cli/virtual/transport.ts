import {
    isValidTransportDefinition,
    isValidTransportInitFunction,
    type TransportType,
    type TransportUnresolvedDefinition,
    type TransportOptions,
    //@ts-ignore
} from "adnbn/entry/transport";
//@ts-ignore
import transport from "adnbn/entry/:entry";

import * as module from "virtual:transport-entrypoint";

try {
    const transportName = "virtual:transport-name";

    const {default: defaultDefinition, ...otherDefinition} = module;

    let definition: TransportUnresolvedDefinition<TransportOptions, TransportType> = otherDefinition;

    if (isValidTransportDefinition(defaultDefinition)) {
        definition = {...definition, ...defaultDefinition};
    } else if (isValidTransportInitFunction(defaultDefinition)) {
        definition = {...definition, init: defaultDefinition};
    }

    const {init, name = transportName, ...options} = definition;

    transport({name, init, ...options});
} catch (e) {
    console.error("The :entry crashed on startup:", e);
}
