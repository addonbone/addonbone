import ProxyService from "@service/ProxyService";

import {ServiceDefinition, ServiceInitGetter, ServiceMainHandler, ServiceType} from "@typing/service";
import {DeepAsyncProxy} from "@typing/helpers";

export type {ServiceDefinition, ServiceMainHandler, ServiceInitGetter};

export interface ServiceDictionary {
    [key: string]: any;
}

export const defineService = <T extends ServiceType>(options: ServiceDefinition<T>): ServiceDefinition<T> => {
    return options;
}

export const getService = <N extends Extract<keyof ServiceDictionary, string>>(name: N): DeepAsyncProxy<ServiceDictionary[N]> => {
    return new ProxyService<ServiceDictionary[N]>(name).get();
}