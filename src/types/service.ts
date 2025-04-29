import {Required} from "utility-types";

import {BackgroundConfig} from "@typing/background";
import {EntrypointBuilder, EntrypointOptions} from "@typing/entrypoint";
import {Awaiter} from "@typing/helpers";

export type ServiceType = ((...args: any[]) => Promise<any>) | { [key: string]: any | ServiceType };

export interface ServiceConfig extends BackgroundConfig {
    name: string;
}

export type ServiceOptions = ServiceConfig & EntrypointOptions;

export type ServiceEntrypointOptions = Partial<ServiceOptions>;

export type ServiceInit<T extends ServiceType> = (options: ServiceOptions) => T;

export type ServiceMain<T extends ServiceType> = (service: T, options: ServiceOptions) => Awaiter<void>;

export type ServiceDefinition<T extends ServiceType> = ServiceEntrypointOptions & {
    init?: ServiceInit<T>;
    main?: ServiceMain<T>;
};

export type ServiceUnresolvedDefinition<T extends ServiceType> = Partial<ServiceDefinition<T>>;

export type ServiceResolvedDefinition<T extends ServiceType> = Required<ServiceDefinition<T>, 'name' | 'init'>;

export type ServiceBuilder = EntrypointBuilder;

export type ProxyService<T> = {
    [K in keyof T]:
    T[K] extends (...args: any[]) => any
        ? (...args: Parameters<T[K]>) => Promise<Awaited<ReturnType<T[K]>>>
        : T[K] extends object
            ? ProxyService<T[K]>
            : () => Promise<Awaited<T[K]>>;
};
