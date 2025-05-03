import ProxyService from "@service/ProxyService";

import {
    ServiceDefinition,
    ServiceDictionary,
    ServiceInitGetter,
    ServiceMainHandler,
    ServiceName,
    ServiceType
} from "@typing/service";
import {DeepAsyncProxy} from "@typing/helpers";

export type {ServiceDefinition, ServiceMainHandler, ServiceInitGetter};

export const defineService = <T extends ServiceType>(options: ServiceDefinition<T>): ServiceDefinition<T> => {
    return options;
}

export const getService = <N extends ServiceName>(name: N): DeepAsyncProxy<ServiceDictionary[N]> => {
    return new ProxyService(name).get();
}