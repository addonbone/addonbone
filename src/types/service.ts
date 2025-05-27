import {Required} from "utility-types";

import {EntrypointBuilder, EntrypointOptions} from "@typing/entrypoint";
import {BackgroundConfig} from "@typing/background";
import {TransportType} from "@typing/transport";
import {Awaiter} from "@typing/helpers";

export const ServiceGlobalKey = 'adnbnService';

export interface ServiceConfig extends BackgroundConfig {
    name: string;
}

export type ServiceOptions = ServiceConfig & EntrypointOptions;

export type ServiceEntrypointOptions = Partial<ServiceOptions>;

export type ServiceInitGetter<T extends TransportType> = (options: ServiceOptions) => T;

export type ServiceMainHandler<T extends TransportType> = (service: T, options: ServiceOptions) => Awaiter<void>;

export type ServiceDefinition<T extends TransportType> = ServiceEntrypointOptions & {
    init?: ServiceInitGetter<T>;
    main?: ServiceMainHandler<T>;
};

export type ServiceUnresolvedDefinition<T extends TransportType> = Partial<ServiceDefinition<T>>;

export type ServiceResolvedDefinition<T extends TransportType> = Required<ServiceDefinition<T>, 'name' | 'init'>;

export type ServiceBuilder = EntrypointBuilder;
