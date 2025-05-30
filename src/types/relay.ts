import get from "get-value";
import {Required} from "utility-types";

import {ContentScriptConfig} from "@typing/content";
import {EntrypointBuilder, EntrypointOptions} from "@typing/entrypoint";
import {TransportConfig, TransportType} from "@typing/transport";
import {Awaiter} from "@typing/helpers";

export const RelayGlobalKey = 'adnbnRelay';

export type PropertyOptions = {
    path?: string,
    args?: any[],
    getOptions?: get.Options,
}

export type RelayConfig = TransportConfig & ContentScriptConfig;

export type RelayOptions = RelayConfig & EntrypointOptions;

export type RelayEntrypointOptions = Partial<RelayOptions>;

export type RelayInitGetter<T extends TransportType> = (options: RelayOptions) => T;

export type RelayMainHandler<T extends TransportType> = (relay: T, options: RelayOptions) => Awaiter<void>;

export type RelayDefinition<T extends TransportType> = RelayEntrypointOptions & {
    init?: RelayInitGetter<T>;
    main?: RelayMainHandler<T>;
};

export type RelayUnresolvedDefinition<T extends TransportType> = Partial<RelayDefinition<T>>;

export type RelayResolvedDefinition<T extends TransportType> = Required<RelayDefinition<T>, 'name' | 'init'>;

export type RelayBuilder = EntrypointBuilder;
