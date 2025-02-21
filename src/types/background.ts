import {EntrypointFile, EntrypointOptions} from "@typing/entrypoint";

export interface BackgroundConfig {
    persistent?: boolean;
}

export type BackgroundEntrypointOptions = BackgroundConfig & EntrypointOptions;

export interface BackgroundDefinition extends BackgroundEntrypointOptions {
    main?(options: BackgroundEntrypointOptions): any;
}

export type BackgroundEntrypointMap = Map<EntrypointFile, BackgroundDefinition>;