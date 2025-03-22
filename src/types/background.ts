import {EntrypointBuilder, EntrypointFile, EntrypointOptions} from "@typing/entrypoint";
import {Awaiter} from "@typing/helpers";

export interface BackgroundConfig {
    persistent?: boolean;
}

export type BackgroundOptions = BackgroundConfig & EntrypointOptions;

export type BackgroundEntrypointOptions = BackgroundOptions;

export type BackgroundMainHandler = (options: BackgroundOptions) => Awaiter<void>;

export interface BackgroundDefinition extends BackgroundEntrypointOptions {
    main?: BackgroundMainHandler;
}

export type BackgroundEntrypointMap = Map<EntrypointFile, BackgroundDefinition>;

export type BackgroundBuilder = EntrypointBuilder;