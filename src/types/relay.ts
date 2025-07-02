import {EntrypointOptions} from "@typing/entrypoint";
import {ContentScriptConfig, ContentScriptContext, ContentScriptDefinition} from "@typing/content";
import {TransportConfig, TransportDefinition, TransportType} from "@typing/transport";
import {Awaiter} from "@typing/helpers";

export const RelayGlobalKey = "adnbnRelay";

export type RelayConfig = TransportConfig & ContentScriptConfig;

export type RelayOptions = RelayConfig & EntrypointOptions;

export type RelayEntrypointOptions = Partial<RelayOptions>;

export type RelayMainHandler<T extends TransportType> = (
    relay: T,
    context: ContentScriptContext,
    options: RelayEntrypointOptions
) => Awaiter<void>;

export interface RelayDefinition<T extends TransportType>
    extends Omit<TransportDefinition<RelayOptions, T>, "main">,
        Omit<ContentScriptDefinition, "main">,
        Omit<RelayEntrypointOptions, "declarative"> {
    main?: RelayMainHandler<T>;
}

export type RelayUnresolvedDefinition<T extends TransportType> = Partial<RelayDefinition<T>>;
