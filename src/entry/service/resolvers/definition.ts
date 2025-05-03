import {ServiceDefinition, ServiceInitGetter, ServiceType} from "@typing/service";

export const isValidServiceDefinition = <T extends ServiceType>(definition: any): definition is ServiceDefinition<T> => {
    return definition && typeof definition === 'object' && definition.constructor === Object;
}

export const isValidServiceInitFunction = <T extends ServiceType>(init: any): init is ServiceInitGetter<T> => {
    return init && typeof init === 'function';
}

export const isValidServiceMainFunction = <T extends ServiceType>(main: any): main is ServiceInitGetter<T> => {
    return main && typeof main === 'function';
}

export const isValidServiceName = (name: any): name is string => {
    return name && typeof name === 'string' && name.trim().length > 0;
}