import {Required} from "utility-types";

import {EntrypointBuilder, EntrypointOptions} from "@typing/entrypoint";
import {BackgroundConfig} from "@typing/background";
import {Awaiter} from "@typing/helpers";

export const ServiceGlobalKey = 'adnbnService';

export type ServiceType = ((...args: any[]) => Promise<any>) | { [key: string]: any | ServiceType };

export interface ServiceDictionary {
    [key: string]: any;
}

export type ServiceName = Extract<keyof ServiceDictionary, string>;

export interface ServiceManager {
    add<K extends ServiceName>(
        name: K,
        instance: ServiceDictionary[K]
    ): this;

    get<K extends ServiceName>(
        name: K
    ): ServiceDictionary[K] | undefined;

    has(name: ServiceName): boolean;

    remove<K extends ServiceName>(
        name: K
    ): ServiceDictionary[K] | undefined;

    clear(): this;
}

export interface ServiceConfig extends BackgroundConfig {
    name: string;
}

export type ServiceOptions = ServiceConfig & EntrypointOptions;

export type ServiceEntrypointOptions = Partial<ServiceOptions>;

export type ServiceInitGetter<T extends ServiceType> = (options: ServiceOptions) => T;

export type ServiceMainHandler<T extends ServiceType> = (service: T, options: ServiceOptions) => Awaiter<void>;

export type ServiceDefinition<T extends ServiceType> = ServiceEntrypointOptions & {
    init?: ServiceInitGetter<T>;
    main?: ServiceMainHandler<T>;
};

export type ServiceUnresolvedDefinition<T extends ServiceType> = Partial<ServiceDefinition<T>>;

export type ServiceResolvedDefinition<T extends ServiceType> = Required<ServiceDefinition<T>, 'name' | 'init'>;

export type ServiceBuilder = EntrypointBuilder;
