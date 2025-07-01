//@ts-ignore
import {OffscreenUnresolvedDefinition} from "adnbn";
//@ts-ignore
import {__t} from "adnbn/locale";
//@ts-ignore
import {isValidTransportDefinition, isValidTransportInitFunction, type TransportType} from "adnbn/entry/transport";
//@ts-ignore
import {Builder as OffscreenBuilder} from "adnbn/entry/offscreen";

import {Builder as ViewBuilder} from "virtual:view-framework";

import * as module from "virtual:offscreen-entrypoint";

try {
    const relayName = "virtual:offscreen-name";

    const {default: defaultDefinition, ...otherDefinition} = module;

    let definition: OffscreenUnresolvedDefinition<TransportType> = otherDefinition;

    if (isValidTransportDefinition(defaultDefinition)) {
        definition = {...definition, ...defaultDefinition};
    } else if (isValidTransportInitFunction(defaultDefinition)) {
        definition = {...definition, init: defaultDefinition};
    }

    const {init, main, name = relayName, ...options} = definition;

    new OffscreenBuilder({
        name,
        init,
        main,
        ...options,
    })
        .view(new ViewBuilder(options))
        .build()
        .catch(e => {
            console.error("Failed to build offscreen: ", e);
        });
} catch (e) {
    console.error("The offscreen crashed on startup:", e);
}
