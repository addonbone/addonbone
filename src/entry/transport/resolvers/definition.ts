import {
    TransportDefinition,
    TransportInitGetter,
    TransportMainHandler,
    TransportOptions,
    TransportType
} from "@typing/transport";
import {RelayDefinition, RelayMainHandler} from "@typing/relay";

export const isValidTransportDefinition = <
    O extends TransportOptions,
    T extends TransportType
>(definition: any): definition is TransportDefinition<O, T> & RelayDefinition<T> => {
    return definition && typeof definition === 'object' && definition.constructor === Object;
}

export const isValidTransportInitFunction = <
    O extends TransportOptions,
    T extends TransportType
>(init: any): init is TransportInitGetter<O, T> => {
    return init && typeof init === 'function';
}

export const isValidTransportMainFunction = <
    O extends TransportOptions,
    T extends TransportType
>(main: any): main is TransportMainHandler<O, T> & RelayMainHandler<T> => {
    return main && typeof main === 'function';
}

export const isValidTransportName = (name: any): name is string => {
    return name && typeof name === 'string' && name.trim().length > 0;
}