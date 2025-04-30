import {ServiceDefinition, ServiceInitGetter, ServiceMainHandler, ServiceType} from "@typing/service";

export type {ServiceDefinition, ServiceMainHandler, ServiceInitGetter};

export const defineService = <T extends ServiceType>(options: ServiceDefinition<T>): ServiceDefinition<T> => {
    return options;
}