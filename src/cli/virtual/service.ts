//@ts-ignore
import type {ServiceType, ServiceUnresolvedDefinition} from "adnbn";
//@ts-ignore
import service, {isValidServiceDefinition, isValidServiceInitFunction} from "adnbn/entry/service";

import * as module from "virtual:service-entrypoint";

try {
    const serviceName = 'virtual:service-name';

    const {default: defaultDefinition, ...otherDefinition} = module;

    let definition: ServiceUnresolvedDefinition<ServiceType> = otherDefinition;

    if (isValidServiceDefinition(defaultDefinition)) {
        definition = {...definition, ...defaultDefinition};
    } else if (isValidServiceInitFunction(defaultDefinition)) {
        definition = {...definition, init: defaultDefinition};
    }

    const {init, name = serviceName, ...options} = definition;

    service({name, init, ...options});
} catch (e) {
    console.error('The service crashed on startup:', e);
}
