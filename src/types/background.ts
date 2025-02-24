import {EntrypointFile, EntrypointOptions} from "@typing/entrypoint";

export interface BackgroundConfig {
    persistent?: boolean;
}

export type BackgroundOptions = BackgroundConfig & EntrypointOptions;

export type BackgroundEntrypointOptions = BackgroundOptions;

export interface BackgroundDefinition extends BackgroundEntrypointOptions {
    main?(options: BackgroundOptions): any;
}

export type BackgroundEntrypointMap = Map<EntrypointFile, BackgroundDefinition>;