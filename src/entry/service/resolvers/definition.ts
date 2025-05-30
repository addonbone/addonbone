import {TransportType} from "@typing/transport";
import {ServiceDefinition, ServiceInitGetter} from "@typing/service";

export const isValidServiceDefinition = <T extends TransportType>(definition: any): definition is ServiceDefinition<T> => {
    return definition && typeof definition === 'object' && definition.constructor === Object;
}

export const isValidServiceInitFunction = <T extends TransportType>(init: any): init is ServiceInitGetter<T> => {
    return init && typeof init === 'function';
}

export const isValidServiceMainFunction = <T extends TransportType>(main: any): main is ServiceInitGetter<T> => {
    return main && typeof main === 'function';
}

export const isValidServiceName = (name: any): name is string => {
    return name && typeof name === 'string' && name.trim().length > 0;
}