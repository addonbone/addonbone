import {BackgroundConfig} from "@typing/background";
import {EntrypointOptions} from "@typing/entrypoint";
import {TransportConfig, TransportDefinition, TransportType} from "@typing/transport";

export const ServiceGlobalKey = "adnbnService";

export type ServiceConfig = TransportConfig & BackgroundConfig;

export type ServiceOptions = ServiceConfig & EntrypointOptions;

export type ServiceEntrypointOptions = Partial<ServiceOptions>;

export type ServiceDefinition<T extends TransportType> = TransportDefinition<ServiceOptions, T> &
    ServiceEntrypointOptions;

export type ServiceUnresolvedDefinition<T extends TransportType> = Partial<ServiceDefinition<T>>;
